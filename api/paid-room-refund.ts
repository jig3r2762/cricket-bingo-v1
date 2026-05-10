import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "./_adminDb";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { uid, roomId } = req.body ?? {};
  if (!uid || !roomId) return res.status(400).json({ error: "Missing fields" });

  const db = getDb();
  const roomRef = db.collection("rooms").doc(String(roomId).toUpperCase().trim());

  try {
    await db.runTransaction(async (t) => {
      const snap = await t.get(roomRef);
      if (!snap.exists) throw new Error("ROOM_NOT_FOUND");
      const room = snap.data()!;

      if (room.hostUid !== uid) throw new Error("NOT_HOST");
      if (room.status !== "waiting") throw new Error("GAME_STARTED");
      if (room.refunded) throw new Error("ALREADY_REFUNDED");

      t.update(db.collection("users").doc(uid), {
        coinBalance: FieldValue.increment(room.entryFee ?? 0),
      });
      t.update(roomRef, { status: "cancelled", refunded: true });
    });

    return res.status(200).json({ success: true });
  } catch (err: any) {
    const msgs: Record<string, string> = {
      ROOM_NOT_FOUND: "Room not found",
      NOT_HOST: "Not room host",
      GAME_STARTED: "Game already started, cannot refund",
      ALREADY_REFUNDED: "Already refunded",
    };
    const msg = msgs[err?.message];
    if (msg) return res.status(400).json({ error: msg });
    console.error("paid-room-refund error:", err);
    return res.status(500).json({ error: "Failed to refund" });
  }
}
