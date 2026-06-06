import { Link } from "react-router-dom";
import { useSeoHead } from "@/lib/useSeoHead";
import { ThemeToggle } from "@/components/mobile/ThemeToggle";

export default function Privacy() {
  useSeoHead({
    title: "Privacy Policy — Cricket Bingo",
    description:
      "Privacy Policy for Cricket Bingo. Learn how we collect, use, and protect your data when you play the free online cricket quiz game.",
    canonical: "https://cricket-bingo.in/privacy",
  });

  return (
    <div className="min-h-screen warm-bg">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-16">
        <nav className="mb-8 text-sm">
          <Link to="/" className="text-candy-green hover:underline font-body font-bold">Home</Link>
          <span className="text-muted-foreground mx-2">/</span>
          <span className="text-muted-foreground font-body">Privacy Policy</span>
        </nav>

        <h1 className="font-display text-4xl text-foreground mt-2 mb-2">Privacy Policy</h1>

        <div className="space-y-6 text-muted-foreground font-body text-sm leading-relaxed">
          <p><strong className="text-foreground">Effective Date:</strong> March 19, 2026</p>

          <p>
            Cricket Bingo ("we", "us", or "our") operates the website{" "}
            <a href="https://cricket-bingo.in" className="text-candy-green hover:underline">cricket-bingo.in</a>{" "}
            (the "Service"). This page informs you of our policies regarding the collection, use,
            and disclosure of personal data when you use our Service.
          </p>

          <h2 className="font-display text-xl text-foreground pt-2">Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong className="text-foreground">Google Sign-In:</strong> If you sign in with Google, we receive your display name, email address, and profile photo. This is used to personalize your experience and display your name on the leaderboard.</li>
            <li><strong className="text-foreground">Guest Play:</strong> If you play as a guest, no personal information is collected. A local flag is stored in your browser's localStorage.</li>
            <li><strong className="text-foreground">Game Data:</strong> Your scores, streaks, and game history are stored in Firebase Firestore, linked to your account.</li>
            <li><strong className="text-foreground">Wallet &amp; Transactions:</strong> If you purchase coins, your transaction details (order IDs, payment IDs, amounts) are stored securely. We do not store your payment card details — payments are handled by Razorpay.</li>
          </ul>

          <h2 className="font-display text-xl text-foreground pt-2">Cookies &amp; Advertising</h2>
          <p>
            We use Google AdSense to display advertisements on our content pages. Ads are not
            shown during active gameplay. Google may use cookies and web beacons to serve ads
            based on your prior visits to this website or other websites. You can opt out of
            personalized advertising by visiting{" "}
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-candy-green hover:underline">
              Google Ads Settings
            </a>.
          </p>
          <p>
            We also use Vercel Analytics and Speed Insights to understand site performance. These tools
            collect anonymized, non-personally-identifiable data.
          </p>

          <h2 className="font-display text-xl text-foreground pt-2">Third-Party Services</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong className="text-foreground">Firebase (Google):</strong> Authentication and database. <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" className="text-candy-green hover:underline">Firebase Privacy Policy</a></li>
            <li><strong className="text-foreground">Razorpay:</strong> Payment processing. <a href="https://razorpay.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-candy-green hover:underline">Razorpay Privacy Policy</a></li>
            <li><strong className="text-foreground">Google AdSense:</strong> Advertising. <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-candy-green hover:underline">Google Ads Policy</a></li>
            <li><strong className="text-foreground">Vercel:</strong> Hosting and analytics. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-candy-green hover:underline">Vercel Privacy Policy</a></li>
          </ul>

          <h2 className="font-display text-xl text-foreground pt-2">Data Retention</h2>
          <p>
            Your account data is retained as long as your account is active. If you wish to delete your
            account and associated data, please contact us at the email below.
          </p>

          <h2 className="font-display text-xl text-foreground pt-2">Children's Privacy</h2>
          <p>
            Our Service is not directed to children under 13. We do not knowingly collect personal
            information from children under 13. If you are a parent or guardian and believe your child
            has provided us with personal data, please contact us.
          </p>

          <h2 className="font-display text-xl text-foreground pt-2">Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on this page
            with an updated effective date.
          </p>

          <h2 className="font-display text-xl text-foreground pt-2">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, contact us at:{" "}
            <a href="mailto:sjigar2762@gmail.com" className="text-candy-green hover:underline">
              sjigar2762@gmail.com
            </a>
          </p>
        </div>

        <footer className="border-t-2 border-border pt-6 mt-12 text-center">
          <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground mb-3">
            <Link to="/" className="hover:text-candy-green transition-colors font-body font-bold">Home</Link>
            <Link to="/about" className="hover:text-candy-green transition-colors font-body font-bold">About</Link>
            <Link to="/how-to-play" className="hover:text-candy-green transition-colors font-body font-bold">How to Play</Link>
            <Link to="/players" className="hover:text-candy-green transition-colors font-body font-bold">Players</Link>
            <Link to="/terms" className="hover:text-candy-green transition-colors font-body font-bold">Terms of Service</Link>
          </div>
          <p className="text-muted-foreground font-body text-xs">
            Cricket Bingo &copy; 2025 &middot; Free online cricket quiz game
          </p>
        </footer>
      </div>
    </div>
  );
}
