import { FieldValue } from "firebase-admin/firestore";
import { getDb, generateRoomId } from "./_adminDb";

const VALID_FEES = [50, 100, 250, 500];

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { uid, hostName, entryFee, gridSize, grid, deckIds } = req.body ?? {};

  if (!uid) return res.status(400).json({ error: "Missing uid" });
  if (!VALID_FEES.includes(entryFee)) return res.status(400).json({ error: "Invalid entry fee" });
  if (![3, 4].includes(gridSize)) return res.status(400).json({ error: "Invalid grid size" });
  if (!Array.isArray(grid) || !Array.isArray(deckIds)) {
    return res.status(400).json({ error: "Invalid game data" });
  }

  const db = getDb();
  const userRef = db.collection("users").doc(uid);

  // Check balance upfront (pre-transaction read)
  const userSnap = await userRef.get();
  if (!userSnap.exists) return res.status(404).json({ error: "User not found" });
  if ((userSnap.data()?.coinBalance ?? 0) < entryFee) {
    return res.status(400).json({ error: "Insufficient coins" });
  }

  // Find unused room ID
  let roomId = generateRoomId();
  for (let i = 0; i < 5; i++) {
    const snap = await db.collection("rooms").doc(roomId).get();
    if (!snap.exists) break;
    roomId = generateRoomId();
  }

  const roomRef = db.collection("rooms").doc(roomId);

  try {
    await db.runTransaction(async (t) => {
      const freshUser = await t.get(userRef);
      if ((freshUser.data()?.coinBalance ?? 0) < entryFee) {
        throw new Error("INSUFFICIENT_COINS");
      }

      t.update(userRef, { coinBalance: FieldValue.increment(-entryFee) });
      t.set(roomRef, {
        status: "waiting",
        gridSize,
        grid,
        deckIds,
        hostUid: uid,
        hostName: hostName ?? "Player",
        guestUid: null,
        guestName: null,
        entryFee,
        host: { placements: {}, score: 0, filledCount: 0, status: "playing" },
        guest: null,
        hostFinish: null,
        guestFinish: null,
        payoutProcessed: false,
        refunded: false,
        createdAt: FieldValue.serverTimestamp(),
      });
    });

    return res.status(200).json({ roomId });
  } catch (err: any) {
    if (err?.message === "INSUFFICIENT_COINS") {
      return res.status(400).json({ error: "Insufficient coins" });
    }
    console.error("paid-room-create error:", err);
    return res.status(500).json({ error: "Failed to create room" });
  }
}
