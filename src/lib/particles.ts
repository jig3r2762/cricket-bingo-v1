/**
 * Lightweight particle effects using the Web Animations API.
 * No deps. Cleans up after itself. Respects prefers-reduced-motion.
 */

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

interface BurstOptions {
  /** Number of particles. Default 14. */
  count?: number;
  /** Pixel radius particles travel. Default 80. */
  radius?: number;
  /** Particle hex colors to pick from. Default neon green/gold mix. */
  colors?: string[];
  /** Particle size in px. Default 6. */
  size?: number;
  /** Duration in ms. Default 700. */
  duration?: number;
}

/**
 * Radial particle burst centered at viewport coordinates (x, y).
 * Used on cell-correct, score milestones, etc.
 */
export function burstAt(x: number, y: number, opts: BurstOptions = {}) {
  if (typeof document === "undefined") return;
  if (prefersReducedMotion()) return;

  const {
    count = 14,
    radius = 80,
    colors = ["#22c55e", "#facc15", "#22d3ee", "#fff"],
    size = 6,
    duration = 700,
  } = opts;

  const layer = ensureLayer();

  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    const color = colors[i % colors.length];
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
    const dist = radius * (0.6 + Math.random() * 0.6);
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    const rot = (Math.random() - 0.5) * 360;
    const dur = duration * (0.8 + Math.random() * 0.4);
    const s = size * (0.7 + Math.random() * 0.7);

    p.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: ${s}px;
      height: ${s}px;
      border-radius: 2px;
      background: ${color};
      box-shadow: 0 0 ${s * 2}px ${color};
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 9998;
      will-change: transform, opacity;
    `;
    layer.appendChild(p);

    const anim = p.animate(
      [
        { transform: "translate(-50%, -50%) scale(0.5) rotate(0deg)", opacity: 1 },
        { transform: `translate(calc(-50% + ${dx * 0.6}px), calc(-50% + ${dy * 0.6 - 8}px)) scale(1.1) rotate(${rot * 0.6}deg)`, opacity: 1, offset: 0.4 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy + 30}px)) scale(0.3) rotate(${rot}deg)`, opacity: 0 },
      ],
      { duration: dur, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)", fill: "forwards" }
    );
    anim.onfinish = () => p.remove();
  }
}

/**
 * Burst from a DOM element's center.
 */
export function burstAtEl(el: HTMLElement | null, opts: BurstOptions = {}) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  burstAt(r.left + r.width / 2, r.top + r.height / 2, opts);
}

/**
 * Big celebratory radial burst at viewport center. Used on BINGO.
 */
export function bingoBurst() {
  if (typeof window === "undefined") return;
  if (prefersReducedMotion()) return;
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  burstAt(cx, cy, { count: 36, radius: 280, size: 10, duration: 1100 });
  setTimeout(() => burstAt(cx, cy, { count: 24, radius: 180, size: 8, duration: 900, colors: ["#facc15", "#fff", "#22c55e"] }), 120);
  setTimeout(() => burstAt(cx, cy, { count: 16, radius: 120, size: 6, duration: 700, colors: ["#22d3ee", "#facc15"] }), 260);
}

/** A single shared layer so we don't churn DOM */
let layerEl: HTMLDivElement | null = null;
function ensureLayer(): HTMLDivElement {
  if (layerEl && document.body.contains(layerEl)) return layerEl;
  layerEl = document.createElement("div");
  layerEl.setAttribute("aria-hidden", "true");
  layerEl.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9998;";
  document.body.appendChild(layerEl);
  return layerEl;
}
