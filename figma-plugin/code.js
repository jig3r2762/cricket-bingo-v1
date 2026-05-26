// Cricket Bingo — Figma Frame Generator
// ─────────────────────────────────────────────────────
// HOW TO RUN:
// 1. Open Figma → Plugins → Development → New Plugin
// 2. Choose "Run once" template
// 3. Replace code.js content with this entire file
// 4. Click "Run" — all frames are generated automatically
// ─────────────────────────────────────────────────────

const C = {
  green:    { r: 0.239, g: 0.659, b: 0.298 },
  greenDark:{ r: 0.165, g: 0.459, b: 0.208 },
  orange:   { r: 0.976, g: 0.451, b: 0.086 },
  orangeDark:{r: 0.761, g: 0.255, b: 0.024 },
  blue:     { r: 0.161, g: 0.659, b: 0.961 },
  purple:   { r: 0.545, g: 0.361, b: 0.965 },
  red:      { r: 0.937, g: 0.267, b: 0.267 },
  yellow:   { r: 0.961, g: 0.773, b: 0.094 },
  pink:     { r: 0.925, g: 0.282, b: 0.600 },
  white:    { r: 1,     g: 1,     b: 1     },
  cream:    { r: 1.000, g: 0.973, b: 0.941 },
  border:   { r: 0.910, g: 0.835, b: 0.753 },
  muted:    { r: 0.627, g: 0.502, b: 0.376 },
  dark:     { r: 0.239, g: 0.165, b: 0.102 },
  cardBg:   { r: 1,     g: 1,     b: 1     },
};

const GAP = 60;   // gap between frames
let curX = 0;

// ── helpers ──────────────────────────────────────────

function rgb(c) { return [{ type: "SOLID", color: c }]; }
function rgba(c, a) { return [{ type: "SOLID", color: c, opacity: a }]; }

async function loadFonts() {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
  await figma.loadFontAsync({ family: "Inter", style: "Extra Bold" });
}

function frame(name, w, h) {
  const f = figma.createFrame();
  f.name = name;
  f.resize(w, h);
  f.x = curX;
  f.y = 0;
  f.fills = rgb(C.cream);
  f.cornerRadius = 0;
  f.clipsContent = true;
  curX += w + GAP;
  return f;
}

function rect(parent, x, y, w, h, fill, radius = 0, name = "") {
  const r = figma.createRectangle();
  r.name = name || "rect";
  r.x = x; r.y = y;
  r.resize(w, h);
  r.fills = fill;
  r.cornerRadius = radius;
  parent.appendChild(r);
  return r;
}

function text(parent, content, x, y, size, weight, color, opts = {}) {
  const t = figma.createText();
  t.fontName = {
    family: "Inter",
    style: weight === 800 ? "Extra Bold" : weight === 700 ? "Bold" : weight === 500 ? "Medium" : "Regular"
  };
  t.characters = String(content);
  t.fontSize = size;
  t.fills = rgb(color);
  t.x = x;
  t.y = y;
  if (opts.w) { t.textAutoResize = "HEIGHT"; t.resize(opts.w, 20); }
  if (opts.align) t.textAlignHorizontal = opts.align;
  if (opts.opacity !== undefined) t.opacity = opts.opacity;
  if (opts.lineHeight) t.lineHeight = { unit: "PIXELS", value: opts.lineHeight };
  parent.appendChild(t);
  return t;
}

function card(parent, x, y, w, h, radius = 16) {
  const shadow = rect(parent, x + 0, y + 4, w, h, rgba(C.border, 1), radius, "card-shadow");
  shadow.fills = [{ type: "SOLID", color: C.border }];
  const c = rect(parent, x, y, w, h, rgb(C.cardBg), radius, "card");
  c.strokes = [{ type: "SOLID", color: C.border }];
  c.strokeWeight = 2;
  return c;
}

function pill(parent, x, y, w, h, fill, strokeColor, radius = 12) {
  const p = rect(parent, x, y, w, h, fill, radius, "pill");
  if (strokeColor) {
    p.strokes = [{ type: "SOLID", color: strokeColor }];
    p.strokeWeight = 2;
  }
  return p;
}

function iconBox(parent, x, y, size, color, shadowColor, radius = 14) {
  rect(parent, x, y + 4, size, size, rgb(shadowColor), radius, "icon-shadow");
  return rect(parent, x, y, size, size, rgb(color), radius, "icon-box");
}

function divider(parent, x, y, w) {
  const d = rect(parent, x, y, w, 2, rgba(C.border, 0.6), 0, "divider");
  return d;
}

function badge(parent, x, y, label, bg, txtColor) {
  const b = rect(parent, x, y, 0, 22, rgb(bg), 11, "badge");
  const t2 = text(parent, label, x + 8, y + 4, 10, 700, txtColor);
  const tw = t2.width;
  b.resize(tw + 16, 22);
  return b;
}

function avatar(parent, x, y, size, color, initial) {
  const a = rect(parent, x, y, size, size, rgb(color), size / 2, "avatar");
  a.strokes = [{ type: "SOLID", color: C.border }];
  a.strokeWeight = 2;
  text(parent, initial, x + size / 2 - 6, y + size / 2 - 8, 12, 700, C.white);
  return a;
}

function topBar(parent, w, userName, showCoins = false) {
  const bar = rect(parent, 0, 0, w, 56, rgb(C.white), 0, "top-bar");
  bar.strokes = [{ type: "SOLID", color: C.border }];
  bar.strokeWeight = 1;
  // back arrow placeholder
  rect(parent, 12, 16, 32, 24, rgba(C.border, 0.5), 8, "back-btn");
  text(parent, "←", 18, 18, 14, 700, C.muted);
  // avatar
  avatar(parent, 56, 12, 32, C.green, "JK");
  text(parent, userName, 96, 13, 13, 700, C.dark);
  text(parent, "jigar@gmail.com", 96, 28, 10, 400, C.muted, { opacity: 0.7 });
  if (showCoins) {
    pill(parent, w - 160, 14, 64, 28, rgba(C.yellow, 0.15), C.yellow, 14);
    text(parent, "💰 125", w - 155, 19, 11, 700, C.yellow);
  }
  // hamburger
  rect(parent, w - 44, 18, 20, 3, rgba(C.muted, 0.5), 2, "menu-line");
  rect(parent, w - 44, 26, 20, 3, rgba(C.muted, 0.5), 2, "menu-line");
  rect(parent, w - 44, 34, 20, 3, rgba(C.muted, 0.5), 2, "menu-line");
}

// ── SCREEN BUILDERS ───────────────────────────────────

async function buildDesignSystem() {
  const f = frame("🎨 Design System", 900, 800);
  f.fills = rgb(C.white);

  text(f, "Cricket Bingo — Design System", 40, 40, 28, 800, C.dark);
  text(f, "Fonts: Lilita One (display) + Nunito (body)", 40, 80, 13, 400, C.muted);

  // Color swatches
  text(f, "BRAND COLORS", 40, 120, 11, 700, C.muted);
  const swatchData = [
    { label: "candy-green",  hex: "#3DA84C", color: C.green },
    { label: "candy-orange", hex: "#F97316", color: C.orange },
    { label: "candy-blue",   hex: "#29A8F5", color: C.blue },
    { label: "candy-purple", hex: "#8B5CF6", color: C.purple },
    { label: "candy-red",    hex: "#EF4444", color: C.red },
    { label: "candy-yellow", hex: "#F5C518", color: C.yellow },
    { label: "candy-pink",   hex: "#EC4899", color: C.pink },
  ];
  swatchData.forEach((s, i) => {
    const x = 40 + (i % 4) * 200;
    const y = 145 + Math.floor(i / 4) * 120;
    rect(f, x, y, 160, 60, rgb(s.color), 12, s.label);
    text(f, s.label, x, y + 70, 11, 700, C.dark);
    text(f, s.hex, x, y + 84, 10, 400, C.muted);
  });

  // Typography samples
  text(f, "TYPOGRAPHY", 40, 390, 11, 700, C.muted);
  text(f, "Lilita One 48 — BINGO!", 40, 410, 48, 800, C.dark);
  text(f, "Lilita One 28 — Cricket Bingo", 40, 470, 28, 800, C.dark);
  text(f, "Nunito 16 — Match cricketers to categories, beat the clock.", 40, 510, 16, 400, C.muted);
  text(f, "Nunito Bold 12 — SCORE  CELLS FILLED  BEST STREAK", 40, 540, 12, 700, C.dark);
  text(f, "Nunito 11 — 8 remaining  ·  Sign in to save scores", 40, 560, 11, 400, C.muted);

  // Card anatomy
  text(f, "CARD STYLE", 40, 600, 11, 700, C.muted);
  card(f, 40, 620, 220, 80);
  text(f, "bg: white  border: 2px #E8D5C0", 60, 636, 11, 400, C.muted);
  text(f, "radius: 16px  shadow: 0 4px 0 #E8D5C0", 60, 652, 11, 400, C.muted);
  text(f, "Chunky 3D bottom shadow — key brand detail", 60, 668, 11, 700, C.dark);

  // Buttons
  text(f, "BUTTONS", 300, 600, 11, 700, C.muted);
  const btn1 = rect(f, 300, 620, 160, 44, rgb(C.green), 16, "btn-green");
  rect(f, 300, 624, 160, 44, rgb(C.greenDark), 16, "btn-shadow");
  btn1.fills = rgb(C.green);
  text(f, "Play Now — Free", 332, 633, 13, 700, C.white);
  const btn2 = rect(f, 300, 676, 160, 44, rgb(C.white), 16, "btn-outline");
  btn2.strokes = [{ type: "SOLID", color: C.border }];
  btn2.strokeWeight = 2;
  text(f, "Quick Guest Play", 328, 689, 13, 700, C.dark);

  figma.currentPage.appendChild(f);
}

async function buildLanding() {
  const W = 390, H = 3200;
  const f = frame("01 — Landing (/)", W, H);

  // Background
  f.fills = [{ type: "GRADIENT_LINEAR",
    gradientTransform: [[0, 1, 0], [-1, 0, 1]],
    gradientStops: [
      { position: 0, color: { ...C.cream, a: 1 } },
      { position: 1, color: { r: 0.996, g: 0.941, b: 0.902, a: 1 } },
    ]
  }];

  // ── HERO SECTION ──
  text(f, "🏏", W/2 - 28, 80, 56, 400, C.dark);
  text(f, "Cricket", W/2 - 70, 150, 56, 800, C.dark, { align: "CENTER", w: 140 });
  text(f, "Bingo", W/2 - 50, 208, 56, 800, C.green, { align: "CENTER", w: 100 });

  text(f, "The free online cricket game with\n3,600+ real player cards.", 40, 280, 15, 700, C.muted, { w: W - 80, align: "CENTER", lineHeight: 22 });
  text(f, "Match cricketers to categories, beat the clock, compete globally.", 40, 330, 13, 500, C.muted, { w: W - 80, align: "CENTER", lineHeight: 20 });

  // Play Now button
  rect(f, 40, 380, W - 80, 4, rgb(C.greenDark), 16, "btn-shadow");
  const btn = rect(f, 40, 368, W - 80, 52, rgb(C.green), 16, "btn-play-now");
  text(f, "🎮 Play Now — Free", 40, 387, 16, 700, C.white, { w: W - 80, align: "CENTER" });

  // Guest button
  const guestBtn = rect(f, 40, 436, W - 80, 48, rgb(C.white), 16, "btn-guest");
  guestBtn.strokes = [{ type: "SOLID", color: C.border }];
  guestBtn.strokeWeight = 2;
  text(f, "Quick Guest Play", 40, 452, 14, 700, C.dark, { w: W - 80, align: "CENTER" });

  text(f, "Scroll to learn more ↓", 40, 504, 11, 700, C.muted, { w: W - 80, align: "CENTER", opacity: 0.6 });

  // ── GAME MODES SECTION ──
  divider(f, 40, 560, W - 80);
  text(f, "Choose Your Game", 40, 580, 22, 800, C.dark, { w: W - 80, align: "CENTER" });

  // Cricket Bingo card
  card(f, 20, 620, (W - 52) / 2, 120);
  iconBox(f, 32, 632, 48, C.green, C.greenDark);
  text(f, "Cricket Bingo", 88, 632, 13, 800, C.dark);
  text(f, "CLASSIC MODE", 88, 650, 9, 700, C.green);
  text(f, "Match cricket players to\ncategories on a bingo\ngrid. Fill rows to win!", 32, 688, 11, 500, C.muted, { w: 150, lineHeight: 17 });

  // Guess card
  const cx = 20 + (W - 52) / 2 + 12;
  card(f, cx, 620, (W - 52) / 2, 120);
  badge(f, cx + (W - 52) / 2 - 44, 628, "New", C.orange, C.white);
  iconBox(f, cx + 12, 632, 48, C.orange, C.orangeDark);
  text(f, "Guess Who", cx + 68, 632, 13, 800, C.dark);
  text(f, "NEW MODE", cx + 68, 650, 9, 700, C.orange);
  text(f, "5 clues, 1 mystery\nplayer. Fewer clues =\nmore points!", cx + 12, 688, 11, 500, C.muted, { w: 150, lineHeight: 17 });

  // ── HOW IT WORKS ──
  text(f, "How to Play", 40, 768, 22, 800, C.dark, { w: W - 80, align: "CENTER" });
  const steps = [
    { icon: "🧑‍💻", step: "Step 1", title: "A Player Card Appears", color: C.blue, shadow: C.blue },
    { icon: "📍",  step: "Step 2", title: "Answer the Cricket Question", color: C.orange, shadow: C.orangeDark },
    { icon: "🏆",  step: "Step 3", title: "Compete on Leaderboard", color: C.green, shadow: C.greenDark },
  ];
  steps.forEach((s, i) => {
    const cy = 810 + i * 130;
    card(f, 20, cy, W - 40, 115);
    iconBox(f, 32, cy + 12, 48, s.color, s.shadow);
    text(f, s.icon, 46, cy + 20, 28, 400, C.white);
    text(f, s.step.toUpperCase(), 92, cy + 16, 9, 700, C.green);
    text(f, s.title, 92, cy + 30, 14, 800, C.dark);
    text(f, "Players are shown one at a time. Place them\non the right grid cell to score points.", 92, cy + 50, 11, 500, C.muted, { w: W - 120, lineHeight: 17 });
  });

  // ── FEATURES GRID ──
  text(f, "Why Play Cricket Bingo", 40, 1220, 22, 800, C.dark, { w: W - 80, align: "CENTER" });
  const features = [
    { icon: "📅", title: "Daily Quiz", color: C.blue },
    { icon: "🏏", title: "3,600+ Cards", color: C.green },
    { icon: "⏱️", title: "10s Turns", color: C.orange },
    { icon: "🏆", title: "Leaderboard", color: C.yellow },
    { icon: "🔥", title: "Streaks", color: C.red },
    { icon: "🎮", title: "Play Free", color: C.purple },
  ];
  features.forEach((feat, i) => {
    const fx = 20 + (i % 2) * ((W - 52) / 2 + 12);
    const fy = 1260 + Math.floor(i / 2) * 120;
    card(f, fx, fy, (W - 52) / 2, 105);
    iconBox(f, fx + (W - 52) / 4 - 24, fy + 12, 48, feat.color, feat.color);
    text(f, feat.icon, fx + (W - 52) / 4 - 10, fy + 22, 24, 400, C.white);
    text(f, feat.title, fx, fy + 70, 13, 800, C.dark, { w: (W - 52) / 2, align: "CENTER" });
  });

  // ── STATS BAR ──
  text(f, "By the Numbers", 40, 1650, 22, 800, C.dark, { w: W - 80, align: "CENTER" });
  const stats = [
    { val: "3,600+", label: "PLAYER CARDS", color: C.green },
    { val: "42",     label: "CATEGORIES",   color: C.orange },
    { val: "∞",      label: "FREE DAILY",   color: C.blue },
  ];
  const sw = (W - 56) / 3;
  stats.forEach((s, i) => {
    card(f, 20 + i * (sw + 8), 1688, sw, 90);
    text(f, s.val, 20 + i * (sw + 8), 1706, 28, 800, s.color, { w: sw, align: "CENTER" });
    text(f, s.label, 20 + i * (sw + 8), 1742, 9, 700, C.muted, { w: sw, align: "CENTER" });
  });

  // ── FAQ ──
  text(f, "Frequently Asked Questions", 40, 1820, 22, 800, C.dark, { w: W - 80, align: "CENTER" });
  const faqs = [
    { q: "What is Cricket Bingo?", a: "A free online cricket quiz where you match real player cards to bingo grid categories. New puzzle every day." },
    { q: "How do you play?", a: "Each turn shows a cricket player. Place them on a matching category cell. Fill a row, column, or diagonal to win BINGO!" },
    { q: "Is it free?", a: "Yes! 100% free. Play as guest or sign in with Google to save stats, streaks, and compete on the leaderboard." },
    { q: "How many player cards?", a: "3,600+ real cricket players from Tests, ODIs, T20Is, and IPL — sourced from Cricsheet open data." },
    { q: "Can I play on mobile?", a: "Yes — browser-based, works on any device. No app download needed." },
  ];
  faqs.forEach((faq, i) => {
    const fy = 1860 + i * 130;
    card(f, 20, fy, W - 40, 115);
    text(f, faq.q, 32, fy + 16, 14, 800, C.dark, { w: W - 80 });
    text(f, faq.a, 32, fy + 40, 12, 500, C.muted, { w: W - 80, lineHeight: 18 });
  });

  // ── FINAL CTA ──
  card(f, 40, 2540, W - 80, 200);
  text(f, "🎯", W/2 - 18, 2560, 40, 400, C.dark);
  text(f, "Ready to Play?", 40, 2612, 24, 800, C.dark, { w: W - 80, align: "CENTER" });
  text(f, "A new cricket quiz awaits every day.\n3,600+ player cards · 42 categories · Zero cost.", 40, 2648, 12, 500, C.muted, { w: W - 80, align: "CENTER", lineHeight: 18 });
  rect(f, 56, 2692, W - 112, 4, rgb(C.greenDark), 14, "cta-shadow");
  rect(f, 56, 2680, W - 112, 48, rgb(C.green), 14, "cta-btn");
  text(f, "🎮 Play Now — It's Free", 56, 2697, 15, 700, C.white, { w: W - 112, align: "CENTER" });

  // ── FOOTER ──
  rect(f, 0, 2780, W, 1, rgb(C.border), 0, "footer-divider");
  text(f, "How to Play · About · Player Database · Leaderboard", 40, 2800, 11, 700, C.muted, { w: W - 80, align: "CENTER", lineHeight: 20 });
  text(f, "Privacy Policy · Terms of Service", 40, 2824, 11, 700, C.muted, { w: W - 80, align: "CENTER" });
  text(f, "Cricket Bingo © 2025 · Free online cricket quiz game", 40, 2856, 10, 400, C.muted, { w: W - 80, align: "CENTER", opacity: 0.7 });

  figma.currentPage.appendChild(f);
}

async function buildLogin() {
  const W = 390, H = 700;
  const f = frame("02 — Login (/login)", W, H);
  f.fills = [{ type: "SOLID", color: { r: 0.04, g: 0.055, b: 0.153 } }];

  // Background blobs
  const b1 = rect(f, W - 100, -20, 140, 140, rgba(C.green, 0.08), 70, "blob-1");
  const b2 = rect(f, -40, H - 140, 160, 160, rgba(C.purple, 0.06), 80, "blob-2");

  // Card
  const cardH = 460;
  const cardY = (H - cardH) / 2;
  const cardEl = rect(f, 32, cardY, W - 64, cardH, rgba(C.white, 0.06), 24, "login-card");
  cardEl.strokes = [{ type: "SOLID", color: { ...C.white, a: 0.1 }, opacity: 0.2 }];
  cardEl.strokeWeight = 1;

  text(f, "🏏", W/2 - 20, cardY + 24, 40, 400, C.white);
  text(f, "Cricket Bingo", W/2 - 70, cardY + 76, 22, 800, C.white, { w: 140, align: "CENTER" });
  text(f, "Test your cricket knowledge daily", 40, cardY + 106, 13, 400, { r: 0.6, g: 0.7, b: 0.9 }, { w: W - 80, align: "CENTER" });

  // Trust badges
  const bw = (W - 88) / 2;
  const by = cardY + 144;
  pill(f, 40, by, bw, 36, rgba(C.green, 0.12), C.green, 10);
  text(f, "👥 3,600+ Players", 44, by + 10, 11, 700, C.green, { w: bw });
  pill(f, 40 + bw + 8, by, bw, 36, rgba(C.orange, 0.12), C.orange, 10);
  text(f, "⚡ Daily Games", 44 + bw + 8, by + 10, 11, 700, C.orange, { w: bw });

  // Google sign-in button
  const gbY = cardY + 204;
  const gbEl = rect(f, 40, gbY, W - 80, 52, { r: 0, g: 0, b: 0, a: 0 }, 14, "google-btn");
  gbEl.fills = [{
    type: "GRADIENT_LINEAR",
    gradientTransform: [[1, 0, 0], [0, 1, 0]],
    gradientStops: [
      { position: 0, color: { r: 0.0, g: 1.0, b: 0.255, a: 1 } },
      { position: 1, color: { r: 0.0, g: 1.0, b: 0.533, a: 1 } },
    ]
  }];
  text(f, "G  Sign in with Google", 40, gbY + 16, 14, 700, { r: 0.1, g: 0.1, b: 0.1 }, { w: W - 80, align: "CENTER" });

  // Divider
  rect(f, 40, cardY + 272, (W - 80) / 2 - 20, 1, rgba(C.white, 0.2), 0, "divider-l");
  text(f, "or", W/2 - 8, cardY + 264, 11, 400, { r: 0.4, g: 0.4, b: 0.5 });
  rect(f, W/2 + 14, cardY + 272, (W - 80) / 2 - 20, 1, rgba(C.white, 0.2), 0, "divider-r");

  // Guest button
  const guestY = cardY + 292;
  const guestEl = rect(f, 40, guestY, W - 80, 52, rgba(C.white, 0), 14, "guest-btn");
  guestEl.strokes = [{ type: "SOLID", color: { ...C.white, a: 0.3 } }];
  guestEl.strokeWeight = 1;
  text(f, "🎮  Play as Guest", 40, guestY + 16, 14, 500, C.white, { w: W - 80, align: "CENTER" });

  text(f, "Sign in to save scores, streaks & compete on leaderboard", 40, cardY + 365, 11, 400, { r: 0.4, g: 0.4, b: 0.5 }, { w: W - 80, align: "CENTER", lineHeight: 17 });

  figma.currentPage.appendChild(f);
}

async function buildGridSelection() {
  const W = 390, H = 720;
  const f = frame("03 — Grid Selection (/play step 1)", W, H);

  text(f, "🏏", W/2 - 22, 32, 44, 400, C.dark);
  text(f, "Play Cricket Games", 40, 90, 26, 800, C.dark, { w: W - 80, align: "CENTER" });

  // Timer toggle (off state)
  const toggleEl = rect(f, (W - 280) / 2, 132, 280, 44, rgb(C.white), 22, "timer-toggle");
  toggleEl.strokes = [{ type: "SOLID", color: C.border }];
  toggleEl.strokeWeight = 2;
  text(f, "⏱ Timer OFF — play relaxed", (W - 280) / 2 + 16, 132 + 13, 12, 700, C.muted, { w: 220 });
  // toggle knob
  const trackEl = rect(f, (W - 280) / 2 + 216, 132 + 12, 36, 20, rgba(C.border, 1), 10, "track");
  rect(f, (W - 280) / 2 + 218, 132 + 14, 16, 16, rgb(C.white), 8, "knob");

  // Grid option cards (2×2 + 1 full-width)
  const cw = (W - 52) / 2;
  const modes = [
    { icon: "📅", title: "DAILY 3×3", sub: "Today's puzzle · 9 cells", color: C.green, shadow: C.greenDark },
    { icon: "📅", title: "DAILY 4×4", sub: "Today's puzzle · 16 cells", color: C.blue, shadow: { r: 0.1, g: 0.4, b: 0.8 } },
    { icon: "🏆", title: "IPL MODE", sub: "All 10 teams · IPL only", color: C.yellow, shadow: { r: 0.7, g: 0.55, b: 0.0 } },
    { icon: "🕵️", title: "GUESS WHO", sub: "5 clues · Name the player", color: C.orange, shadow: C.orangeDark, badge: "New" },
  ];
  modes.forEach((m, i) => {
    const mx = 20 + (i % 2) * (cw + 12);
    const my = 196 + Math.floor(i / 2) * 140;
    card(f, mx, my, cw, 125);
    if (m.badge) badge(f, mx + cw - 40, my + 10, m.badge, C.orange, C.white);
    iconBox(f, mx + cw / 2 - 28, my + 14, 56, m.color, m.shadow);
    text(f, m.icon, mx + cw / 2 - 14, my + 24, 28, 400, C.white);
    text(f, m.title, mx, my + 80, 13, 800, C.dark, { w: cw, align: "CENTER" });
    text(f, m.sub, mx, my + 98, 10, 600, C.muted, { w: cw, align: "CENTER" });
  });

  // VS Player — full width
  card(f, 20, 480, W - 40, 125);
  iconBox(f, W / 2 - 28, 493, 56, C.purple, { r: 0.35, g: 0.15, b: 0.72 });
  text(f, "⚔️", W / 2 - 14, 503, 28, 400, C.white);
  text(f, "VS PLAYER", 20, 562, 13, 800, C.dark, { w: W - 40, align: "CENTER" });
  text(f, "Real-time · Same grid · First to fill wins", 20, 580, 10, 600, C.muted, { w: W - 40, align: "CENTER" });

  figma.currentPage.appendChild(f);
}

async function buildGameBoard() {
  const W = 390, H = 820;
  const f = frame("04 — Game Board (/play step 2)", W, H);

  // Top bar
  topBar(f, W, "Jigar Shankhpal", true);

  // Game header
  const headerY = 68;
  card(f, 16, headerY, W - 32, 64);
  text(f, "Score", 32, headerY + 10, 10, 700, C.muted);
  text(f, "1,240", 32, headerY + 24, 22, 800, C.orange);
  text(f, "Streak 🔥3", W / 2 - 30, headerY + 10, 10, 700, C.muted);
  text(f, "3", W / 2 - 10, headerY + 24, 22, 800, C.orange);
  text(f, "?", W - 50, headerY + 22, 18, 700, C.muted);

  // Player card
  const pcY = 148;
  const pcEl = rect(f, 16, pcY, W - 32, 100, rgb(C.white), 16, "player-card");
  pcEl.strokes = [{ type: "SOLID", color: C.border }];
  pcEl.strokeWeight = 2;
  // Team accent stripe
  rect(f, 16, pcY, W - 32, 5, rgb(C.blue), 0, "accent-stripe");
  // Avatar
  const avEl = rect(f, 28, pcY + 18, 44, 44, rgba(C.blue, 0.15), 22, "player-avatar");
  avEl.strokes = [{ type: "SOLID", color: C.blue }];
  avEl.strokeWeight = 2;
  text(f, "MD", 37, pcY + 28, 13, 800, C.blue);
  text(f, "MS Dhoni", 82, pcY + 18, 20, 800, C.dark);
  text(f, "SKIP →", W - 80, pcY + 22, 11, 700, C.muted);
  // Wildcard btn
  const wbEl = rect(f, 28, pcY + 72, 92, 24, rgb(C.green), 12, "wildcard-btn");
  text(f, "⭐ Wild (2)", 32, pcY + 77, 10, 700, C.white);
  text(f, "ℹ", 130, pcY + 76, 12, 700, C.muted);
  text(f, "8 remaining", W - 100, pcY + 77, 11, 600, C.muted);

  // Bingo Meter
  const mY = 260;
  text(f, "Progress: 5 / 9 cells filled", 16, mY, 11, 700, C.muted);
  rect(f, 16, mY + 18, W - 32, 10, rgba(C.border, 0.5), 5, "meter-bg");
  rect(f, 16, mY + 18, (W - 32) * 5 / 9, 10, rgb(C.green), 5, "meter-fill");

  // Bingo Grid (3x3)
  const gridY = 300;
  const cellSize = (W - 40) / 3;
  const cellPad = 4;
  const categories = [
    { label: "INDIA",    icon: "🇮🇳", type: "country", color: C.orange },
    { label: "IPL",      icon: "🏆",  type: "trophy",  color: C.yellow },
    { label: "MI",       icon: "MI",  type: "team",    color: C.blue   },
    { label: "BAT",      icon: "🏏",  type: "role",    color: C.blue   },
    { label: "w/KOHLI",  icon: "👤",  type: "player",  color: C.green, filled: true, playerName: "Dhoni" },
    { label: "CWC",      icon: "🏆",  type: "trophy",  color: C.green  },
    { label: "WK",       icon: "🥊",  type: "role",    color: C.purple, eligible: true },
    { label: "NZL",      icon: "🇳🇿", type: "country", color: C.green  },
    { label: "10K RUNS", icon: "📊",  type: "stat",    color: C.green  },
  ];
  categories.forEach((cat, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const cx = 16 + col * cellSize + cellPad;
    const cy = gridY + row * cellSize + cellPad;
    const cw = cellSize - cellPad * 2;
    const ch = cellSize - cellPad * 2;

    if (cat.filled) {
      const filledEl = rect(f, cx, cy, cw, ch, rgb(C.green), 12, `cell-filled-${i}`);
      text(f, cat.playerName, cx, cy + ch / 2, 10, 800, C.white, { w: cw, align: "CENTER" });
      text(f, cat.label, cx, cy + ch / 2 + 14, 9, 700, { r: 1, g: 1, b: 1, a: 0.7 }, { w: cw, align: "CENTER" });
    } else {
      const cellEl = rect(f, cx, cy, cw, ch, rgb(C.white), 12, `cell-empty-${i}`);
      cellEl.strokes = cat.eligible
        ? [{ type: "SOLID", color: C.green }]
        : [{ type: "SOLID", color: C.border }];
      cellEl.strokeWeight = cat.eligible ? 2 : 1.5;
      if (cat.eligible) {
        const glowEl = rect(f, cx - 3, cy - 3, cw + 6, ch + 6, rgba(C.green, 0.12), 14, "eligible-glow");
      }
      text(f, cat.icon, cx, cy + 14, 28, 400, C.dark, { w: cw, align: "CENTER" });
      text(f, cat.label, cx, cy + ch - 20, 9, 700, C.muted, { w: cw, align: "CENTER" });
    }
  });

  // Mobile bottom bar
  const bbY = H - 60;
  rect(f, 0, bbY, W, 60, rgb(C.white), 0, "bottom-bar");
  rect(f, 0, bbY, W, 1, rgb(C.border), 0, "bottom-bar-border");
  const skipBtnEl = rect(f, 20, bbY + 10, 80, 40, rgb(C.white), 12, "skip-btn");
  skipBtnEl.strokes = [{ type: "SOLID", color: C.border }];
  skipBtnEl.strokeWeight = 2;
  text(f, "Skip", 27, bbY + 20, 13, 700, C.dark);
  text(f, "1,240", W/2 - 20, bbY + 12, 22, 800, C.orange, { w: 40 });
  text(f, "SCORE", W/2 - 16, bbY + 36, 8, 700, C.muted);
  rect(f, W - 100, bbY + 10, 80, 40, rgb(C.green), 12, "wild-btn");
  text(f, "Wild", W - 86, bbY + 20, 13, 700, C.white);

  figma.currentPage.appendChild(f);
}

async function buildGameOver() {
  const W = 390, H = 680;
  const f = frame("05 — Game Over Screen", W, H);

  // Win state
  text(f, "🏆", W/2 - 28, 32, 56, 400, C.yellow);
  text(f, "BINGO!", W/2 - 60, 96, 48, 800, C.yellow, { w: 120 });
  text(f, "You completed a line! +500 bonus", 40, 152, 13, 700, C.green, { w: W - 80, align: "CENTER" });

  // Percentile card
  const pcEl = rect(f, 40, 180, W - 80, 64, rgba(C.green, 0.08), 14, "percentile-card");
  pcEl.strokes = [{ type: "SOLID", color: C.green }];
  pcEl.strokeWeight = 2;
  text(f, "🔥 87% of players today", 40, 198, 14, 700, C.dark, { w: W - 80, align: "CENTER" });
  text(f, "Top performer!", 40, 218, 12, 500, C.muted, { w: W - 80, align: "CENTER" });

  // Score stats
  const sw2 = (W - 80) / 3;
  const statData = [
    { val: "1,740", label: "FINAL SCORE", color: C.orange },
    { val: "7/9",   label: "CELLS FILLED", color: C.blue },
    { val: "3",     label: "BEST STREAK", color: C.purple },
  ];
  statData.forEach((s, i) => {
    text(f, s.val, 40 + i * (sw2 + 8), 268, 28, 800, s.color, { w: sw2, align: "CENTER" });
    text(f, s.label, 40 + i * (sw2 + 8), 302, 9, 700, C.muted, { w: sw2, align: "CENTER" });
  });

  text(f, "🔥 3-day streak!", W/2 - 48, 330, 14, 800, C.orange);

  // Countdown
  text(f, "Next puzzle in:", 40, 360, 11, 700, C.muted, { w: W - 80, align: "CENTER" });
  text(f, "06:42:18", W/2 - 44, 378, 24, 800, C.dark);
  text(f, "✨ Challenge a friend to beat this score", 40, 414, 12, 700, C.purple, { w: W - 80, align: "CENTER" });

  // Action buttons
  const btns = [
    { label: "Share",       color: C.purple  },
    { label: "Challenge",   color: C.orange  },
    { label: "Card",        color: C.green   },
    { label: "Ranks",       color: C.yellow  },
    { label: "Play Again",  color: C.dark    },
    { label: "vs Bot",      color: C.purple  },
  ];
  const bw = (W - 80 - 8) / 3;
  btns.forEach((b, i) => {
    const bx = 40 + (i % 3) * (bw + 4);
    const by = 440 + Math.floor(i / 3) * 48;
    const btnEl = rect(f, bx, by, bw, 40, rgba(b.color, 0.12), 12, `btn-${b.label}`);
    btnEl.strokes = [{ type: "SOLID", color: b.color }];
    btnEl.strokeWeight = 1;
    text(f, b.label, bx, by + 12, 11, 700, b.color, { w: bw, align: "CENTER" });
  });

  // Guest sign-in prompt
  const gY = 548;
  const gEl = rect(f, 40, gY, W - 80, 80, rgba(C.green, 0.06), 14, "guest-prompt");
  gEl.strokes = [{ type: "SOLID", color: C.green }];
  gEl.strokeWeight = 2;
  text(f, "Sign in to save scores & streaks!", 40, gY + 12, 12, 700, C.dark, { w: W - 80, align: "CENTER" });
  rect(f, 80, gY + 36, W - 160, 32, rgb(C.green), 10, "signin-btn");
  text(f, "G  Sign in with Google", 80, gY + 44, 12, 700, C.white, { w: W - 160, align: "CENTER" });

  figma.currentPage.appendChild(f);
}

async function buildGuessGame() {
  // ── START SCREEN ──
  const W = 390;
  {
    const H = 680;
    const f = frame("06a — Guess: Start Screen (/guess)", W, H);
    text(f, "🕵️", W/2 - 20, 40, 48, 400, C.dark);
    text(f, "Guess the Cricketer", 40, 104, 24, 800, C.dark, { w: W - 80, align: "CENTER" });
    text(f, "We'll show you clues about a mystery\ncricket player — one at a time.", 40, 140, 13, 600, C.muted, { w: W - 80, align: "CENTER", lineHeight: 20 });

    const iw = (W - 80 - 16) / 3;
    [{ v: "10", l: "ROUNDS", c: C.green }, { v: "3", l: "LIVES", c: C.red }, { v: "5", l: "CLUES", c: C.orange }].forEach((item, i) => {
      card(f, 40 + i * (iw + 8), 192, iw, 70);
      text(f, item.v, 40 + i * (iw + 8), 206, 28, 800, item.c, { w: iw, align: "CENTER" });
      text(f, item.l, 40 + i * (iw + 8), 238, 9, 700, C.muted, { w: iw, align: "CENTER" });
    });

    card(f, 40, 280, W - 80, 130);
    text(f, "SCORING", 40, 296, 10, 700, C.muted, { w: W - 80 - 24, align: "LEFT" });
    text(f, "Guess with 3 clues", 52, 316, 12, 500, C.muted);
    text(f, "300 pts", W - 94, 316, 12, 800, C.green);
    text(f, "Reveal 4th clue", 52, 340, 12, 500, C.muted);
    text(f, "200 pts", W - 94, 340, 12, 800, C.orange);
    text(f, "Reveal all 5 clues", 52, 364, 12, 500, C.muted);
    text(f, "100 pts", W - 94, 364, 12, 800, C.red);
    rect(f, 52, 385, W - 120, 1, rgba(C.border, 0.7), 0, "divider");
    text(f, "Streak bonus: +50% per consecutive correct", 52, 394, 10, 500, C.muted, { w: W - 120 });

    rect(f, 40, 428, W - 80, 4, rgb(C.greenDark), 14, "btn-shadow");
    rect(f, 40, 416, W - 80, 52, rgb(C.green), 14, "start-btn");
    text(f, "🎯 Start Guessing!", 40, 433, 16, 700, C.white, { w: W - 80, align: "CENTER" });
    text(f, "← Back to Home", 40, 484, 13, 700, C.muted, { w: W - 80, align: "CENTER" });

    figma.currentPage.appendChild(f);
  }

  // ── ACTIVE ROUND ──
  {
    const H = 760;
    const f = frame("06b — Guess: Active Round", W, H);

    // Top bar
    rect(f, 0, 0, W, 52, rgba(C.white, 0.9), 0, "topbar");
    rect(f, 0, 52, W, 1, rgb(C.border), 0, "border");
    text(f, "← Exit", 16, 17, 13, 700, C.muted);
    text(f, "125 pts", W/2 - 24, 17, 13, 800, C.green);
    text(f, "3🔥", W/2 + 16, 17, 13, 800, C.orange);
    text(f, "❤️❤️🖤", W - 76, 15, 16, 400, C.red);

    // Progress
    text(f, "Round 3 of 10", 16, 68, 11, 700, C.muted);
    for (let i = 0; i < 10; i++) {
      const dotColor = i < 2 ? C.green : i === 2 ? C.orange : C.border;
      rect(f, W - 120 + i * 10, 72, 7, 7, rgba(dotColor, 1), 4, `dot-${i}`);
    }

    text(f, "🕵️ Who is this cricketer?", 40, 96, 18, 800, C.dark, { w: W - 80, align: "CENTER" });

    // Clue cards
    const clues = [
      { icon: "🌍", label: "COUNTRY", text: "India", color: C.blue, revealed: true },
      { icon: "⚾", label: "ROLE", text: "Batsman / All-Rounder", color: C.orange, revealed: true },
      { icon: "🏆", label: "TROPHIES", text: "IPL, CWC, T20 WC, CT", color: C.green, revealed: true },
      { icon: "?",  label: "Clue 4", text: "Reveal this clue...", color: C.border, revealed: false },
      { icon: "?",  label: "Clue 5", text: "Reveal this clue...", color: C.border, revealed: false },
    ];
    clues.forEach((clue, i) => {
      const cy = 132 + i * 60;
      const clueEl = rect(f, 16, cy, W - 32, 52, clue.revealed ? rgb(C.white) : rgba(C.border, 0.15), 12, `clue-${i}`);
      clueEl.strokes = clue.revealed
        ? [{ type: "SOLID", color: C.border }]
        : [{ type: "SOLID", color: C.border, opacity: 0.5 }];
      clueEl.strokeWeight = 2;
      clueEl.dashPattern = clue.revealed ? [] : [4, 4];
      rect(f, 28, cy + 8, 36, 36, rgba(clue.color, clue.revealed ? 1 : 0.3), 10, `clue-icon-${i}`);
      text(f, clue.icon, 34, cy + 15, 20, 400, clue.revealed ? C.white : C.muted);
      text(f, clue.label, 76, cy + 10, 9, 700, C.muted);
      text(f, clue.text, 76, cy + 24, 13, 700, clue.revealed ? C.dark : C.muted, { opacity: clue.revealed ? 1 : 0.5 });
    });

    // Reveal next clue btn
    const rnY = 444;
    const rnEl = rect(f, 16, rnY, W - 32, 44, rgba(C.orange, 0.05), 12, "reveal-btn");
    rnEl.strokes = [{ type: "SOLID", color: C.orange }];
    rnEl.strokeWeight = 2;
    rnEl.dashPattern = [4, 4];
    text(f, "💡 Reveal Next Clue (−100 pts)", 16, rnY + 13, 13, 700, C.orange, { w: W - 32, align: "CENTER" });

    // Search input
    const siEl = rect(f, 16, 504, W - 32, 48, rgb(C.white), 16, "search-input");
    siEl.strokes = [{ type: "SOLID", color: C.border }];
    siEl.strokeWeight = 2;
    text(f, "Type a player name...", 32, 520, 13, 500, C.muted, { opacity: 0.6 });
    // dropdown
    const ddEl = rect(f, 16, 555, W - 32, 96, rgb(C.white), 12, "dropdown");
    ddEl.strokes = [{ type: "SOLID", color: C.border }];
    ddEl.strokeWeight = 2;
    text(f, "🇮🇳 Virat Kohli", 32, 568, 13, 700, C.dark);
    text(f, "Batsman · RCB", 32, 586, 11, 500, C.muted);
    rect(f, 16, 604, W - 32, 1, rgba(C.border, 0.5), 0, "dd-divider");
    text(f, "🇮🇳 Virender Sehwag", 32, 614, 13, 700, C.dark);
    text(f, "Batsman · Delhi Daredevils", 32, 632, 11, 500, C.muted);

    text(f, "Skip this round →", 16, 668, 12, 700, C.muted, { w: W - 32, align: "CENTER" });

    figma.currentPage.appendChild(f);
  }
}

async function buildLeaderboard() {
  const W = 390, H = 780;
  const f = frame("07 — Leaderboard (/leaderboard)", W, H);

  // Header
  rect(f, 16, 16, 32, 32, rgba(C.border, 0.5), 8, "back-btn");
  text(f, "←", 22, 22, 14, 700, C.muted);
  text(f, "3×3 Top Scorers", 60, 20, 22, 800, C.dark);

  // Tabs
  const tab1El = rect(f, 16, 60, 100, 36, rgba(C.dark, 0.12), 12, "tab-3x3");
  tab1El.strokes = [{ type: "SOLID", color: C.dark, opacity: 0.4 }];
  tab1El.strokeWeight = 1;
  text(f, "3×3 Grid", 22, 72, 12, 700, C.dark);
  rect(f, 124, 60, 100, 36, rgba(C.border, 0.3), 12, "tab-4x4");
  text(f, "4×4 Grid", 130, 72, 12, 500, C.muted);

  // Your rank badge
  const yrEl = rect(f, 16, 108, W - 32, 36, rgba(C.green, 0.12), 10, "your-rank");
  yrEl.strokes = [{ type: "SOLID", color: C.green }];
  yrEl.strokeWeight = 1;
  text(f, "Your Rank: #4", 16, 118, 13, 800, C.green, { w: W - 32, align: "CENTER" });

  // Leaderboard card
  const lbEl = rect(f, 16, 156, W - 32, 520, rgb(C.white), 16, "leaderboard-card");
  lbEl.strokes = [{ type: "SOLID", color: C.border }];
  lbEl.strokeWeight = 2;

  const players = [
    { rank: "🥇", name: "Rohit Sharma",  score: 1890, won: true,  isMe: false, initials: "RS", color: C.orange },
    { rank: "🥈", name: "Sachin T.",     score: 1640, won: true,  isMe: false, initials: "ST", color: C.blue   },
    { rank: "🥉", name: "Virat Kohli",   score: 1520, won: true,  isMe: false, initials: "VK", color: C.green  },
    { rank: "#4", name: "Jigar S.",      score: 1350, won: true,  isMe: true,  initials: "JS", color: C.purple },
    { rank: "#5", name: "MS Dhoni",      score: 1240, won: true,  isMe: false, initials: "MD", color: C.yellow },
    { rank: "#6", name: "Jasprit B.",    score:  980, won: false, isMe: false, initials: "JB", color: C.red    },
    { rank: "#7", name: "Shreyas I.",    score:  820, won: false, isMe: false, initials: "SI", color: C.orange },
    { rank: "#8", name: "KL Rahul",      score:  740, won: true,  isMe: false, initials: "KR", color: C.blue   },
  ];

  players.forEach((p, i) => {
    const ry = 156 + i * 64;
    if (p.isMe) {
      const meEl = rect(f, 16, ry, W - 32, 64, rgba(C.purple, 0.1), 0, "my-row");
      rect(f, 16, ry, 4, 64, rgb(C.purple), 0, "my-border");
    } else if (i % 2 === 0) {
      rect(f, 16, ry, W - 32, 64, rgba(C.cream, 0.5), 0, `row-${i}`);
    }
    // divider
    if (i > 0) rect(f, 24, ry, W - 48, 1, rgba(C.border, 0.4), 0, `row-divider-${i}`);
    // rank
    text(f, p.rank, 24, ry + 22, p.rank.length === 2 ? 20 : 12, 800, p.isMe ? C.purple : C.muted);
    // avatar
    const avEl2 = rect(f, 66, ry + 14, 36, 36, rgba(p.color, 0.2), 18, `av-${i}`);
    avEl2.strokes = [{ type: "SOLID", color: p.isMe ? C.purple : C.border }];
    avEl2.strokeWeight = 2;
    text(f, p.initials, 70, ry + 23, 11, 800, p.color);
    // name
    const nameStr = p.isMe ? `${p.name} (you)` : p.name;
    text(f, nameStr, 112, ry + 23, 14, p.isMe ? 800 : 500, p.isMe ? C.purple : C.dark);
    // trophy/x
    text(f, p.won ? "🏆" : "✗", W - 76, ry + 22, p.won ? 16 : 14, 700, p.won ? C.yellow : C.red);
    // score
    text(f, String(p.score), W - 50, ry + 22, 18, 800, p.isMe ? C.purple : C.dark, { w: 44, align: "RIGHT" });
  });

  figma.currentPage.appendChild(f);
}

async function buildStats() {
  const W = 390, H = 900;
  const f = frame("08 — Stats (/stats)", W, H);

  // Header
  rect(f, 16, 16, 32, 32, rgba(C.border, 0.5), 8, "back");
  text(f, "←", 22, 22, 14, 700, C.muted);
  text(f, "Your Stats", 60, 20, 22, 800, C.dark);

  // Stat cards grid
  const statCards = [
    { icon: "🎯", label: "GAMES PLAYED", val: "24",   color: C.green  },
    { icon: "🏆", label: "WINS",         val: "18",   color: C.yellow },
    { icon: "%",  label: "WIN RATE",     val: "75%",  color: C.green  },
    { icon: "📈", label: "AVG SCORE",    val: "840",  color: C.blue   },
    { icon: "🔥", label: "CUR STREAK",   val: "3",    color: C.orange },
    { icon: "🔥", label: "BEST STREAK",  val: "7",    color: C.red    },
  ];
  const scw = (W - 48) / 3;
  statCards.forEach((sc, i) => {
    const sx = 16 + (i % 3) * (scw + 8);
    const sy = 64 + Math.floor(i / 3) * 100;
    card(f, sx, sy, scw, 88);
    text(f, sc.icon, sx, sy + 10, 22, 400, sc.color, { w: scw, align: "CENTER" });
    text(f, sc.val, sx, sy + 40, 28, 800, sc.color, { w: scw, align: "CENTER" });
    text(f, sc.label, sx, sy + 72, 8, 700, C.muted, { w: scw, align: "CENTER" });
  });

  // Best score
  card(f, 16, 280, W - 32, 80);
  text(f, "PERSONAL BEST", 16, 292, 10, 700, C.muted, { w: W - 32, align: "CENTER" });
  text(f, "1,890", 16, 308, 40, 800, C.yellow, { w: W - 32, align: "CENTER" });

  // Score distribution
  card(f, 16, 376, W - 32, 180);
  text(f, "Score Distribution", 32, 390, 12, 800, C.dark);
  const buckets = [
    { label: "0–200",   count: 2, pct: 0.10 },
    { label: "201–500", count: 4, pct: 0.22 },
    { label: "501–1K",  count: 8, pct: 0.44 },
    { label: "1K–2K",   count: 6, pct: 0.55 },
    { label: "2K+",     count: 4, pct: 0.33 },
  ];
  buckets.forEach((b, i) => {
    const by = 416 + i * 26;
    text(f, b.label, 32, by + 4, 10, 500, C.muted, { w: 52 });
    const barW = W - 32 - 96;
    rect(f, 92, by, barW, 20, rgba(C.border, 0.3), 4, `bar-bg-${i}`);
    rect(f, 92, by, barW * b.pct, 20, rgba(C.green, 0.7), 4, `bar-fill-${i}`);
    text(f, String(b.count), 92 + barW * b.pct - 16, by + 4, 10, 800, C.white);
  });

  // Recent games
  card(f, 16, 572, W - 32, 240);
  text(f, "Recent Games", 32, 586, 12, 800, C.dark);
  const recentGames = [
    { date: "2026-05-10", size: "3x3", score: 1890, won: true  },
    { date: "2026-05-09", size: "4x4", score: 1240, won: true  },
    { date: "2026-05-08", size: "3x3", score:  480, won: false },
    { date: "2026-05-07", size: "3x3", score: 1100, won: true  },
    { date: "2026-05-06", size: "4x4", score:  640, won: false },
    { date: "2026-05-05", size: "3x3", score: 1560, won: true  },
  ];
  recentGames.forEach((g, i) => {
    const gy = 610 + i * 32;
    rect(f, 32, gy, W - 64, 28, rgba(C.border, 0.15), 8, `recent-${i}`);
    text(f, g.won ? "🏆" : "✗", 40, gy + 6, 14, 700, g.won ? C.yellow : C.red);
    text(f, g.date, 62, gy + 8, 12, 500, C.muted);
    text(f, g.size, 162, gy + 8, 10, 600, C.muted);
    text(f, String(g.score), W - 76, gy + 8, 14, 800, C.dark, { w: 44, align: "RIGHT" });
  });

  figma.currentPage.appendChild(f);
}

async function buildBattleSetup() {
  const W = 390, H = 580;
  const f = frame("09 — Battle Setup (/battle)", W, H);
  f.fills = [{ type: "SOLID", color: { r: 0.04, g: 0.055, b: 0.153 } }];

  text(f, "⚔️", W/2 - 18, 48, 40, 400, C.white);
  text(f, "VS Player", W/2 - 44, 96, 22, 800, C.white, { w: 88 });
  text(f, "Real-time multiplayer cricket bingo", 40, 128, 13, 500, { r: 0.6, g: 0.7, b: 0.9 }, { w: W - 80, align: "CENTER" });

  // Create room card
  const cr = rect(f, 32, 168, W - 64, 160, rgba(C.white, 0.06), 16, "create-card");
  cr.strokes = [{ type: "SOLID", color: { ...C.white, a: 0.1 } }];
  cr.strokeWeight = 1;
  text(f, "Create Room", 48, 184, 16, 800, C.white);
  text(f, "Start a new game", 48, 206, 12, 500, { r: 0.6, g: 0.7, b: 0.9 });
  text(f, "Choose grid size:", 48, 228, 12, 500, { r: 0.6, g: 0.7, b: 0.9 });
  // Grid tabs
  const t1 = rect(f, 48, 248, 72, 32, rgba(C.green, 0.2), 8, "tab-3x3");
  t1.strokes = [{ type: "SOLID", color: C.green }];
  t1.strokeWeight = 1;
  text(f, "3×3", 56, 257, 13, 700, C.green);
  rect(f, 128, 248, 72, 32, rgba(C.white, 0.08), 8, "tab-4x4");
  text(f, "4×4", 136, 257, 13, 500, { r: 0.5, g: 0.6, b: 0.8 });
  rect(f, 48, 292, W - 96, 4, rgba(C.green, 0.5), 8, "create-btn-shadow");
  rect(f, 48, 280, W - 96, 40, rgb(C.green), 10, "create-btn");
  text(f, "Create Room →", 48, 293, 14, 700, C.white, { w: W - 96, align: "CENTER" });

  // Divider
  rect(f, 40, 344, (W - 100) / 2, 1, rgba(C.white, 0.2), 0, "div-l");
  text(f, "or join", W/2 - 20, 336, 11, 400, { r: 0.4, g: 0.4, b: 0.6 });
  rect(f, W/2 + 20, 344, (W - 100) / 2, 1, rgba(C.white, 0.2), 0, "div-r");

  // Join room card
  const jr = rect(f, 32, 364, W - 64, 120, rgba(C.white, 0.06), 16, "join-card");
  jr.strokes = [{ type: "SOLID", color: { ...C.white, a: 0.1 } }];
  jr.strokeWeight = 1;
  text(f, "Room Code", 48, 380, 10, 700, { r: 0.5, g: 0.6, b: 0.8 });
  const inputEl = rect(f, 48, 396, W - 96, 36, rgba(C.white, 0.08), 8, "code-input");
  inputEl.strokes = [{ type: "SOLID", color: { ...C.white, a: 0.2 } }];
  inputEl.strokeWeight = 1;
  text(f, "ABC123", 58, 406, 14, 700, C.white);
  rect(f, 48, 444, W - 96, 32, rgba(C.blue, 0.3), 8, "join-btn");
  text(f, "Join Room →", 48, 451, 13, 700, C.blue, { w: W - 96, align: "CENTER" });

  text(f, "← Back to Play", W/2 - 48, 504, 13, 700, { r: 0.4, g: 0.4, b: 0.6 });

  figma.currentPage.appendChild(f);
}

async function buildPlayerDatabase() {
  const W = 390, H = 1100;
  const f = frame("10 — Player Database (/players)", W, H);

  // Breadcrumb
  text(f, "Home / Player Database", 16, 20, 11, 500, C.muted);

  text(f, "Cricket Player\nDatabase", 16, 44, 36, 800, C.dark, { w: W - 32, lineHeight: 44 });
  text(f, "Browse all 1,145 cricket player cards in Cricket Bingo.", 16, 140, 13, 500, C.muted, { w: W - 32, lineHeight: 20 });
  text(f, "Data from Cricsheet (CC-BY-4.0)", 16, 168, 11, 500, C.green);

  // Filters card
  card(f, 16, 196, W - 32, 140);
  text(f, "SEARCH", 32, 208, 9, 700, C.muted);
  const si = rect(f, 32, 220, W - 64, 36, rgb(C.white), 10, "search");
  si.strokes = [{ type: "SOLID", color: C.border }];
  si.strokeWeight = 1;
  text(f, "Player name...", 44, 231, 12, 500, C.muted, { opacity: 0.6 });
  const fw = (W - 64 - 12) / 3;
  ["COUNTRY", "ROLE", "IPL TEAM"].forEach((lbl, i) => {
    const fx = 32 + i * (fw + 6);
    text(f, lbl, fx, 266, 9, 700, C.muted);
    const sel = rect(f, fx, 278, fw, 36, rgb(C.white), 8, `filter-${lbl}`);
    sel.strokes = [{ type: "SOLID", color: C.border }];
    sel.strokeWeight = 1;
    text(f, ["India ▾", "All ▾", "MI ▾"][i], fx + 8, 289, 12, 500, C.dark);
  });
  text(f, "Showing 50 of 1,145 players", 16, 352, 12, 500, C.muted);
  text(f, "Page 1 of 23", W - 86, 352, 12, 500, C.muted);

  // Table header
  card(f, 16, 372, W - 32, 480);
  const cols = ["Player", "Country", "Role", "Runs", "Wkts"];
  const cwidths = [120, 80, 80, 52, 40];
  let cx2 = 28;
  cols.forEach((col, i) => {
    text(f, col, cx2, 384, 12, 800, C.dark);
    cx2 += cwidths[i];
  });
  rect(f, 24, 400, W - 48, 1, rgba(C.border, 0.5), 0, "th-divider");

  const tableData = [
    { name: "MS Dhoni",      country: "🇮🇳 India", role: "WK-Bat",     runs: "10,773", wkts: "0",   rc: C.purple },
    { name: "Virat Kohli",   country: "🇮🇳 India", role: "Batsman",    runs: "25,891", wkts: "0",   rc: C.blue   },
    { name: "Rohit Sharma",  country: "🇮🇳 India", role: "Batsman",    runs: "17,663", wkts: "0",   rc: C.blue   },
    { name: "Jasprit Bumrah",country: "🇮🇳 India", role: "Fast Bowler",runs: "213",    wkts: "388", rc: C.red    },
    { name: "R. Ashwin",     country: "🇮🇳 India", role: "Spin Bowler",runs: "3,012",  wkts: "537", rc: C.orange },
    { name: "Ben Stokes",    country: "🇬🇧 Eng",   role: "All-Rounder",runs: "9,842",  wkts: "215", rc: C.green  },
    { name: "Kane Williamson",country:"🇳🇿 NZL",   role: "Batsman",    runs: "8,634",  wkts: "37",  rc: C.blue   },
    { name: "Pat Cummins",   country: "🇦🇺 Aus",   role: "Fast Bowler",runs: "1,200",  wkts: "298", rc: C.red    },
  ];
  tableData.forEach((row, i) => {
    const ry = 410 + i * 56;
    if (i % 2 === 0) rect(f, 16, ry, W - 32, 56, rgba(C.cream, 0.5), 0, `tr-bg-${i}`);
    rect(f, 16, ry + 56, W - 32, 1, rgba(C.border, 0.3), 0, `tr-div-${i}`);
    text(f, row.name, 28, ry + 14, 13, 700, C.green);
    text(f, row.country, 148, ry + 14, 11, 500, C.muted);
    const badgeEl = rect(f, 228, ry + 12, 72, 22, rgba(row.rc, 0.15), 11, `role-badge-${i}`);
    text(f, row.role.split(" ")[0], 232, ry + 15, 9, 700, row.rc);
    text(f, row.runs, 308, ry + 14, 12, 500, C.dark);
    text(f, row.wkts, W - 48, ry + 14, 12, 500, C.dark);
  });

  // Pagination
  const pgEl = rect(f, 40, 868, 100, 40, rgb(C.white), 10, "prev-btn");
  pgEl.strokes = [{ type: "SOLID", color: C.border }];
  pgEl.strokeWeight = 1;
  text(f, "← Previous", 52, 880, 13, 700, C.dark);
  text(f, "1 / 23", W/2 - 16, 880, 13, 500, C.muted);
  const nextEl = rect(f, W - 140, 868, 100, 40, rgb(C.white), 10, "next-btn");
  nextEl.strokes = [{ type: "SOLID", color: C.border }];
  nextEl.strokeWeight = 1;
  text(f, "Next →", W - 120, 880, 13, 700, C.dark);

  // Country breakdown
  text(f, "Players by Country", 16, 928, 18, 800, C.dark);
  const countries = [
    { name: "India", count: 312 }, { name: "Australia", count: 183 },
    { name: "England", count: 160 }, { name: "S Africa", count: 94 },
    { name: "Pakistan", count: 88 }, { name: "New Zealand", count: 74 },
  ];
  const ccw = (W - 44) / 3;
  countries.forEach((c, i) => {
    const cx3 = 16 + (i % 3) * (ccw + 6);
    const cy3 = 956 + Math.floor(i / 3) * 72;
    card(f, cx3, cy3, ccw, 60);
    text(f, String(c.count), cx3, cy3 + 8, 22, 800, C.green, { w: ccw, align: "CENTER" });
    text(f, c.name.toUpperCase(), cx3, cy3 + 36, 9, 700, C.muted, { w: ccw, align: "CENTER" });
  });

  figma.currentPage.appendChild(f);
}

async function buildPlayerProfile() {
  const W = 390, H = 1200;
  const f = frame("11 — Player Profile (/players/:id)", W, H);

  // Breadcrumb
  text(f, "Home / Players / MS Dhoni", 16, 20, 11, 500, C.muted);
  text(f, "MS Dhoni", 16, 48, 40, 800, C.dark);

  // Flag + role badge
  text(f, "🇮🇳 India", 16, 100, 13, 500, C.muted);
  const rb = rect(f, 92, 96, 80, 24, rgba(C.purple, 0.15), 12, "role-badge");
  text(f, "WK-Bat", 100, 101, 11, 700, C.purple);

  // Quick highlight cards
  const highlights = [
    { val: "10,773", label: "Career Runs", color: C.green  },
    { val: "0",      label: "Wickets",     color: C.orange },
    { val: "16",     label: "Centuries",   color: C.blue   },
    { val: "4",      label: "Trophies",    color: C.yellow },
  ];
  const hw = (W - 56) / 4;
  highlights.forEach((h, i) => {
    card(f, 16 + i * (hw + 8), 132, hw, 72);
    text(f, h.val, 16 + i * (hw + 8), 148, 16, 800, h.color, { w: hw, align: "CENTER" });
    text(f, h.label, 16 + i * (hw + 8), 172, 8, 700, C.muted, { w: hw, align: "CENTER" });
  });

  // About
  text(f, "About MS Dhoni", 16, 220, 18, 800, C.dark);
  text(f, "MS Dhoni is an India wicket-keeper batsman who has played 90 Test matches, 350 ODIs, 98 T20 Internationals for the India national cricket team. MS Dhoni has scored 10,773 career runs, including 16 centuries. MS Dhoni has represented CSK and MI in 250 IPL matches, scoring 5,082 runs. MS Dhoni is a winner of the IPL Champion, ICC Cricket World Cup, ICC T20 World Cup.", 16, 248, 12, 500, C.muted, { w: W - 32, lineHeight: 20 });

  // Career stats table
  text(f, "Career Statistics", 16, 360, 20, 800, C.dark);
  card(f, 16, 388, W - 32, 220);
  const stHdrs = ["Format", "Matches", "Runs", "Wickets"];
  const shw = [(W - 64) * 0.3, (W - 64) * 0.23, (W - 64) * 0.23, (W - 64) * 0.24];
  let shx = 28;
  stHdrs.forEach((h, i) => {
    text(f, h, shx, 400, 12, 800, C.dark);
    shx += shw[i];
  });
  rect(f, 20, 418, W - 40, 1, rgba(C.border, 0.5), 0, "th-line");
  const statRows = [
    { fmt: "Tests",            m: "90",  r: "4,876",  w: "0"   },
    { fmt: "ODIs",             m: "350", r: "10,773", w: "0"   },
    { fmt: "T20 Internationals", m: "98", r: "1,617", w: "0"  },
    { fmt: "IPL",              m: "250", r: "5,082",  w: "0"   },
  ];
  statRows.forEach((row, i) => {
    const sry = 428 + i * 36;
    if (i === statRows.length - 1) {
      // total row
    }
    rect(f, 20, sry + 36, W - 40, 1, rgba(C.border, 0.3), 0, `sr-div-${i}`);
    let srx = 28;
    [row.fmt, row.m, row.r, row.w].forEach((cell, j) => {
      text(f, cell, srx, sry + 10, 12, j === 0 ? 700 : 500, j === 0 ? C.dark : C.muted);
      srx += shw[j];
    });
  });
  // Total row
  rect(f, 16, 574, W - 32, 32, rgba(C.green, 0.06), 0, "total-row");
  text(f, "Career Total", 28, 582, 12, 800, C.dark);
  text(f, "10,773", 28 + shw[0] + shw[1], 582, 14, 800, C.green);
  text(f, "0", 28 + shw[0] + shw[1] + shw[2], 582, 14, 800, C.green);

  // IPL Teams
  text(f, "IPL Teams", 16, 628, 20, 800, C.dark);
  ["CSK", "MI", "India Cement"].forEach((team, i) => {
    const tEl = rect(f, 16 + i * 80, 654, 72, 32, rgb(C.white), 10, `team-${i}`);
    tEl.strokes = [{ type: "SOLID", color: C.border }];
    tEl.strokeWeight = 2;
    text(f, team, 18 + i * 80, 663, 12, 700, C.dark, { w: 68 });
  });

  // Trophies
  text(f, "International Trophies", 16, 704, 20, 800, C.dark);
  const trophies = [
    { name: "IPL Champion",    color: C.blue   },
    { name: "CWC",             color: C.green  },
    { name: "T20 World Cup",   color: C.purple },
    { name: "Champions Trophy",color: C.orange },
  ];
  trophies.forEach((tr, i) => {
    const tx = 16 + (i % 2) * 180;
    const ty = 730 + Math.floor(i / 2) * 40;
    const trEl = rect(f, tx, ty, 168, 30, rgba(tr.color, 0.12), 10, `trophy-${i}`);
    trEl.strokes = [{ type: "SOLID", color: tr.color, opacity: 0.3 }];
    trEl.strokeWeight = 1;
    text(f, tr.name, tx + 8, ty + 7, 11, 700, tr.color);
  });

  // Achievement categories
  text(f, "Achievement Categories", 16, 820, 20, 800, C.dark);
  ["Captains", "T20 WC Winners", "Orange Cap", "IPL Superstar"].forEach((cat, i) => {
    const acEl = rect(f, 16 + (i % 2) * 180, 848 + Math.floor(i / 2) * 36, 168, 28, rgba(C.purple, 0.08), 8, `cat-${i}`);
    acEl.strokes = [{ type: "SOLID", color: C.purple, opacity: 0.25 }];
    acEl.strokeWeight = 1;
    text(f, cat, 24 + (i % 2) * 180, 855 + Math.floor(i / 2) * 36, 11, 700, C.purple);
  });

  // CTA card
  card(f, 16, 940, W - 32, 140);
  text(f, "Play MS Dhoni in Cricket Bingo", 32, 956, 16, 800, C.dark, { w: W - 64 });
  text(f, "MS Dhoni appears as a player card in the daily Cricket Bingo puzzle. Place this card on CSK, WK-Bat, IPL Champion, or trophy categories to score points.", 32, 984, 11, 500, C.muted, { w: W - 64, lineHeight: 18 });
  rect(f, 32, 1044, 168, 4, rgb(C.greenDark), 10, "cta-shadow");
  rect(f, 32, 1032, 168, 36, rgb(C.green), 10, "cta-btn");
  text(f, "Play Cricket Bingo — Free", 36, 1041, 11, 700, C.white, { w: 160 });

  // Footer
  rect(f, 0, 1100, W, 1, rgb(C.border), 0, "footer-top");
  text(f, "Home · All Players · How to Play · Privacy · Terms", 16, 1116, 11, 700, C.muted, { w: W - 32, align: "CENTER" });
  text(f, "Cricket Bingo © 2025 · Data from Cricsheet (CC-BY-4.0)", 16, 1140, 10, 400, C.muted, { w: W - 32, align: "CENTER", opacity: 0.7 });

  figma.currentPage.appendChild(f);
}

// ── MAIN ─────────────────────────────────────────────

async function main() {
  await loadFonts();

  // Place all frames left to right
  await buildDesignSystem();
  await buildLanding();
  await buildLogin();
  await buildGridSelection();
  await buildGameBoard();
  await buildGameOver();
  await buildGuessGame();
  await buildLeaderboard();
  await buildStats();
  await buildBattleSetup();
  await buildPlayerDatabase();
  await buildPlayerProfile();

  figma.viewport.scrollAndZoomIntoView(figma.currentPage.children);
  figma.closePlugin("✅ Cricket Bingo — 12 frames generated!");
}

main().catch(err => figma.closePlugin("❌ Error: " + err.message));
