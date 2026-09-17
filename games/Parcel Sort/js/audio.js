let context = null;
let muted = false;

function getContext() {
  if (!context) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    context = new Ctor();
  }
  if (context.state === "suspended") context.resume();
  return context;
}

export function isMuted() {
  return muted;
}

export function setMuted(next) {
  muted = !!next;
  return muted;
}

export function toggleMuted() {
  muted = !muted;
  return muted;
}

export function resume() {
  try {
    getContext();
  } catch {
    /* no audio device */
  }
}

function beep({ freq, endFreq, duration = 0.1, type = "square", gain = 0.05 }) {
  if (muted) return;
  let audio;
  try {
    audio = getContext();
  } catch {
    return;
  }
  if (!audio) return;
  try {
    const osc = audio.createOscillator();
    const amp = audio.createGain();
    const now = audio.currentTime;
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), now + duration);
    }
    amp.gain.setValueAtTime(gain, now);
    amp.gain.exponentialRampToValueAtTime(1e-4, now + duration);
    osc.connect(amp).connect(audio.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  } catch {
    /* ignore */
  }
}

function noise(duration = 0.08, gain = 0.08) {
  if (muted) return;
  let audio;
  try {
    audio = getContext();
  } catch {
    return;
  }
  if (!audio) return;
  try {
    const n = Math.floor(audio.sampleRate * duration);
    if (!Number.isFinite(n) || n < 1) return;
    const buffer = audio.createBuffer(1, n, audio.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < n; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = audio.createBufferSource();
    const amp = audio.createGain();
    amp.gain.setValueAtTime(gain, audio.currentTime);
    src.buffer = buffer;
    src.connect(amp).connect(audio.destination);
    src.start();
  } catch {
    /* ignore */
  }
}

export function playPull() {
  beep({ freq: 430, endFreq: 140, duration: 0.09, gain: 0.05 });
  noise(0.05, 0.045);
}

export function playEarly() {
  beep({ freq: 680, endFreq: 900, duration: 0.07, gain: 0.035 });
}

export function playShip() {
  beep({ freq: 185, endFreq: 120, duration: 0.11, type: "triangle", gain: 0.055 });
}

export function playWrong() {
  beep({ freq: 210, endFreq: 85, duration: 0.3, type: "sawtooth", gain: 0.045 });
}

export function playThud() {
  noise(0.16, 0.1);
  beep({ freq: 92, endFreq: 44, duration: 0.24, type: "sine", gain: 0.09 });
}

export function playImpact() {
  noise(0.32, 0.13);
  beep({ freq: 68, endFreq: 30, duration: 0.42, type: "sine", gain: 0.11 });
}

export function playShift() {
  beep({ freq: 330, duration: 0.09, gain: 0.04 });
  setTimeout(() => beep({ freq: 494, duration: 0.13, gain: 0.04 }), 95);
}

export function playCombo(mult) {
  beep({ freq: 460 + mult * 130, duration: 0.08, gain: 0.035 });
}

export function playOver() {
  [440, 330, 247, 165].forEach((freq, i) => {
    setTimeout(() => beep({ freq, duration: 0.24, type: "triangle", gain: 0.06 }), i * 135);
  });
}
