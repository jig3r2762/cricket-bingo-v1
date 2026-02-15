// Simple synthesized sound effects using Web Audio API
// No external files needed — generates sounds programmatically

const STORAGE_KEY = "cricket-bingo-sound";

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try {
      audioCtx = new AudioContext();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

export function isSoundEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "false";
  } catch {
    return true;
  }
}

export function setSoundEnabled(enabled: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
  } catch {}
}

function playTone(frequency: number, duration: number, type: OscillatorType = "sine", gain = 0.15) {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  if (!ctx) return;

  // Resume context if suspended (Chrome autoplay policy)
  if (ctx.state === "suspended") ctx.resume();

  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  g.gain.value = gain;
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

export function playCorrect() {
  playTone(523, 0.12, "sine", 0.12); // C5
  setTimeout(() => playTone(659, 0.12, "sine", 0.12), 80); // E5
  setTimeout(() => playTone(784, 0.2, "sine", 0.12), 160); // G5
}

export function playWrong() {
  playTone(220, 0.15, "sawtooth", 0.08); // A3
  setTimeout(() => playTone(196, 0.25, "sawtooth", 0.08), 100); // G3
}

export function playSkip() {
  playTone(440, 0.08, "triangle", 0.06); // A4 quick blip
}

export function playWildcard() {
  playTone(880, 0.1, "sine", 0.1);
  setTimeout(() => playTone(1047, 0.1, "sine", 0.1), 60);
  setTimeout(() => playTone(1319, 0.15, "sine", 0.1), 120);
}

export function playBingo() {
  // Triumphant ascending chord
  const notes = [523, 659, 784, 1047, 1319]; // C5 E5 G5 C6 E6
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.3, "sine", 0.12), i * 100);
  });
  // Add a crowd "roar" noise
  setTimeout(() => {
    const ctx = getCtx();
    if (!ctx || !isSoundEnabled()) return;
    const bufferSize = ctx.sampleRate * 0.8;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const g = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 800;
    g.gain.value = 0.06;
    source.connect(filter);
    filter.connect(g);
    g.connect(ctx.destination);
    source.start();
  }, 500);
}

export function playGameOver() {
  playTone(392, 0.2, "sine", 0.1); // G4
  setTimeout(() => playTone(349, 0.2, "sine", 0.1), 150); // F4
  setTimeout(() => playTone(330, 0.2, "sine", 0.1), 300); // E4
  setTimeout(() => playTone(262, 0.4, "sine", 0.1), 450); // C4
}
