import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "./_adminDb";

const ERROR_MESSAGES: Record<string, string> = {
  ROOM_NOT_FOUND: "Room not found. Check the code and try again.",
  ROOM_STARTED: "This game has already started.",
  ROOM_FULL: "Room is full.",
  CANT_JOIN_OWN: "You can't join your own room.",
  INSUFFICIENT_COINS: "Insufficient coins to join this room.",
  ROOM_CANCELLED: "This room has been cancelled.",
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { uid, roomId, guestName } = req.body ?? {};
  if (!uid || !roomId) return res.status(400).json({ error: "Missing uid or roomId" });

  const db = getDb();
  const roomRef = db.collection("rooms").doc(String(roomId).toUpperCase().trim());
  const userRef = db.collection("users").doc(uid);

  let roomData: any = null;

  try {
    await db.runTransaction(async (t) => {
      const [roomSnap, userSnap] = await Promise.all([t.get(roomRef), t.get(userRef)]);

      if (!roomSnap.exists) throw new Error("ROOM_NOT_FOUND");
      const room = roomSnap.data()!;

      if (room.status === "cancelled") throw new Error("ROOM_CANCELLED");
      if (room.status !== "waiting") throw new Error("ROOM_STARTED");
      if (room.guestUid !== null) throw new Error("ROOM_FULL");
      if (room.hostUid === uid) throw new Error("CANT_JOIN_OWN");

      const balance = userSnap.data()?.coinBalance ?? 0;
      if (balance < (room.entryFee ?? 0)) throw new Error("INSUFFICIENT_COINS");

      t.update(userRef, { coinBalance: FieldValue.increment(-(room.entryFee ?? 0)) });
      t.update(roomRef, {
        guestUid: uid,
        guestName: guestName ?? "Player",
        status: "playing",
        guest: { placements: {}, score: 0, filledCount: 0, status: "playing" },
      });

      roomData = {
        ...room,
        guestUid: uid,
        guestName: guestName ?? "Player",
        status: "playing",
        guest: { placements: {}, score: 0, filledCount: 0, status: "playing" },
      };
    });

    return res.status(200).json({ data: roomData });
  } catch (err: any) {
    const msg = ERROR_MESSAGES[err?.message];
    if (msg) return res.status(400).json({ error: msg });
    console.error("paid-room-join error:", err);
    return res.status(500).json({ error: "Failed to join room" });
  }
}
