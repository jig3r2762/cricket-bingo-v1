import { useState, memo } from "react";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import type { GridCategory, CricketPlayer } from "@/types/game";

// --- Flag images (flagcdn.com — reliable public CDN) ---
const FLAG_IMAGES: Record<string, string> = {
  country_ind: "https://flagcdn.com/w160/in.png",
  country_aus: "https://flagcdn.com/w160/au.png",
  country_eng: "https://flagcdn.com/w160/gb.png",
  country_sa:  "https://flagcdn.com/w160/za.png",
  country_nz:  "https://flagcdn.com/w160/nz.png",
  country_pak: "https://flagcdn.com/w160/pk.png",
  country_sl:  "https://flagcdn.com/w160/lk.png",
  country_wi:  "https://flagcdn.com/w160/jm.png", // Jamaica flag for West Indies
};

// --- IPL team logos (official iplt20.com CDN) ---
const TEAM_LOGOS: Record<string, string> = {
  team_mi:   "https://documents.iplt20.com/ipl/MI/Logos/Logooutline/MIoutline.png",
  team_csk:  "https://documents.iplt20.com/ipl/CSK/logos/Logooutline/CSKoutline.png",
  team_rcb:  "https://documents.iplt20.com/ipl/RCB/Logos/Logooutline/RCBoutline.png",
  team_dc:   "https://documents.iplt20.com/ipl/DC/Logos/LogoOutline/DCoutline.png",
  team_srh:  "https://documents.iplt20.com/ipl/SRH/Logos/Logooutline/SRHoutline.png",
  team_rr:   "https://documents.iplt20.com/ipl/RR/Logos/Logooutline/RRoutline.png",
  team_kkr:  "https://documents.iplt20.com/ipl/KKR/Logos/Logooutline/KKRoutline.png",
  team_pbks: "https://documents.iplt20.com/ipl/PBKS/Logos/Logooutline/PBKSoutline.png",
  team_gt:   "https://documents.iplt20.com/ipl/GT/Logos/Logooutline/GToutline.png",
  team_lsg:  "https://documents.iplt20.com/ipl/LSG/Logos/Logooutline/LSGoutline.png",
};

// --- Teammate player images (Wikimedia Commons, CC licensed) ---
const PLAYER_IMAGES: Record<string, { url: string; name: string }> = {
  tm_dhoni: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/MS_Dhoni_%28Prabhav_%2723_-_RiGI_2023%29.jpg/250px-MS_Dhoni_%28Prabhav_%2723_-_RiGI_2023%29.jpg",
    name: "Dhoni",
  },
  tm_kohli: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Virat_Kohli_in_PMO_New_Delhi.jpg/250px-Virat_Kohli_in_PMO_New_Delhi.jpg",
    name: "Kohli",
  },
  tm_sachin: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/The_cricket_legend_Sachin_Tendulkar_at_the_Oval_Maidan_in_Mumbai_During_the_Duke_and_Duchess_of_Cambridge_Visit%2826271019082%29.jpg/250px-The_cricket_legend_Sachin_Tendulkar_at_the_Oval_Maidan_in_Mumbai_During_the_Duke_and_Duchess_of_Cambridge_Visit%2826271019082%29.jpg",
    name: "Sachin",
  },
};

// --- SVG icons for roles, stats, trophies ---
function CricketBatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <rect x="28" y="4" width="8" height="36" rx="4" fill="#d4a574" stroke="#8B6914" strokeWidth="1.5"/>
      <rect x="26" y="36" width="12" height="18" rx="2" fill="#c4956a" stroke="#8B6914" strokeWidth="1.5"/>
      <rect x="30" y="54" width="4" height="6" rx="1" fill="#8B6914"/>
      <line x1="32" y1="38" x2="32" y2="52" stroke="#8B6914" strokeWidth="0.8" opacity="0.4"/>
    </svg>
  );
}

function BowlerIcon({ className, isSpin }: { className?: string; isSpin?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <circle cx="32" cy="32" r="10" fill="#cc2222" stroke="#991111" strokeWidth="1.5"/>
      <path d="M 22 32 Q 32 22 42 32" stroke="white" strokeWidth="1.5" fill="none"/>
      <path d="M 22 32 Q 32 42 42 32" stroke="white" strokeWidth="1.5" fill="none"/>
      {isSpin ? (
        <path d="M 18 20 Q 28 14 38 20 Q 48 26 44 38" stroke="#ffaa00" strokeWidth="2" fill="none" strokeDasharray="3 2"/>
      ) : (
        <path d="M 20 14 L 32 20 L 32 22" stroke="#ffaa00" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      )}
    </svg>
  );
}

function WicketKeeperIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <ellipse cx="32" cy="36" rx="14" ry="10" fill="#c4956a" stroke="#8B6914" strokeWidth="1.5"/>
      <path d="M 18 36 Q 18 20 32 20 Q 46 20 46 36" fill="none" stroke="#8B6914" strokeWidth="1.5"/>
      <circle cx="32" cy="32" r="3" fill="#cc2222" stroke="#991111" strokeWidth="1"/>
    </svg>
  );
}

function AllRounderIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <rect x="16" y="10" width="6" height="28" rx="3" fill="#d4a574" stroke="#8B6914" strokeWidth="1"/>
      <rect x="14" y="34" width="10" height="14" rx="2" fill="#c4956a" stroke="#8B6914" strokeWidth="1"/>
      <circle cx="44" cy="28" r="8" fill="#cc2222" stroke="#991111" strokeWidth="1.5"/>
      <path d="M 36 28 Q 44 20 52 28" stroke="white" strokeWidth="1.2" fill="none"/>
      <path d="M 28 52 L 32 48 L 36 52" stroke="#ffaa00" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function TrophyIcon({ className, color = "#FFD700" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <path d="M 20 12 L 20 30 Q 20 42 32 44 Q 44 42 44 30 L 44 12 Z" fill={color} stroke="#B8860B" strokeWidth="1.5"/>
      <path d="M 20 16 Q 10 16 10 24 Q 10 30 20 30" fill="none" stroke="#B8860B" strokeWidth="1.5"/>
      <path d="M 44 16 Q 54 16 54 24 Q 54 30 44 30" fill="none" stroke="#B8860B" strokeWidth="1.5"/>
      <rect x="28" y="44" width="8" height="6" fill="#B8860B"/>
      <rect x="24" y="50" width="16" height="4" rx="1" fill="#B8860B"/>
      <path d="M 26 20 L 32 16 L 38 20 L 36 28 L 28 28 Z" fill="#FFF8DC" opacity="0.4"/>
    </svg>
  );
}

function StatsIcon({ className, label }: { className?: string; label: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <rect x="10" y="38" width="10" height="18" rx="2" fill="#22c55e" opacity="0.7"/>
      <rect x="24" y="26" width="10" height="30" rx="2" fill="#22c55e" opacity="0.85"/>
      <rect x="38" y="14" width="10" height="42" rx="2" fill="#22c55e"/>
      <text x="32" y="10" textAnchor="middle" fontSize="7" fill="#94a3b8" fontFamily="Oswald,sans-serif" fontWeight="600">{label}</text>
    </svg>
  );
}

function StadiumIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <ellipse cx="32" cy="44" rx="26" ry="10" fill="#166534" stroke="#15803d" strokeWidth="1.5"/>
      <path d="M 6 44 L 6 24 Q 6 14 16 10 L 20 8" stroke="#94a3b8" strokeWidth="1.5" fill="none"/>
      <path d="M 58 44 L 58 24 Q 58 14 48 10 L 44 8" stroke="#94a3b8" strokeWidth="1.5" fill="none"/>
      <path d="M 20 8 Q 32 4 44 8" stroke="#94a3b8" strokeWidth="1.5" fill="none"/>
      <rect x="14" y="34" width="2" height="10" fill="#d4d4d4"/>
      <rect x="48" y="34" width="2" height="10" fill="#d4d4d4"/>
      <rect x="31" y="34" width="2" height="10" fill="#d4d4d4"/>
    </svg>
  );
}

// Map shortLabel → icon component
const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  PACER:      <BowlerIcon className="w-10 h-10 sm:w-12 sm:h-12" />,
  SPINNER:    <BowlerIcon className="w-10 h-10 sm:w-12 sm:h-12" isSpin />,
  "ALL-RTR":  <AllRounderIcon className="w-10 h-10 sm:w-12 sm:h-12" />,
  WK:         <WicketKeeperIcon className="w-10 h-10 sm:w-12 sm:h-12" />,
  BAT:        <CricketBatIcon className="w-10 h-10 sm:w-12 sm:h-12" />,
  IPL:        <TrophyIcon className="w-10 h-10 sm:w-12 sm:h-12" color="#FFD700" />,
  CWC:        <TrophyIcon className="w-10 h-10 sm:w-12 sm:h-12" color="#C0C0C0" />,
  T20WC:      <TrophyIcon className="w-10 h-10 sm:w-12 sm:h-12" color="#CD7F32" />,
  CT:         <TrophyIcon className="w-10 h-10 sm:w-12 sm:h-12" color="#E5C100" />,
  "10K RUNS": <StatsIcon className="w-10 h-10 sm:w-12 sm:h-12" label="10K" />,
  "5K ODI":   <StatsIcon className="w-10 h-10 sm:w-12 sm:h-12" label="5K" />,
  "300 WKTS": <StatsIcon className="w-10 h-10 sm:w-12 sm:h-12" label="300" />,
  "100s":     <StatsIcon className="w-10 h-10 sm:w-12 sm:h-12" label="100" />,
  "50 TESTS": <StadiumIcon className="w-10 h-10 sm:w-12 sm:h-12" />,
  "1K IPL":   <StatsIcon className="w-10 h-10 sm:w-12 sm:h-12" label="1K" />,
};

// --- Team abbr map for combo lookups ---
const TEAM_ABBR_MAP: Record<string, string> = {
  MI: "team_mi", CSK: "team_csk", RCB: "team_rcb", DC: "team_dc",
  SRH: "team_srh", RR: "team_rr", KKR: "team_kkr", PBKS: "team_pbks",
  GT: "team_gt", LSG: "team_lsg",
};

// --- Combo visual ---
function ComboVisual({ category }: { category: GridCategory }) {
  // Extract parts from validatorKey like "combo:team:MI+country:India"
  const body = category.validatorKey.slice("combo:".length);
  const parts = body.split("+");

  const visuals = parts.map((part, i) => {
    const [type, value] = [part.split(":")[0], part.split(":").slice(1).join(":")];
    if (type === "team") {
      const teamId = TEAM_ABBR_MAP[value];
      const logoUrl = teamId ? TEAM_LOGOS[teamId] : null;
      if (logoUrl) {
        return <img key={i} src={logoUrl} alt={value} className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />;
      }
    }
    if (type === "country") {
      const countryId = `country_${value.slice(0, 3).toLowerCase()}`;
      const flagUrl = FLAG_IMAGES[countryId];
      if (flagUrl) {
        return <img key={i} src={flagUrl} alt={value} className="w-7 h-5 sm:w-8 sm:h-6 rounded-sm object-cover" />;
      }
    }
    return null;
  });

  const hasVisual = visuals.some(Boolean);
  if (!hasVisual) {
    const icon = CATEGORY_ICON_MAP[category.shortLabel];
    return icon ? <>{icon}</> : <HelpCircle className="w-6 h-6 text-muted-foreground/60" />;
  }

  return (
    <div className="flex items-center gap-1">
      {visuals.map((v, i) => (
        <span key={i}>{v || <span className="text-xs text-muted-foreground">+</span>}</span>
      ))}
    </div>
  );
}

interface BingoCellProps {
  category: GridCategory;
  placedPlayer?: CricketPlayer | null;
  feedbackState?: "correct" | "wrong" | null;
  onClick: () => void;
  index: number;
  isEligible?: boolean;
  isRecommended?: boolean;
  isWildcardTarget?: boolean;
  isWinLine?: boolean;
}

export const BingoCell = memo(function BingoCell({
  category, placedPlayer, feedbackState, onClick, index,
  isEligible, isRecommended, isWildcardTarget, isWinLine,
}: BingoCellProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Determine what visual to show for an empty cell
  const flagUrl = FLAG_IMAGES[category.id];
  const teamLogo = TEAM_LOGOS[category.id];
  const playerImg = PLAYER_IMAGES[category.id];
  const categoryIcon = CATEGORY_ICON_MAP[category.shortLabel];
  const isCombo = category.type === "combo";

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03, type: "spring", stiffness: 400, damping: 22 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative w-full aspect-square rounded-xl transition-[box-shadow,transform] duration-200
        flex flex-col items-center justify-center gap-0.5 p-1 text-center overflow-hidden
        ${placedPlayer
          ? "glass-cell-filled cursor-default"
          : "glass-cell cursor-pointer hover:border-accent/50"
        }
        ${feedbackState === "correct" ? "animate-cell-correct" : ""}
        ${feedbackState === "wrong" ? "animate-cell-wrong" : ""}
        ${isWildcardTarget && !placedPlayer ? "border-yellow-400/70 shadow-[0_0_8px_rgba(250,204,21,0.25)]" : ""}
        ${isWinLine ? "ring-2 ring-[hsl(var(--neon-green))] shadow-[0_0_20px_hsl(var(--neon-green)/0.5)]" : ""}
        ${isHovered && !placedPlayer ? "scale-[1.04] -translate-y-0.5 brightness-110" : ""}
      `}
    >
      {/* Sparkle particles on correct */}
      {feedbackState === "correct" && (
        <>
          {[...Array(6)].map((_, i) => (
            <span
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-neon-green animate-sparkle"
              style={{
                top: `${15 + Math.random() * 70}%`,
                left: `${10 + Math.random() * 80}%`,
                animationDelay: `${i * 0.07}s`,
              }}
            />
          ))}
        </>
      )}

      {placedPlayer ? (
        /* --- Filled cell: show placed player --- */
        <div className="flex flex-col items-center gap-0.5 animate-pop-in">
          <span className="text-2xl sm:text-3xl leading-none">{placedPlayer.countryFlag}</span>
          <span className="font-display text-[9px] sm:text-[10px] text-primary font-bold uppercase tracking-wider truncate w-full leading-tight">
            {placedPlayer.name.split(" ").pop()}
          </span>
          <span className="text-[8px] text-muted-foreground uppercase tracking-wider">{category.shortLabel}</span>
        </div>
      ) : (
        /* --- Empty cell: show category visual --- */
        <>
          {flagUrl ? (
            /* Country flag image */
            <img
              src={flagUrl}
              alt={category.label}
              className="w-12 h-8 sm:w-14 sm:h-10 rounded-sm object-cover shadow-sm"
            />
          ) : teamLogo ? (
            /* IPL team official logo */
            <img
              src={teamLogo}
              alt={category.label}
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
            />
          ) : playerImg ? (
            /* Teammate player image */
            <img
              src={playerImg.url}
              alt={playerImg.name}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-accent/30"
              onError={(e) => {
                // Fallback to initials if image fails to load
                const target = e.currentTarget;
                target.style.display = "none";
                target.nextElementSibling?.classList.remove("hidden");
              }}
            />
          ) : isCombo ? (
            /* Combo visual */
            <ComboVisual category={category} />
          ) : categoryIcon ? (
            /* SVG icon for roles/stats/trophies */
            categoryIcon
          ) : (
            /* Default icon */
            <HelpCircle className="w-6 h-6 sm:w-7 sm:h-7 text-muted-foreground/60" />
          )}

          {/* Hidden initials fallback for player images */}
          {playerImg && (
            <div className="hidden w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent/20 border-2 border-accent/30 items-center justify-center font-display font-bold text-accent text-sm">
              {playerImg.name[0]}
            </div>
          )}

          <span className="font-display text-[8px] sm:text-[10px] text-muted-foreground font-semibold uppercase tracking-wider leading-tight mt-0.5">
            {category.shortLabel}
          </span>
        </>
      )}

      {/* Wrong feedback red overlay */}
      {feedbackState === "wrong" && (
        <div className="absolute inset-0 bg-destructive/15 rounded-xl pointer-events-none border-2 border-destructive/40" />
      )}
    </motion.button>
  );
});
