import { Link } from "react-router-dom";
import { useSeoHead } from "@/lib/useSeoHead";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Terms() {
  useSeoHead({
    title: "Terms of Service — Cricket Bingo",
    description:
      "Terms of Service for Cricket Bingo, the free online cricket quiz game. Read our usage rules, intellectual property policy, and user responsibilities.",
    canonical: "https://cricket-bingo.in/terms",
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
          <span className="text-muted-foreground font-body">Terms of Service</span>
        </nav>

        <h1 className="font-display text-4xl text-foreground mt-2 mb-2">Terms of Service</h1>
        <p className="text-muted-foreground font-body text-sm mb-10">
          <strong className="text-foreground">Effective Date:</strong> April 8, 2026
        </p>

        <div className="space-y-8 text-muted-foreground font-body text-sm leading-relaxed">

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Cricket Bingo at{" "}
              <a href="https://cricket-bingo.in" className="text-candy-green hover:underline">
                cricket-bingo.in
              </a>{" "}
              (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you
              do not agree to these Terms, please do not use the Service. Cricket Bingo is
              operated as an independent project and is not affiliated with the Board of Control
              for Cricket in India (BCCI), the International Cricket Council (ICC), or any
              cricket franchise.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">2. Description of Service</h2>
            <p className="mb-3">
              Cricket Bingo is a free-to-play online cricket knowledge game. The Service includes:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>A daily cricket quiz puzzle (Cricket Bingo classic mode)</li>
              <li>Guess the Cricketer mode</li>
              <li>Battle Mode (head-to-head against a friend or AI bot)</li>
              <li>Paid Battle Mode (optional, requires in-game coins)</li>
              <li>Global leaderboard and personal statistics</li>
              <li>A searchable database of cricket player cards</li>
            </ul>
            <p className="mt-3">
              The core game and all daily puzzles are available free of charge. Optional paid
              features (in-game coins for Paid Battle) require purchasing through our payment
              provider, Razorpay.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">3. User Accounts</h2>
            <p className="mb-3">
              You may play as a guest without creating an account. To access features such as
              the leaderboard, saved streaks, and battle rooms, you must sign in with a Google
              account.
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>You are responsible for maintaining the security of your Google account.</li>
              <li>You must not impersonate other users or use offensive display names.</li>
              <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">4. Acceptable Use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use automated scripts, bots, or cheats to manipulate game outcomes or leaderboard rankings.</li>
              <li>Attempt to reverse-engineer, decompile, or exploit the Service or its scoring system.</li>
              <li>Use the Service for any unlawful purpose or in violation of any applicable law.</li>
              <li>Interfere with or disrupt the integrity or performance of the Service.</li>
              <li>Attempt to gain unauthorized access to any part of the Service or its related systems.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">5. Intellectual Property</h2>
            <p className="mb-3">
              Cricket Bingo's game design, code, graphics, and user interface are the intellectual
              property of Cricket Bingo. All rights are reserved.
            </p>
            <p className="mb-3">
              Cricket player statistics and career data are sourced from{" "}
              <a href="https://cricsheet.org" target="_blank" rel="noopener noreferrer"
                className="text-candy-green hover:underline">Cricsheet</a>, licensed under{" "}
              <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer"
                className="text-candy-green hover:underline">Creative Commons Attribution 4.0 (CC-BY-4.0)</a>.
            </p>
            <p>
              Player names, team names, and tournament names are trademarks of their respective
              owners. Cricket Bingo uses these for informational and educational purposes only
              and does not claim any affiliation with or endorsement by any cricket board or franchise.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">6. Payments and Coins</h2>
            <p className="mb-3">
              In-game coins ("Coins") can be purchased through Razorpay. Coins have no real-world
              monetary value and cannot be withdrawn or refunded once used in a Paid Battle.
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>All purchases are final. Unused Coins may be eligible for a refund within 7 days of purchase — contact us to request one.</li>
              <li>We reserve the right to adjust Coin pricing or game mechanics at any time.</li>
              <li>Paid Battle winnings are distributed as in-game Coins only.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">7. Advertising</h2>
            <p>
              The Service displays advertisements served by Google AdSense. By using the Service,
              you acknowledge that ads may be shown on content pages. Ads are not shown during
              active gameplay. For information about how Google uses data from its ad services,
              visit{" "}
              <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer"
                className="text-candy-green hover:underline">
                How Google uses information from sites that use our services
              </a>.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">8. Disclaimer of Warranties</h2>
            <p>
              The Service is provided "as is" without warranties of any kind, either express or
              implied. We do not guarantee that the Service will be error-free, uninterrupted,
              or that the player data will always be perfectly accurate. Cricket statistics are
              subject to updates and corrections.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">9. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Cricket Bingo shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages arising from your
              use of, or inability to use, the Service. Our total liability for any claim arising
              out of these Terms shall not exceed the amount you paid us in the past 30 days.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">10. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. Continued use of the Service after
              changes are posted constitutes your acceptance of the revised Terms. We will update
              the effective date at the top of this page when changes are made.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">11. Governing Law</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of India.
              Any disputes arising under these Terms shall be subject to the exclusive jurisdiction
              of courts in India.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">12. Contact Us</h2>
            <p>
              For any questions about these Terms, please contact us at:{" "}
              <a href="mailto:sjigar2762@gmail.com" className="text-candy-green hover:underline">
                sjigar2762@gmail.com
              </a>
            </p>
          </section>
        </div>

        <footer className="border-t-2 border-border pt-6 mt-12 text-center">
          <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground mb-3">
            <Link to="/" className="hover:text-candy-green transition-colors font-body font-bold">Home</Link>
            <Link to="/about" className="hover:text-candy-green transition-colors font-body font-bold">About</Link>
            <Link to="/how-to-play" className="hover:text-candy-green transition-colors font-body font-bold">How to Play</Link>
            <Link to="/privacy" className="hover:text-candy-green transition-colors font-body font-bold">Privacy Policy</Link>
          </div>
          <p className="text-muted-foreground font-body text-xs">
            Cricket Bingo &copy; 2025 &middot; Free online cricket quiz game
          </p>
        </footer>
      </div>
    </div>
  );
}
