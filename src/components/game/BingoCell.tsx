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
  // IPL Mode country categories use category.id directly
  ipl_indian: "https://flagcdn.com/w160/in.png",
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
  // IPL Mode uses ipl_team_* IDs — same logos
  ipl_team_mi:   "https://documents.iplt20.com/ipl/MI/Logos/Logooutline/MIoutline.png",
  ipl_team_csk:  "https://documents.iplt20.com/ipl/CSK/logos/Logooutline/CSKoutline.png",
  ipl_team_rcb:  "https://documents.iplt20.com/ipl/RCB/Logos/Logooutline/RCBoutline.png",
  ipl_team_dc:   "https://documents.iplt20.com/ipl/DC/Logos/LogoOutline/DCoutline.png",
  ipl_team_srh:  "https://documents.iplt20.com/ipl/SRH/Logos/Logooutline/SRHoutline.png",
  ipl_team_rr:   "https://documents.iplt20.com/ipl/RR/Logos/Logooutline/RRoutline.png",
  ipl_team_kkr:  "https://documents.iplt20.com/ipl/KKR/Logos/Logooutline/KKRoutline.png",
  ipl_team_pbks: "https://documents.iplt20.com/ipl/PBKS/Logos/Logooutline/PBKSoutline.png",
  ipl_team_gt:   "https://documents.iplt20.com/ipl/GT/Logos/Logooutline/GToutline.png",
  ipl_team_lsg:  "https://documents.iplt20.com/ipl/LSG/Logos/Logooutline/LSGoutline.png",
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
  // IPL Mode uses ipl_with_* IDs — same images + ABD/Rohit
  ipl_with_dhoni: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/MS_Dhoni_%28Prabhav_%2723_-_RiGI_2023%29.jpg/250px-MS_Dhoni_%28Prabhav_%2723_-_RiGI_2023%29.jpg",
    name: "Dhoni",
  },
  ipl_with_kohli: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Virat_Kohli_in_PMO_New_Delhi.jpg/250px-Virat_Kohli_in_PMO_New_Delhi.jpg",
    name: "Kohli",
  },
  ipl_with_abd: {
    url: "https://media.gettyimages.com/id/514874528/photo/mumbai-india-ab-devilliers-of-south-africa-poses-during-the-official-photocall-for-the-icc.jpg?s=612x612&w=0&k=20&c=T2OHJLp9nFpdBAJHA7DbLSlzyIgR7zAa-IxaJizzCRo=",
    name: "ABD",
  },
  ipl_with_sachin: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/The_cricket_legend_Sachin_Tendulkar_at_the_Oval_Maidan_in_Mumbai_During_the_Duke_and_Duchess_of_Cambridge_Visit%2826271019082%29.jpg/250px-The_cricket_legend_Sachin_Tendulkar_at_the_Oval_Maidan_in_Mumbai_During_the_Duke_and_Duchess_of_Cambridge_Visit%2826271019082%29.jpg",
    name: "Sachin",
  },
  ipl_with_rohit: {
    url: "https://media.gettyimages.com/id/2200260514/photo/dubai-united-arab-emirates-rohit-sharma-of-india-poses-for-a-portrait-during-the-icc.jpg?s=612x612&w=0&k=20&c=v9a4tBPIcnpFMTh-ZHcKQ45PRBkSA9_kPbNWCM3zPAk=",
    name: "Rohit",
  },
};

// --- Achievement category badges (local SVG assets) ---
const BASE = import.meta.env.BASE_URL;
const ACHIEVEMENT_BADGES: Record<string, string> = {
  ach_captains: `${BASE}badges/captains.svg`,
  ach_century_makers: `${BASE}badges/century-makers.svg`,
  ach_fastest_bowling: `${BASE}badges/fastest-bowling.svg`,
  ach_aggressive_batsmen: `${BASE}badges/aggressive-batsmen.svg`,
  ach_world_cup_winners: `${BASE}badges/world-cup-winners.svg`,
  ach_ipl_superstars: `${BASE}badges/ipl-superstars.svg`,
  // IPL Mode captain category — same badge as regular captains
  ipl_captain: `${BASE}badges/captains.svg`,
};

// --- SVG icons for roles, stats, trophies ---
function CricketBatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      {/* Handle grip */}
      <rect x="29" y="4" width="6" height="12" rx="2" fill="#6B4226" stroke="#4A2C17" strokeWidth="1"/>
      <line x1="30" y1="6" x2="30" y2="14" stroke="#4A2C17" strokeWidth="0.5" opacity="0.5"/>
      <line x1="34" y1="6" x2="34" y2="14" stroke="#4A2C17" strokeWidth="0.5" opacity="0.5"/>
      {/* Blade */}
      <path d="M 25 16 L 25 48 Q 25 52 32 52 Q 39 52 39 48 L 39 16 Q 39 14 32 14 Q 25 14 25 16 Z" fill="#e8c88a" stroke="#B8860B" strokeWidth="1.2"/>
      {/* Blade spine */}
      <line x1="32" y1="16" x2="32" y2="50" stroke="#B8860B" strokeWidth="0.8" opacity="0.3"/>
      {/* Sweet spot highlight */}
      <ellipse cx="32" cy="34" rx="5" ry="8" fill="#f5deb3" opacity="0.4"/>
      {/* Edge detail */}
      <path d="M 25.5 20 L 25.5 46" stroke="#d4a574" strokeWidth="0.6" opacity="0.5"/>
      <path d="M 38.5 20 L 38.5 46" stroke="#d4a574" strokeWidth="0.6" opacity="0.5"/>
      {/* Toe guard */}
      <path d="M 26 48 Q 32 54 38 48" stroke="#8B6914" strokeWidth="1.2" fill="none"/>
      {/* Ball impact mark */}
      <circle cx="32" cy="32" r="1.5" fill="#cc2222" opacity="0.3"/>
    </svg>
  );
}

function BowlerIcon({ className, isSpin }: { className?: string; isSpin?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      {/* Cricket ball */}
      <circle cx="32" cy="30" r="12" fill="#cc2222" stroke="#8B1A1A" strokeWidth="1.5"/>
      {/* Ball seam */}
      <path d="M 20 30 Q 26 22 32 22 Q 38 22 44 30" stroke="#f5f5dc" strokeWidth="1.8" fill="none"/>
      <path d="M 20 30 Q 26 38 32 38 Q 38 38 44 30" stroke="#f5f5dc" strokeWidth="1.8" fill="none"/>
      {/* Seam stitches */}
      <line x1="22" y1="25" x2="24" y2="24" stroke="#f5f5dc" strokeWidth="0.8"/>
      <line x1="26" y1="23" x2="28" y2="22.5" stroke="#f5f5dc" strokeWidth="0.8"/>
      <line x1="36" y1="22.5" x2="38" y2="23" stroke="#f5f5dc" strokeWidth="0.8"/>
      <line x1="40" y1="24" x2="42" y2="25" stroke="#f5f5dc" strokeWidth="0.8"/>
      {/* Ball shine */}
      <ellipse cx="28" cy="26" rx="2" ry="1.5" fill="white" opacity="0.2"/>
      {isSpin ? (
        <>
          {/* Spin arc with rotation indicator */}
          <path d="M 16 18 Q 24 8 36 12 Q 48 16 50 28" stroke="#ffaa00" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          <path d="M 48 24 L 50 28 L 46 27" fill="#ffaa00"/>
          {/* Spin revolutions */}
          <path d="M 20 46 Q 26 42 32 44 Q 38 46 44 42" stroke="#ffaa00" strokeWidth="1.5" fill="none" opacity="0.5" strokeDasharray="2 2"/>
        </>
      ) : (
        <>
          {/* Speed lines */}
          <line x1="10" y1="16" x2="22" y2="22" stroke="#ffaa00" strokeWidth="2" strokeLinecap="round"/>
          <line x1="8" y1="22" x2="18" y2="26" stroke="#ffaa00" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
          <line x1="12" y1="12" x2="20" y2="18" stroke="#ffaa00" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
          {/* Impact burst */}
          <circle cx="14" cy="18" r="1" fill="#ffaa00" opacity="0.4"/>
        </>
      )}
    </svg>
  );
}

function WicketKeeperIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      {/* Left glove */}
      <path d="M 8 20 Q 8 14 14 12 L 20 12 Q 24 12 24 16 L 24 36 Q 24 42 18 42 L 14 42 Q 8 42 8 36 Z" fill="#d4a574" stroke="#8B6914" strokeWidth="1.2"/>
      {/* Left glove fingers */}
      <path d="M 10 14 Q 10 8 14 8 Q 18 8 18 14" fill="#d4a574" stroke="#8B6914" strokeWidth="1"/>
      <path d="M 16 12 Q 16 6 20 6 Q 24 6 24 12" fill="#d4a574" stroke="#8B6914" strokeWidth="1"/>
      {/* Left glove padding */}
      <ellipse cx="16" cy="28" rx="5" ry="6" fill="#c4956a" stroke="#8B6914" strokeWidth="0.8" opacity="0.6"/>
      {/* Right glove */}
      <path d="M 40 20 Q 40 14 46 12 L 50 12 Q 56 12 56 16 L 56 36 Q 56 42 50 42 L 46 42 Q 40 42 40 36 Z" fill="#d4a574" stroke="#8B6914" strokeWidth="1.2"/>
      {/* Right glove fingers */}
      <path d="M 40 12 Q 40 6 44 6 Q 48 6 48 12" fill="#d4a574" stroke="#8B6914" strokeWidth="1"/>
      <path d="M 46 14 Q 46 8 50 8 Q 54 8 54 14" fill="#d4a574" stroke="#8B6914" strokeWidth="1"/>
      {/* Right glove padding */}
      <ellipse cx="48" cy="28" rx="5" ry="6" fill="#c4956a" stroke="#8B6914" strokeWidth="0.8" opacity="0.6"/>
      {/* Ball caught between gloves */}
      <circle cx="32" cy="28" r="6" fill="#cc2222" stroke="#8B1A1A" strokeWidth="1"/>
      <path d="M 26 28 Q 32 24 38 28" stroke="#f5f5dc" strokeWidth="0.8" fill="none"/>
      <path d="M 26 28 Q 32 32 38 28" stroke="#f5f5dc" strokeWidth="0.8" fill="none"/>
      {/* Webbing between gloves */}
      <path d="M 24 24 Q 28 22 32 22 Q 36 22 40 24" stroke="#8B6914" strokeWidth="0.8" fill="none" opacity="0.4"/>
      {/* Stumps behind */}
      <rect x="28" y="44" width="1.5" height="14" rx="0.5" fill="#d4d4d4" opacity="0.5"/>
      <rect x="31" y="44" width="1.5" height="14" rx="0.5" fill="#d4d4d4" opacity="0.5"/>
      <rect x="34" y="44" width="1.5" height="14" rx="0.5" fill="#d4d4d4" opacity="0.5"/>
    </svg>
  );
}

function AllRounderIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      {/* Bat (left side) */}
      <rect x="10" y="6" width="5" height="8" rx="1.5" fill="#6B4226" stroke="#4A2C17" strokeWidth="0.8"/>
      <path d="M 8 14 L 8 40 Q 8 44 12.5 44 Q 17 44 17 40 L 17 14 Q 17 12 12.5 12 Q 8 12 8 14 Z" fill="#e8c88a" stroke="#B8860B" strokeWidth="1"/>
      <ellipse cx="12.5" cy="28" rx="3" ry="6" fill="#f5deb3" opacity="0.3"/>
      {/* Ball (right side) */}
      <circle cx="46" cy="20" r="9" fill="#cc2222" stroke="#8B1A1A" strokeWidth="1.2"/>
      <path d="M 37 20 Q 42 13 51 16" stroke="#f5f5dc" strokeWidth="1.2" fill="none"/>
      <path d="M 37 20 Q 42 27 51 24" stroke="#f5f5dc" strokeWidth="1.2" fill="none"/>
      <ellipse cx="43" cy="17" rx="1.5" ry="1" fill="white" opacity="0.2"/>
      {/* Lightning bolt connecting bat and ball — symbolizing dual skill */}
      <path d="M 22 24 L 28 20 L 26 26 L 34 22" stroke="#ffaa00" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Star badge at bottom */}
      <path d="M 32 48 L 34 52 L 38 53 L 35 56 L 36 60 L 32 58 L 28 60 L 29 56 L 26 53 L 30 52 Z" fill="#ffaa00" stroke="#cc8800" strokeWidth="0.8"/>
    </svg>
  );
}

function TrophyIcon({ className, variant = "gold" }: { className?: string; variant?: "gold" | "silver" | "bronze" | "platinum" }) {
  const colors = {
    gold:     { cup: "#FFD700", dark: "#B8860B", shine: "#FFF8DC", base: "#DAA520" },
    silver:   { cup: "#C0C0C0", dark: "#808080", shine: "#F5F5F5", base: "#A9A9A9" },
    bronze:   { cup: "#CD7F32", dark: "#8B4513", shine: "#DEB887", base: "#A0522D" },
    platinum: { cup: "#E5C100", dark: "#B8960B", shine: "#FFFACD", base: "#CDB200" },
  };
  const c = colors[variant];
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      {/* Glow effect */}
      <ellipse cx="32" cy="30" rx="18" ry="16" fill={c.cup} opacity="0.08"/>
      {/* Cup body */}
      <path d="M 18 10 L 18 28 Q 18 40 32 42 Q 46 40 46 28 L 46 10 Z" fill={c.cup} stroke={c.dark} strokeWidth="1.5"/>
      {/* Cup inner shine */}
      <path d="M 22 12 L 22 26 Q 22 36 32 38" stroke={c.shine} strokeWidth="1.5" fill="none" opacity="0.5"/>
      {/* Left handle */}
      <path d="M 18 14 Q 8 14 8 22 Q 8 30 18 30" fill="none" stroke={c.dark} strokeWidth="2"/>
      <path d="M 18 16 Q 10 16 10 22 Q 10 28 18 28" fill="none" stroke={c.cup} strokeWidth="1" opacity="0.5"/>
      {/* Right handle */}
      <path d="M 46 14 Q 56 14 56 22 Q 56 30 46 30" fill="none" stroke={c.dark} strokeWidth="2"/>
      <path d="M 46 16 Q 54 16 54 22 Q 54 28 46 28" fill="none" stroke={c.cup} strokeWidth="1" opacity="0.5"/>
      {/* Stem */}
      <rect x="29" y="42" width="6" height="8" fill={c.dark} rx="1"/>
      {/* Base */}
      <path d="M 22 50 L 22 54 Q 22 56 24 56 L 40 56 Q 42 56 42 54 L 42 50 Z" fill={c.base} stroke={c.dark} strokeWidth="1"/>
      <rect x="24" y="50" width="16" height="2" fill={c.cup} opacity="0.4" rx="0.5"/>
      {/* Star on cup */}
      <path d="M 32 18 L 33.5 22 L 38 22.5 L 34.5 25.5 L 35.5 30 L 32 27.5 L 28.5 30 L 29.5 25.5 L 26 22.5 L 30.5 22 Z" fill={c.shine} opacity="0.6"/>
    </svg>
  );
}

function RunsIcon({ className, label }: { className?: string; label: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      {/* Cricket bat silhouette */}
      <path d="M 14 8 L 14 36 Q 14 40 18 40 L 20 40 Q 24 40 24 36 L 24 8 Q 24 6 19 6 Q 14 6 14 8 Z" fill="#e8c88a" stroke="#B8860B" strokeWidth="1" opacity="0.6"/>
      {/* Runs counter display */}
      <rect x="28" y="14" width="26" height="18" rx="3" fill="#0f172a" stroke="#22c55e" strokeWidth="1.5"/>
      <text x="41" y="27" textAnchor="middle" fontSize="10" fill="#22c55e" fontFamily="monospace" fontWeight="700">{label}</text>
      {/* LED dots on scoreboard */}
      <circle cx="31" cy="17" r="1" fill="#22c55e" opacity="0.4"/>
      <circle cx="51" cy="17" r="1" fill="#22c55e" opacity="0.4"/>
      {/* Rising graph line below */}
      <path d="M 10 50 L 20 46 L 30 48 L 40 42 L 50 38 L 56 34" stroke="#22c55e" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <circle cx="56" cy="34" r="2" fill="#22c55e"/>
    </svg>
  );
}

function WicketsIcon({ className, label }: { className?: string; label: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      {/* Three stumps */}
      <rect x="18" y="16" width="3" height="34" rx="1" fill="#d4d4d4" stroke="#a1a1aa" strokeWidth="0.8"/>
      <rect x="30" y="16" width="3" height="34" rx="1" fill="#d4d4d4" stroke="#a1a1aa" strokeWidth="0.8"/>
      <rect x="42" y="16" width="3" height="34" rx="1" fill="#d4d4d4" stroke="#a1a1aa" strokeWidth="0.8"/>
      {/* Bails flying off */}
      <rect x="16" y="12" width="14" height="3" rx="1" fill="#e8c88a" stroke="#B8860B" strokeWidth="0.8" transform="rotate(-15 23 13.5)"/>
      <rect x="33" y="10" width="14" height="3" rx="1" fill="#e8c88a" stroke="#B8860B" strokeWidth="0.8" transform="rotate(20 40 11.5)"/>
      {/* Impact burst */}
      <circle cx="32" cy="18" r="3" fill="#ff6b6b" opacity="0.3"/>
      <path d="M 28 14 L 26 10" stroke="#ff6b6b" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
      <path d="M 36 14 L 38 10" stroke="#ff6b6b" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
      {/* Counter */}
      <text x="32" y="60" textAnchor="middle" fontSize="9" fill="#f87171" fontFamily="monospace" fontWeight="700">{label}</text>
    </svg>
  );
}

function StadiumIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      {/* Stadium oval */}
      <ellipse cx="32" cy="40" rx="28" ry="12" fill="#166534" stroke="#15803d" strokeWidth="1.5"/>
      {/* Pitch strip */}
      <rect x="29" y="34" width="6" height="12" rx="1" fill="#22c55e" opacity="0.4"/>
      {/* Stadium stands - left */}
      <path d="M 4 40 L 4 18 Q 4 10 12 8 L 18 6" stroke="#64748b" strokeWidth="2" fill="none"/>
      <path d="M 4 22 L 16 18" stroke="#475569" strokeWidth="0.8" opacity="0.4"/>
      <path d="M 4 28 L 16 24" stroke="#475569" strokeWidth="0.8" opacity="0.4"/>
      {/* Stadium stands - right */}
      <path d="M 60 40 L 60 18 Q 60 10 52 8 L 46 6" stroke="#64748b" strokeWidth="2" fill="none"/>
      <path d="M 60 22 L 48 18" stroke="#475569" strokeWidth="0.8" opacity="0.4"/>
      <path d="M 60 28 L 48 24" stroke="#475569" strokeWidth="0.8" opacity="0.4"/>
      {/* Stadium roof arc */}
      <path d="M 18 6 Q 32 0 46 6" stroke="#64748b" strokeWidth="2" fill="none"/>
      {/* Floodlight towers */}
      <rect x="10" y="28" width="2" height="14" fill="#94a3b8"/>
      <circle cx="11" cy="26" r="3" fill="#fef08a" opacity="0.6"/>
      <rect x="52" y="28" width="2" height="14" fill="#94a3b8"/>
      <circle cx="53" cy="26" r="3" fill="#fef08a" opacity="0.6"/>
      {/* Stumps on pitch */}
      <rect x="31" y="36" width="0.8" height="4" fill="#d4d4d4" opacity="0.6"/>
      <rect x="32.5" y="36" width="0.8" height="4" fill="#d4d4d4" opacity="0.6"/>
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <circle cx="32" cy="32" r="22" fill="#1e3a5f" opacity="0.3" stroke="#60a5fa" strokeWidth="2"/>
      {/* Equator */}
      <path d="M 10 32 Q 21 24 32 32 Q 43 40 54 32" stroke="#60a5fa" strokeWidth="1.5" fill="none" opacity="0.8"/>
      {/* Top lat arc */}
      <path d="M 14 20 Q 23 15 32 20 Q 41 25 50 20" stroke="#60a5fa" strokeWidth="1" fill="none" opacity="0.5"/>
      {/* Bottom lat arc */}
      <path d="M 14 44 Q 23 49 32 44 Q 41 39 50 44" stroke="#60a5fa" strokeWidth="1" fill="none" opacity="0.5"/>
      {/* Left meridian */}
      <path d="M 32 10 Q 22 20 22 32 Q 22 44 32 54" stroke="#60a5fa" strokeWidth="1.5" fill="none" opacity="0.6"/>
      {/* Right meridian */}
      <path d="M 32 10 Q 42 20 42 32 Q 42 44 32 54" stroke="#60a5fa" strokeWidth="1.5" fill="none" opacity="0.6"/>
      {/* Shine dot */}
      <circle cx="24" cy="22" r="2" fill="#93c5fd" opacity="0.5"/>
    </svg>
  );
}

function MultiTeamIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      {/* Left shield */}
      <path d="M 8 10 L 8 28 Q 8 36 16 40 Q 24 36 24 28 L 24 10 Z" fill="#3b82f6" stroke="#60a5fa" strokeWidth="1.5" opacity="0.75"/>
      {/* Centre shield (raised, most prominent) */}
      <path d="M 22 6 L 22 26 Q 22 36 32 41 Q 42 36 42 26 L 42 6 Z" fill="#8b5cf6" stroke="#a78bfa" strokeWidth="1.5"/>
      {/* Right shield */}
      <path d="M 40 10 L 40 28 Q 40 36 48 40 Q 56 36 56 28 L 56 10 Z" fill="#f59e0b" stroke="#fbbf24" strokeWidth="1.5" opacity="0.75"/>
      {/* 3+ badge */}
      <circle cx="49" cy="52" r="8" fill="#0f172a" stroke="#a78bfa" strokeWidth="1.5"/>
      <text x="49" y="56" textAnchor="middle" fontSize="9" fill="#a78bfa" fontFamily="monospace" fontWeight="700">3+</text>
    </svg>
  );
}

function CenturiesIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      {/* "100" text prominent */}
      <text x="32" y="28" textAnchor="middle" fontSize="18" fill="#fbbf24" fontFamily="monospace" fontWeight="900">100</text>
      {/* Star burst behind */}
      <path d="M 32 6 L 34 14 L 42 10 L 38 18 L 46 20 L 38 24" stroke="#fbbf24" strokeWidth="1" fill="none" opacity="0.3"/>
      <path d="M 32 6 L 30 14 L 22 10 L 26 18 L 18 20 L 26 24" stroke="#fbbf24" strokeWidth="1" fill="none" opacity="0.3"/>
      {/* Bat below */}
      <path d="M 24 34 L 24 50 Q 24 52 28 52 L 36 52 Q 40 52 40 50 L 40 34 Z" fill="#e8c88a" stroke="#B8860B" strokeWidth="0.8" opacity="0.5"/>
      {/* Raised bat gesture */}
      <path d="M 32 34 L 32 54" stroke="#B8860B" strokeWidth="0.5" opacity="0.3"/>
      {/* Celebration sparks */}
      <circle cx="16" cy="14" r="1.5" fill="#fbbf24" opacity="0.5"/>
      <circle cx="48" cy="14" r="1.5" fill="#fbbf24" opacity="0.5"/>
      <circle cx="12" cy="30" r="1" fill="#fbbf24" opacity="0.3"/>
      <circle cx="52" cy="30" r="1" fill="#fbbf24" opacity="0.3"/>
    </svg>
  );
}

// Map shortLabel → icon component
const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  // --- Regular mode ---
  PACER:      <BowlerIcon className="w-10 h-10 sm:w-12 sm:h-12" />,
  SPINNER:    <BowlerIcon className="w-10 h-10 sm:w-12 sm:h-12" isSpin />,
  "ALL-RTR":  <AllRounderIcon className="w-10 h-10 sm:w-12 sm:h-12" />,
  WK:         <WicketKeeperIcon className="w-10 h-10 sm:w-12 sm:h-12" />,
  BAT:        <CricketBatIcon className="w-10 h-10 sm:w-12 sm:h-12" />,
  IPL:        <TrophyIcon className="w-10 h-10 sm:w-12 sm:h-12" variant="gold" />,
  CWC:        <TrophyIcon className="w-10 h-10 sm:w-12 sm:h-12" variant="silver" />,
  T20WC:      <TrophyIcon className="w-10 h-10 sm:w-12 sm:h-12" variant="bronze" />,
  CT:         <TrophyIcon className="w-10 h-10 sm:w-12 sm:h-12" variant="platinum" />,
  "10K RUNS": <RunsIcon className="w-10 h-10 sm:w-12 sm:h-12" label="10K" />,
  "5K ODI":   <RunsIcon className="w-10 h-10 sm:w-12 sm:h-12" label="5K" />,
  "300 WKTS": <WicketsIcon className="w-10 h-10 sm:w-12 sm:h-12" label="300" />,
  "100s":     <CenturiesIcon className="w-10 h-10 sm:w-12 sm:h-12" />,
  "50 TESTS": <StadiumIcon className="w-10 h-10 sm:w-12 sm:h-12" />,
  "1K IPL":   <RunsIcon className="w-10 h-10 sm:w-12 sm:h-12" label="1K" />,
  // --- IPL Mode shortLabels ---
  "IPL WIN":   <TrophyIcon className="w-10 h-10 sm:w-12 sm:h-12" variant="gold" />,
  "100 GAMES": <StadiumIcon className="w-10 h-10 sm:w-12 sm:h-12" />,
  "3K RUNS":   <RunsIcon className="w-10 h-10 sm:w-12 sm:h-12" label="3K" />,
  "50 WKTS":   <WicketsIcon className="w-10 h-10 sm:w-12 sm:h-12" label="50" />,
  OVERSEAS:    <GlobeIcon className="w-10 h-10 sm:w-12 sm:h-12" />,
  "3+ CLUBS":  <MultiTeamIcon className="w-10 h-10 sm:w-12 sm:h-12" />,
};

// --- Team abbr map for combo lookups ---
const TEAM_ABBR_MAP: Record<string, string> = {
  MI: "team_mi", CSK: "team_csk", RCB: "team_rcb", DC: "team_dc",
  SRH: "team_srh", RR: "team_rr", KKR: "team_kkr", PBKS: "team_pbks",
  GT: "team_gt", LSG: "team_lsg",
};

// --- Category definitions for tooltips ---
const CATEGORY_DEFINITIONS: Record<string, string> = {
  PACER: "Fast bowler who bowls at 130+ km/h in any format",
  SPINNER: "Spin bowler (off-spin, leg-spin, or left-arm spin) in any format",
  "ALL-RTR": "All-rounder who both bats and bowls significantly",
  WK: "Wicket-keeper in any format",
  BAT: "Batsman or opener in any format",
  IPL: "Won the IPL trophy",
  CWC: "Won the Cricket World Cup",
  T20WC: "Won the T20 World Cup",
  CT: "Won the Champions Trophy",
  "10K RUNS": "Scored 10,000+ runs across all formats",
  "5K ODI": "Scored 5,000+ runs in ODI format",
  "300 WKTS": "Took 300+ wickets across all formats",
  "100s": "Hit 100+ centuries in career",
  "50 TESTS": "Played 50+ Test matches",
  "1K IPL": "Scored 1,000+ runs in IPL career",
  // IPL Mode tooltips
  "IPL WIN": "Won the IPL title at least once",
  "100 GAMES": "Played 100+ matches in IPL",
  "3K RUNS": "Scored 3,000+ runs in IPL career",
  "50 WKTS": "Took 50+ wickets in IPL career",
  "OVERSEAS": "Overseas (non-Indian) IPL player",
  "INDIA": "Indian national player in IPL",
  CAPTAIN: "Has captained an IPL team",
  "3+ CLUBS": "Played for 3 or more different IPL teams",
  "w/ DHONI": "Played in the same IPL team as MS Dhoni",
  "w/ KOHLI": "Played in the same IPL team as Virat Kohli",
  "w/ ABD": "Played in the same IPL team as AB de Villiers",
  "w/ SACHIN": "Played in the same IPL team as Sachin Tendulkar",
  "w/ ROHIT": "Played in the same IPL team as Rohit Sharma",
  "CSK+MI": "Played for both CSK and MI in IPL",
  "MI+KKR": "Played for both MI and KKR in IPL",
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
  const [showDefinition, setShowDefinition] = useState(false);

  // Determine what visual to show for an empty cell
  const flagUrl = FLAG_IMAGES[category.id];
  const teamLogo = TEAM_LOGOS[category.id];
  const playerImg = PLAYER_IMAGES[category.id];
  const achievementBadge = ACHIEVEMENT_BADGES[category.id];
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
          {/* Player headshot or country flag */}
          {placedPlayer.headshot_url ? (
            <img
              src={placedPlayer.headshot_url}
              alt={placedPlayer.name}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-primary/40"
              onError={(e) => {
                // Fallback to flag emoji if image fails
                e.currentTarget.style.display = "none";
                const fallback = e.currentTarget.nextElementSibling;
                if (fallback) fallback.classList.remove("hidden");
              }}
            />
          ) : null}
          {!placedPlayer.headshot_url ? (
            <span className="text-2xl sm:text-3xl leading-none">{placedPlayer.countryFlag}</span>
          ) : (
            <span className="hidden text-2xl sm:text-3xl leading-none">{placedPlayer.countryFlag}</span>
          )}
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
              className="w-14 h-10 sm:w-16 sm:h-11 rounded-sm object-cover shadow-sm"
            />
          ) : teamLogo ? (
            /* IPL team official logo */
            <img
              src={teamLogo}
              alt={category.label}
              className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
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
          ) : achievementBadge ? (
            /* Achievement category badge */
            <img
              src={achievementBadge}
              alt={category.label}
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-sm"
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

          <div className="relative flex items-center gap-0.5">
            <span className="font-display text-[8px] sm:text-[10px] text-muted-foreground font-semibold uppercase tracking-wider leading-tight mt-0.5">
              {category.shortLabel}
            </span>
            {CATEGORY_DEFINITIONS[category.shortLabel] && (
              <button
                onMouseEnter={() => setShowDefinition(true)}
                onMouseLeave={() => setShowDefinition(false)}
                onClick={(e) => e.stopPropagation()}
                className="relative shrink-0 p-0.5 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
              >
                <HelpCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                {showDefinition && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-32 sm:w-40 px-2 py-1.5 rounded-lg bg-muted border border-border/50 text-muted-foreground text-[7px] sm:text-[8px] text-center whitespace-normal z-50 pointer-events-none"
                  >
                    {CATEGORY_DEFINITIONS[category.shortLabel]}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-muted border-t border-l border-border/50" />
                  </motion.div>
                )}
              </button>
            )}
          </div>
        </>
      )}

      {/* Wrong feedback red overlay */}
      {feedbackState === "wrong" && (
        <div className="absolute inset-0 bg-destructive/15 rounded-xl pointer-events-none border-2 border-destructive/40" />
      )}
    </motion.button>
  );
});
