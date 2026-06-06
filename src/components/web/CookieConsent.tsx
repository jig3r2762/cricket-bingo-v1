import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, X } from "lucide-react";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("cricket-bingo-cookie-consent");
      if (!consent) {
        // Show after a brief delay
        const timer = setTimeout(() => setShow(true), 1500);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem("cricket-bingo-cookie-consent", "accepted");
    } catch {}
    setShow(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem("cricket-bingo-cookie-consent", "declined");
    } catch {}
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50"
        >
          <div className="glass-card bg-card/95 border border-border/80 p-5 rounded-2xl shadow-2xl backdrop-blur-md space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center shrink-0 text-primary">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-sm font-black uppercase tracking-wider text-secondary leading-none">
                  Cookie & Privacy Consent
                </h3>
                <p className="text-xs text-muted-foreground leading-normal">
                  We use cookies and similar technologies to analyze traffic, personalize content, and serve relevant Google Adsense ads. Read our{" "}
                  <a href="/privacy" className="text-primary hover:underline font-bold">
                    Privacy Policy
                  </a>{" "}
                  for details.
                </p>
              </div>
              <button
                onClick={handleDecline}
                className="text-muted-foreground hover:text-secondary transition-colors shrink-0 -mt-1 -mr-1"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleAccept}
                className="flex-1 cta-chunky color-green !py-2 text-xs font-black tracking-wider text-center"
              >
                <span className="relative z-10">ACCEPT COOKIES</span>
              </button>
              <button
                onClick={handleDecline}
                className="px-4 py-2 text-xs font-display font-bold uppercase tracking-wider text-muted-foreground hover:text-secondary border border-border/40 hover:bg-muted/10 rounded-xl transition-all"
              >
                DECLINE
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
