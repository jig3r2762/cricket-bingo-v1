import { db } from "@/lib/firebase";
import {
  doc, setDoc, updateDoc, getDoc, onSnapshot, serverTimestamp,
} from "firebase/firestore";
import type { GridCategory } from "@/types/game";

// 6-char uppercase room code (avoids ambiguous chars)
function generateRoomId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export interface PlayerProgress {
  placements: Record<string, string>; // catId → playerId string
  score: number;
  filledCount: number;
  status: "playing" | "won" | "lost";
}

export interface RoomData {
  status: "waiting" | "playing" | "finished";
  gridSize: 3 | 4;
  grid: GridCategory[];
  deckIds: string[];
  hostUid: string;
  hostName: string;
  guestUid: string | null;
  guestName: string | null;
  host: PlayerProgress;
  guest: PlayerProgress | null;
}

// Create a new room and return its ID
export async function createRoom(
  gridSize: 3 | 4,
  grid: GridCategory[],
  deckIds: string[],
  hostUid: string,
  hostName: string
): Promise<string> {
  let roomId = generateRoomId();
  for (let i = 0; i < 5; i++) {
    const snap = await getDoc(doc(db, "rooms", roomId));
    if (!snap.exists()) break;
    roomId = generateRoomId();
  }

  await setDoc(doc(db, "rooms", roomId), {
    status: "waiting",
    gridSize,
    grid,
    deckIds,
    hostUid,
    hostName,
    guestUid: null,
    guestName: null,
    host: { placements: {}, score: 0, filledCount: 0, status: "playing" },
    guest: null,
    createdAt: serverTimestamp(),
  });

  return roomId;
}

// Guest joins existing room
export async function joinRoom(
  rawCode: string,
  guestUid: string,
  guestName: string
): Promise<{ data: RoomData } | { error: string }> {
  const roomId = rawCode.toUpperCase().trim();
  const ref = doc(db, "rooms", roomId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return { error: "Room not found. Check the code and try again." };

  const data = snap.data() as RoomData;
  if (data.status !== "waiting") return { error: "This game has already started." };
  if (data.guestUid !== null) return { error: "Room is full." };
  if (data.hostUid === guestUid) return { error: "You can't join your own room." };

  await updateDoc(ref, {
    guestUid,
    guestName,
    status: "playing",
    guest: { placements: {}, score: 0, filledCount: 0, status: "playing" },
  });

  return {
    data: {
      ...data,
      guestUid,
      guestName,
      status: "playing",
      guest: { placements: {}, score: 0, filledCount: 0, status: "playing" },
    },
  };
}

// Subscribe to live room updates
export function subscribeToRoom(
  roomId: string,
  callback: (data: RoomData | null) => void
): () => void {
  return onSnapshot(doc(db, "rooms", roomId), (snap) => {
    callback(snap.exists() ? (snap.data() as RoomData) : null);
  });
}

// Write my current progress after each turn
export async function updateProgress(
  roomId: string,
  role: "host" | "guest",
  progress: PlayerProgress
): Promise<void> {
  await updateDoc(doc(db, "rooms", roomId), {
    [`${role}.placements`]: progress.placements,
    [`${role}.score`]: progress.score,
    [`${role}.filledCount`]: progress.filledCount,
    [`${role}.status`]: progress.status,
  });
}
