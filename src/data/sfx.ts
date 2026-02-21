/**
 * Futuristic UI sound effects — Web Audio API synthesis.
 * Layered oscillators, filter sweeps, detuned harmonics.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

/* ── Tab switch — sci-fi scanner blip with harmonic tail ── */
export function sfxTab() {
  try {
    const ac = getCtx();
    const t = ac.currentTime;

    // Layer 1: fast rising sweep (square → filtered)
    const o1 = ac.createOscillator();
    o1.type = "square";
    o1.frequency.setValueAtTime(300, t);
    o1.frequency.exponentialRampToValueAtTime(2400, t + 0.06);

    const filter = ac.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(3000, t + 0.06);
    filter.Q.value = 5;

    const g1 = ac.createGain();
    g1.gain.setValueAtTime(0, t);
    g1.gain.linearRampToValueAtTime(0.06, t + 0.005);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    o1.connect(filter).connect(g1).connect(ac.destination);
    o1.start(t);
    o1.stop(t + 0.11);

    // Layer 2: detuned sine harmonic shimmer
    const o2 = ac.createOscillator();
    o2.type = "sine";
    o2.frequency.setValueAtTime(1200, t);
    o2.frequency.exponentialRampToValueAtTime(1800, t + 0.08);
    o2.detune.value = 12;

    const g2 = ac.createGain();
    g2.gain.setValueAtTime(0, t);
    g2.gain.linearRampToValueAtTime(0.04, t + 0.01);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    o2.connect(g2).connect(ac.destination);
    o2.start(t);
    o2.stop(t + 0.16);
  } catch {
    /* Audio not available */
  }
}

/* ── Language toggle — crystalline two-tone phase shift ── */
export function sfxLang() {
  try {
    const ac = getCtx();
    const t = ac.currentTime;

    // Tone 1: crystalline ping
    const o1 = ac.createOscillator();
    o1.type = "sine";
    o1.frequency.value = 1047; // C6
    o1.detune.value = -5;

    const g1 = ac.createGain();
    g1.gain.setValueAtTime(0.05, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    o1.connect(g1).connect(ac.destination);
    o1.start(t);
    o1.stop(t + 0.09);

    // Tone 2: higher, phased
    const o2 = ac.createOscillator();
    o2.type = "sine";
    o2.frequency.value = 1568; // G6
    o2.detune.value = 8;

    const g2 = ac.createGain();
    g2.gain.setValueAtTime(0, t);
    g2.gain.linearRampToValueAtTime(0.05, t + 0.06);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    o2.connect(g2).connect(ac.destination);
    o2.start(t + 0.04);
    o2.stop(t + 0.15);

    // Subtle sub-bass thump
    const sub = ac.createOscillator();
    sub.type = "sine";
    sub.frequency.setValueAtTime(120, t);
    sub.frequency.exponentialRampToValueAtTime(60, t + 0.06);
    const gs = ac.createGain();
    gs.gain.setValueAtTime(0.04, t);
    gs.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    sub.connect(gs).connect(ac.destination);
    sub.start(t);
    sub.stop(t + 0.08);
  } catch {
    /* Audio not available */
  }
}

/* ── Click / navigate — filtered digital boop ── */
export function sfxClick() {
  try {
    const ac = getCtx();
    const t = ac.currentTime;

    // Main tone: descending with resonant filter
    const osc = ac.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.1);

    const filter = ac.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(4000, t);
    filter.frequency.exponentialRampToValueAtTime(600, t + 0.1);
    filter.Q.value = 8;

    const gain = ac.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.07, t + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(filter).connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.13);
  } catch {
    /* Audio not available */
  }
}

/* ── Share — outward broadcast pulse ── */
export function sfxShare() {
  try {
    const ac = getCtx();
    const t = ac.currentTime;

    const o1 = ac.createOscillator();
    o1.type = "sine";
    o1.frequency.setValueAtTime(880, t);
    o1.frequency.exponentialRampToValueAtTime(1760, t + 0.08);

    const g1 = ac.createGain();
    g1.gain.setValueAtTime(0, t);
    g1.gain.linearRampToValueAtTime(0.06, t + 0.005);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    o1.connect(g1).connect(ac.destination);
    o1.start(t);
    o1.stop(t + 0.16);

    const o2 = ac.createOscillator();
    o2.type = "triangle";
    o2.frequency.setValueAtTime(1320, t + 0.04);
    o2.frequency.exponentialRampToValueAtTime(2200, t + 0.12);
    o2.detune.value = 8;

    const g2 = ac.createGain();
    g2.gain.setValueAtTime(0, t + 0.04);
    g2.gain.linearRampToValueAtTime(0.04, t + 0.05);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    o2.connect(g2).connect(ac.destination);
    o2.start(t + 0.04);
    o2.stop(t + 0.21);
  } catch {
    /* Audio not available */
  }
}

/* ── Copy success — ascending sci-fi chime ── */
export function sfxSuccess() {
  try {
    const ac = getCtx();
    const t = ac.currentTime;

    // Three ascending notes, each slightly detuned
    const notes = [
      { freq: 784, detune: 0, delay: 0 },       // G5
      { freq: 1047, detune: 6, delay: 0.07 },    // C6
      { freq: 1319, detune: -4, delay: 0.14 },   // E6
    ];

    notes.forEach(({ freq, detune, delay }) => {
      const osc = ac.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.detune.value = detune;

      const gain = ac.createGain();
      gain.gain.setValueAtTime(0, t + delay);
      gain.gain.linearRampToValueAtTime(0.05, t + delay + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.18);

      osc.connect(gain).connect(ac.destination);
      osc.start(t + delay);
      osc.stop(t + delay + 0.19);
    });
  } catch {
    /* Audio not available */
  }
}
