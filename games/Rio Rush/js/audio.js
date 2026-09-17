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

export function playTurn() {
  beep({ freq: 640, duration: 0.02, type: "square", gain: 0.01 });
}

export function playCollar() {
  noise(0.03, 0.022);
  beep({ freq: 740, duration: 0.06, type: "triangle", gain: 0.038 });
  setTimeout(() => {
    beep({ freq: 1110, duration: 0.09, type: "triangle", gain: 0.032 });
  }, 55);
}

export function playBust() {
  noise(0.16, 0.055);
  beep({ freq: 340, endFreq: 90, duration: 0.32, type: "sawtooth", gain: 0.045 });
}

export function playStart() {
  beep({ freq: 520, duration: 0.07, type: "square", gain: 0.03 });
  setTimeout(() => {
    beep({ freq: 780, duration: 0.09, type: "square", gain: 0.028 });
  }, 70);
}
