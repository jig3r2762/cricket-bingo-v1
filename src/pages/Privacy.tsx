import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <div className="min-h-screen warm-bg">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Link to="/" className="text-candy-green font-body font-bold text-sm hover:underline">
          &larr; Back to Cricket Bingo
        </Link>

        <h1 className="font-display text-4xl text-foreground mt-6 mb-8">Privacy Policy</h1>

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
            <li><strong className="text-foreground">Wallet & Transactions:</strong> If you purchase coins, your transaction details (order IDs, payment IDs, amounts) are stored securely. We do not store your payment card details — payments are handled by Razorpay.</li>
          </ul>

          <h2 className="font-display text-xl text-foreground pt-2">Cookies & Advertising</h2>
          <p>
            We use Google AdSense to display advertisements. Google may use cookies and web beacons
            to serve ads based on your prior visits to this website or other websites. You can opt out of
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
            <span className="text-foreground font-semibold">privacy@cricket-bingo.in</span>
          </p>
        </div>
      </div>
    </div>
  );
}
