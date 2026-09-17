let context = null;
let muted = false;
let musicTimer = null;
let musicTime = 0;
let melodyAt = 0;
let bassAt = 0;
let melodyIndex = 0;
let bassIndex = 0;
let beatIndex = 0;

const NOTES = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };
const MELODY = [
  ["C4", 0.5], ["E4", 0.5], ["G4", 1], ["E4", 0.5], ["G4", 0.5], ["A4", 0.5], ["G4", 1], ["-", 0.5],
  ["F4", 0.5], ["A4", 0.5], ["C5", 1], ["A4", 0.5], ["G4", 0.5], ["E4", 0.5], ["C4", 1], ["-", 0.5],
  ["G4", 0.5], ["E4", 0.5], ["C4", 0.5], ["E4", 0.5], ["F4", 0.5], ["D4", 0.5], ["C4", 2],
];
const BASS = [
  ["C3", 1], ["G2", 1], ["C3", 1], ["G2", 1], ["F2", 1], ["C3", 1], ["G2", 1], ["G2", 1],
];
const BEAT = 60 / 120;

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

function noteFreq(token) {
  if (!token || token === "-") return 0;
  const letter = token[0].toUpperCase();
  if (!(letter in NOTES)) return 0;
  let i = 1;
  let offset = NOTES[letter];
  if (token[i] === "#") {
    offset += 1;
    i += 1;
  } else if (token[i] === "b") {
    offset -= 1;
    i += 1;
  }
  const octave = Number(token.slice(i));
  if (!Number.isFinite(octave)) return 0;
  return 440 * Math.pow(2, (offset + (octave - 4) * 12) / 12);
}

function playTone(audio, freq, when, duration, type, gain) {
  if (freq <= 0) return;
  const osc = audio.createOscillator();
  const amp = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, when);
  amp.gain.setValueAtTime(1e-4, when);
  amp.gain.exponentialRampToValueAtTime(gain, when + 0.012);
  amp.gain.exponentialRampToValueAtTime(1e-4, when + duration * 0.92);
  osc.connect(amp).connect(audio.destination);
  osc.start(when);
  osc.stop(when + duration);
}

function playHat(audio, when) {
  const n = Math.floor(audio.sampleRate * 0.06);
  const buffer = audio.createBuffer(1, n, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < n; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = audio.createBufferSource();
  const amp = audio.createGain();
  amp.gain.setValueAtTime(0.028, when);
  src.buffer = buffer;
  src.connect(amp).connect(audio.destination);
  src.start(when);
}

function tickMusic() {
  const audio = getContext();
  if (!audio) return;
  if (muted) {
    musicTime = Math.max(musicTime, audio.currentTime);
    return;
  }
  while (musicTime < audio.currentTime + 0.12) {
    if (melodyAt <= musicTime + 1e-6) {
      const [note, beats] = MELODY[melodyIndex % MELODY.length];
      playTone(audio, noteFreq(note), musicTime, beats * BEAT, "square", 0.032);
      melodyIndex += 1;
      melodyAt += beats * BEAT;
    }
    if (bassAt <= musicTime + 1e-6) {
      const [note, beats] = BASS[bassIndex % BASS.length];
      playTone(audio, noteFreq(note), musicTime, beats * BEAT * 0.9, "triangle", 0.05);
      bassIndex += 1;
      bassAt += beats * BEAT;
    }
    if (beatIndex % 2 === 1) playHat(audio, musicTime);
    beatIndex += 1;
    musicTime += BEAT;
  }
}

export function startMusic() {
  if (musicTimer !== null) return;
  const audio = getContext();
  if (!audio) return;
  musicTime = audio.currentTime + 0.08;
  melodyAt = musicTime;
  bassAt = musicTime;
  melodyIndex = 0;
  bassIndex = 0;
  beatIndex = 0;
  musicTimer = setInterval(tickMusic, 25);
  tickMusic();
}

export function stopMusic() {
  if (musicTimer === null) return;
  clearInterval(musicTimer);
  musicTimer = null;
}

export function playSwing() {
  noise(0.05, 0.022);
  beep({ freq: 320, endFreq: 520, duration: 0.07, type: "sine", gain: 0.02 });
}

export function playBounce() {
  beep({ freq: 520, duration: 0.07, type: "triangle", gain: 0.05 });
  setTimeout(() => beep({ freq: 780, duration: 0.09, type: "triangle", gain: 0.045 }), 55);
}

export function playSoft() {
  noise(0.11, 0.05);
  beep({ freq: 240, endFreq: 180, duration: 0.09, type: "sawtooth", gain: 0.02 });
}

export function playMetal() {
  beep({ freq: 880, endFreq: 1180, duration: 0.22, type: "square", gain: 0.045 });
  setTimeout(() => beep({ freq: 1320, duration: 0.26, type: "sine", gain: 0.035 }), 60);
}

export function playChime() {
  [1046, 1318, 1568, 2093].forEach((freq, i) => {
    setTimeout(() => beep({ freq, duration: 0.3, type: "sine", gain: 0.045 }), i * 65);
  });
}

export function playBonus() {
  [523, 659, 784, 1047, 1319].forEach((freq, i) => {
    setTimeout(() => beep({ freq, duration: 0.26, type: "square", gain: 0.04 }), i * 70);
  });
  beep({ freq: 262, duration: 0.6, type: "triangle", gain: 0.03 });
}

export function playSplat() {
  beep({ freq: 130, endFreq: 70, duration: 0.13, type: "sine", gain: 0.05 });
  noise(0.06, 0.03);
}

export function playRound() {
  beep({ freq: 660, endFreq: 1320, duration: 0.14, type: "square", gain: 0.05 });
}

export function playCatch(type) {
  if (type === "ball") playBounce();
  else if (type === "teddy") playSoft();
  else if (type === "car") playMetal();
  else playChime();
}
