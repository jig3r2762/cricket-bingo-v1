// Minimal service worker for daily puzzle notifications
// Schedules a notification reminder near midnight

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

// Check every hour if it's time to send the daily reminder
const INTERVAL = 60 * 60 * 1000; // 1 hour

function msUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

async function checkAndNotify() {
  const remaining = msUntilMidnight();
  // Send notification if within 1 hour of midnight
  if (remaining <= INTERVAL) {
    const clients = await self.clients.matchAll({ type: "window" });
    // Only notify if no tabs are open
    if (clients.length === 0) {
      self.registration.showNotification("Cricket Bingo", {
        body: "A new daily puzzle is almost here! Come play tomorrow's challenge.",
        icon: "/favicon.ico",
        tag: "daily-reminder", // prevents duplicates
      });
    }
  }
}

// Run check periodically
setInterval(checkAndNotify, INTERVAL);

// Handle notification click — open the app
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      if (clients.length > 0) {
        return clients[0].focus();
      }
      return self.clients.openWindow("/");
    })
  );
});
