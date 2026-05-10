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

  const { uid, packId } = req.body ?? {};

  if (!uid || typeof uid !== "string") {
    return res.status(400).json({ error: "Missing uid" });
  }
  if (!packId || !COIN_PACKS[packId]) {
    return res.status(400).json({ error: "Invalid packId" });
  }

  const pack = COIN_PACKS[packId];
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) {
    return res.status(500).json({ error: "Razorpay keys not configured" });
  }

  const credentials = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const body = JSON.stringify({
    amount: pack.amountPaise,
    currency: "INR",
    receipt: `rcpt_${Date.now().toString(36)}`,
    notes: { uid, packId },
  });

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${credentials}`,
    },
    body,
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("Razorpay order creation failed:", err);
    return res.status(502).json({ error: "Failed to create order" });
  }

  const order = await response.json();

  return res.status(200).json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
  });
}
