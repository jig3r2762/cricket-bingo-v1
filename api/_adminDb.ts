import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export function getDb() {
  if (getApps().length === 0) {
    const json = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
    if (!json) throw new Error("FIREBASE_SERVICE_ACCOUNT not set");
    initializeApp({ credential: cert(JSON.parse(json)) });
  }
  return getFirestore();
}

export function generateRoomId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
