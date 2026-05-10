import crypto from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "./_adminDb";

const COIN_PACKS: Record<string, { coins: number; amountPaise: number }> = {
  starter: { coins: 500, amountPaise: 5000 },
  popular: { coins: 1100, amountPaise: 10000 },
  value: { coins: 3000, amountPaise: 25000 },
  mega: { coins: 7000, amountPaise: 50000 },
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, uid, packId } =
    req.body ?? {};

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return res.status(400).json({ error: "Missing payment fields" });
  }
  if (!uid || typeof uid !== "string") {
    return res.status(400).json({ error: "Missing uid" });
  }
  if (!packId || !COIN_PACKS[packId]) {
    return res.status(400).json({ error: "Invalid packId" });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!keySecret) {
    return res.status(500).json({ error: "Razorpay key not configured" });
  }

  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    return res.status(400).json({ error: "Invalid payment signature" });
  }

  const pack = COIN_PACKS[packId];

  try {
    const db = getDb();
    const userRef = db.collection("users").doc(uid);
    const txnRef = db.collection("transactions").doc();

    await db.runTransaction(async (transaction) => {
      const existingQuery = await db
        .collection("transactions")
        .where("razorpayPaymentId", "==", razorpayPaymentId)
        .limit(1)
        .get();

      if (!existingQuery.empty) throw new Error("DUPLICATE_PAYMENT");

      transaction.update(userRef, {
        coinBalance: FieldValue.increment(pack.coins),
      });

      transaction.set(txnRef, {
        uid,
        type: "deposit",
        coins: pack.coins,
        amountPaise: pack.amountPaise,
        packId,
        razorpayOrderId,
        razorpayPaymentId,
        status: "success",
        createdAt: FieldValue.serverTimestamp(),
      });
    });

    const updatedUser = await userRef.get();
    const newBalance = updatedUser.data()?.coinBalance ?? pack.coins;

    return res.status(200).json({ success: true, newBalance });
  } catch (err: any) {
    if (err?.message === "DUPLICATE_PAYMENT") {
      return res.status(409).json({ error: "Payment already processed" });
    }
    console.error("verify-payment error:", err);
    return res.status(500).json({ error: "Failed to credit coins" });
  }
}
