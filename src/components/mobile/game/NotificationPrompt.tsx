import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "cricket-bingo-notif-dismissed";
const SW_PATH = "/notification-sw.js";

function isDismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function isSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator;
}

export function NotificationPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isSupported() || isDismissed()) return;
    if (Notification.permission === "granted") return; // already enabled
    if (Notification.permission === "denied") return; // blocked, don't ask

    // Show prompt after a short delay so it doesn't overwhelm on first load
    const timer = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleEnable = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        // Register a minimal service worker for scheduling
        await navigator.serviceWorker.register(SW_PATH);
        // Schedule a test notification
        new Notification("Cricket Bingo", {
          body: "Notifications enabled! You'll be reminded about new daily puzzles.",
          icon: "/favicon.ico",
        });
      }
    } catch {
      // Permission denied or error
    }
    dismiss();
  };

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {}
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="fixed bottom-20 sm:bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50"
        >
          <div className="glass-card rounded-xl p-4 border border-primary/30 shadow-lg shadow-primary/10">
            <button
              onClick={dismiss}
              className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-secondary">Daily Reminder</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Get notified when a new daily puzzle drops at midnight!
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleEnable}
                    className="px-3 py-1.5 rounded-lg text-xs font-display uppercase tracking-wider bg-primary/20 border border-primary/40 text-primary hover:bg-primary/30 transition-colors"
                  >
                    Enable
                  </button>
                  <button
                    onClick={dismiss}
                    className="px-3 py-1.5 rounded-lg text-xs font-display uppercase tracking-wider border border-border/30 text-muted-foreground hover:text-secondary transition-colors"
                  >
                    Not Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
