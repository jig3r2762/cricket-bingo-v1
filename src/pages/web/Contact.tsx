import { Link } from "react-router-dom";
import { useSeoHead } from "@/lib/useSeoHead";
import { ThemeToggle } from "@/components/web/ThemeToggle";
import { Mail, MessageSquare } from "lucide-react";

export default function Contact() {
  useSeoHead({
    title: "Contact Us — Cricket Bingo",
    description:
      "Get in touch with the Cricket Bingo support team. Send us queries, report bugs, or submit feedback regarding our online cricket immaculate grid game.",
    canonical: "https://cricket-bingo.in/contact",
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
          <span className="text-muted-foreground font-body">Contact Us</span>
        </nav>

        <h1 className="font-display text-4xl text-foreground mt-2 mb-2">Contact Us</h1>

        <div className="space-y-6 text-muted-foreground font-body text-sm leading-relaxed mt-6">
          <p>
            Have a question, feedback, or need help with Cricket Bingo? We would love to hear from you. 
            Whether you found a bug in a player's statistics, want to suggest new categories for the immaculate grid, 
            or have business inquiries, feel free to reach out.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mt-8">
            <div className="candy-card p-6 rounded-2xl border border-border/80 bg-card flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-candy-green/10 border-2 border-candy-green/20 flex items-center justify-center text-candy-green shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-base font-bold text-foreground uppercase tracking-wider leading-none">
                  Email Support
                </h3>
                <p className="text-xs text-muted-foreground leading-normal pt-1">
                  For support, bug reports, data corrections, or account deletion requests:
                </p>
                <a href="mailto:sjigar2762@gmail.com" className="text-candy-green hover:underline text-xs font-bold block pt-1">
                  sjigar2762@gmail.com
                </a>
              </div>
            </div>

            <div className="candy-card p-6 rounded-2xl border border-border/80 bg-card flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-candy-orange/10 border-2 border-candy-orange/20 flex items-center justify-center text-candy-orange shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-base font-bold text-foreground uppercase tracking-wider leading-none">
                  Feedback & Queries
                </h3>
                <p className="text-xs text-muted-foreground leading-normal pt-1">
                  For category ideas, game improvements, or general comments:
                </p>
                <a href="mailto:sjigar2762@gmail.com" className="text-candy-orange hover:underline text-xs font-bold block pt-1">
                  sjigar2762@gmail.com
                </a>
              </div>
            </div>
          </div>

          <h2 className="font-display text-xl text-foreground pt-4">Data Corrections</h2>
          <p>
            Our player dataset is derived from open-source cricket match records. If you notice a player's statistics are incorrect 
            or out of date, please send us an email with details about the player (name, ID) and the specific stat correction needed. 
            We update our database periodically to ensure accurate game validations.
          </p>
        </div>

        <footer className="border-t-2 border-border pt-6 mt-12 text-center">
          <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground mb-3">
            <Link to="/" className="hover:text-candy-green transition-colors font-body font-bold">Home</Link>
            <Link to="/about" className="hover:text-candy-green transition-colors font-body font-bold">About</Link>
            <Link to="/how-to-play" className="hover:text-candy-green transition-colors font-body font-bold">How to Play</Link>
            <Link to="/players" className="hover:text-candy-green transition-colors font-body font-bold">Players</Link>
            <Link to="/privacy" className="hover:text-candy-green transition-colors font-body font-bold">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-candy-green transition-colors font-body font-bold">Terms of Service</Link>
          </div>
          <p className="text-muted-foreground font-body text-xs">
            Cricket Bingo &copy; 2025 &middot; Free online cricket immaculate grid quiz game
          </p>
        </footer>
      </div>
    </div>
  );
}
