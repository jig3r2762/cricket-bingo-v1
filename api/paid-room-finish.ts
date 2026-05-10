import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "./_adminDb";

function determineWinner(
  hostFinish: { score: number; status: string },
  guestFinish: { score: number; status: string }
): "host" | "guest" | "draw" {
  const hWon = hostFinish.status === "won";
  const gWon = guestFinish.status === "won";
  if (hWon && !gWon) return "host";
  if (gWon && !hWon) return "guest";
  if (hostFinish.score > guestFinish.score) return "host";
  if (guestFinish.score > hostFinish.score) return "guest";
  return "draw";
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { uid, roomId, score, filledCount, status } = req.body ?? {};
  if (!uid || !roomId) return res.status(400).json({ error: "Missing fields" });

  const db = getDb();
  const roomRef = db.collection("rooms").doc(String(roomId).toUpperCase().trim());

  let result: any = { waiting: true };

  try {
    await db.runTransaction(async (t) => {
      const roomSnap = await t.get(roomRef);
      if (!roomSnap.exists) throw new Error("ROOM_NOT_FOUND");
      const room = roomSnap.data()!;

      // Already processed — return cached outcome
      if (room.payoutProcessed) {
        const iWon = room.winnerId === uid;
        const isDraw = room.winnerId === null;
        result = {
          success: true,
          coinsEarned: isDraw ? 0 : iWon ? room.entryFee : -room.entryFee,
          outcome: isDraw ? "draw" : iWon ? "win" : "lose",
        };
        return;
      }

      const isHost = room.hostUid === uid;
      const finishKey = isHost ? "hostFinish" : "guestFinish";
      const finishData = {
        score: score ?? 0,
        filledCount: filledCount ?? 0,
        status: status ?? "lost",
      };

      t.update(roomRef, { [finishKey]: finishData });

      const hostFinish = isHost ? finishData : room.hostFinish;
      const guestFinish = isHost ? room.guestFinish : finishData;

      // Still waiting for other player
      if (!hostFinish || !guestFinish) {
        result = { waiting: true };
        return;
      }

      // Both done — resolve
      const outcome = determineWinner(hostFinish, guestFinish);
      const entryFee = room.entryFee ?? 0;
      let winnerId: string | null = null;

      if (outcome === "host") {
        winnerId = room.hostUid;
        t.update(db.collection("users").doc(room.hostUid), {
          coinBalance: FieldValue.increment(entryFee * 2),
        });
      } else if (outcome === "guest") {
        winnerId = room.guestUid;
        t.update(db.collection("users").doc(room.guestUid), {
          coinBalance: FieldValue.increment(entryFee * 2),
        });
      } else {
        // Draw — refund both
        t.update(db.collection("users").doc(room.hostUid), {
          coinBalance: FieldValue.increment(entryFee),
        });
        t.update(db.collection("users").doc(room.guestUid), {
          coinBalance: FieldValue.increment(entryFee),
        });
      }

      t.update(roomRef, { payoutProcessed: true, winnerId, status: "finished" });

      const iWon = winnerId === uid;
      const isDraw = winnerId === null;
      result = {
        success: true,
        coinsEarned: isDraw ? 0 : iWon ? entryFee : -entryFee,
        outcome: isDraw ? "draw" : iWon ? "win" : "lose",
        winnerId,
      };
    });

    return res.status(200).json(result);
  } catch (err: any) {
    if (err?.message === "ROOM_NOT_FOUND") {
      return res.status(404).json({ error: "Room not found" });
    }
    console.error("paid-room-finish error:", err);
    return res.status(500).json({ error: "Failed to process result" });
  }
}
