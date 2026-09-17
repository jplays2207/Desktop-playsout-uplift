export const RULES = {
  width: 320,
  height: 180,
  header: 12,
  beltTop: 84,
  beltBottom: 140,
  itemY0: 86,
  itemY1: 122,
  leftWall: 26,
  exitX: 278,
  rejectX: 44,
  rejectY: 150,
  robotX: 132,
  robotY: 10,
  hitRange: 13,
  sprite: 16,
  earlyX: 110,
  pullTime: 0.38,
  slamHit: 0.3,
  slamCrack: 0.58,
  slamEnd: 0.95,
  shiftDuration: 34,
  speedCap: 1.6,
  speedRamp: 0.12,
  maxOnBelt: 9,
  clawSpeed: 150,
  grabFlash: 0.13,
  shiftCard: 2,
  crateCap: 40,
  crateBar: 62,
};

export const SHIFTS = [
  { name: "RECEIVING", speed: 26, every: 1.5, spread: 0.3, clean: 0.6 },
  { name: "INBOUND", speed: 30, every: 1.3, spread: 0.45, clean: 0.6 },
  { name: "SCAN LINE", speed: 34, every: 1.1, spread: 0.65, clean: 0.58 },
  { name: "LABELING", speed: 38, every: 0.95, spread: 0.8, clean: 0.55 },
  { name: "PEAK HOUR", speed: 43, every: 0.85, spread: 1, clean: 0.53 },
  { name: "OUTBOUND", speed: 48, every: 0.75, spread: 1, clean: 0.5 },
  { name: "AUDIT", speed: 54, every: 0.65, spread: 1, clean: 0.5 },
];

export const CATALOG = [
  { id: "box_brown", clean: true, unlock: 1 },
  { id: "bag_white", clean: true, unlock: 1 },
  { id: "tube_kraft", clean: true, unlock: 1 },
  { id: "apple", clean: false, unlock: 1 },
  { id: "cat", clean: false, unlock: 1 },
  { id: "banana", clean: false, unlock: 1 },
  { id: "box_tape", clean: true, unlock: 2 },
  { id: "duck", clean: false, unlock: 2 },
  { id: "box_label", clean: true, unlock: 3 },
  { id: "cactus", clean: false, unlock: 3 },
  { id: "fish", clean: false, unlock: 3 },
  { id: "bag_yellow", clean: true, unlock: 4 },
  { id: "fern", clean: false, unlock: 4 },
  { id: "burger", clean: false, unlock: 4 },
  { id: "box_small", clean: true, unlock: 5 },
  { id: "bird", clean: false, unlock: 5 },
  { id: "box_stripe", clean: true, unlock: 6 },
  { id: "frog", clean: false, unlock: 6 },
];

function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s += 1831565813;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function viewSize() {
  return { width: RULES.width, height: RULES.height };
}

export function beltSpeed(world) {
  const base = SHIFTS[world.shiftIdx].speed;
  return base * Math.min(RULES.speedCap, 1 + (world.runT / 60) * RULES.speedRamp);
}

export function comboMult(combo) {
  if (combo >= 30) return 4;
  if (combo >= 15) return 3;
  if (combo >= 6) return 2;
  return 1;
}

export function outboundGrade(shipped) {
  if (shipped >= 34) return "EXPRESS";
  if (shipped >= 26) return "PRIORITY";
  if (shipped >= 18) return "STANDARD";
  if (shipped >= 10) return "DEFERRED";
  return "BULK";
}

export function rejectPercent(world) {
  if (!world.seen) return 0;
  return Math.round((world.treated / world.seen) * 100);
}

export function pullPos(item) {
  const e = Math.min(1, item.pull.t / RULES.pullTime);
  return {
    x: item.pull.x0 + (RULES.rejectX - 8 - item.pull.x0) * e,
    y: item.pull.y0 + (RULES.rejectY - item.pull.y0) * e - Math.sin(e * Math.PI) * 26,
  };
}

let nextId = 1;

function blankWorld(rng, intro) {
  return {
    phase: intro ? "intro" : "playing",
    rng,
    elapsed: 0,
    t: 0,
    runT: 0,
    shiftT: 0,
    shiftIdx: 0,
    beltX: 0,
    spawnIn: 0.6,
    items: [],
    suit: 0,
    score: 0,
    combo: 0,
    bestCombo: 0,
    shipped: 0,
    seen: 0,
    treated: 0,
    slam: null,
    cracks: [],
    events: [],
    px: -99,
    py: -99,
    hitAt: -9,
    shiftCard: intro ? 0 : 2,
  };
}

function copyInto(world, next) {
  for (const key of Object.keys(next)) world[key] = next[key];
}

export function createWorld({ seed = 1, intro = true } = {}) {
  return blankWorld(makeRng(seed), intro);
}

export function resetToIntro(world) {
  copyInto(world, blankWorld(world.rng, true));
}

export function startPlaying(world) {
  if (world.phase === "playing") return false;
  copyInto(world, blankWorld(world.rng, false));
  return true;
}

export function setClaw(world, x, y) {
  world.px = x;
  world.py = y;
}

export function nudgeClaw(world, dt, dx, dy) {
  if (!dx && !dy) return;
  if (world.px < -50) {
    world.px = RULES.width / 2;
    world.py = (RULES.itemY0 + RULES.itemY1) / 2;
  }
  world.px = Math.max(2, Math.min(RULES.width - 2, world.px + dx * RULES.clawSpeed * dt));
  world.py = Math.max(RULES.beltTop, Math.min(RULES.beltBottom, world.py + dy * RULES.clawSpeed * dt));
}

function noteCombo(world, prev) {
  const next = comboMult(world.combo);
  if (next > comboMult(prev)) world.events.push({ type: "combo", mult: next });
}

export function grab(world, x, y) {
  if (world.phase !== "playing") return false;
  world.hitAt = world.elapsed;
  let best = -1;
  let bestDist = 1e9;
  for (let i = 0; i < world.items.length; i += 1) {
    const it = world.items[i];
    if (it.pull || it.x + 16 < RULES.leftWall || it.x > RULES.exitX) continue;
    const cx = it.x + 8;
    const cy = it.y + 8;
    const dist = Math.abs(cx - x) + Math.abs(cy - y);
    if (dist < bestDist && Math.abs(cx - x) < RULES.hitRange && Math.abs(cy - y) < RULES.hitRange) {
      bestDist = dist;
      best = i;
    }
  }
  if (best < 0) return false;
  const it = world.items[best];
  if (it.clean) {
    world.score = Math.max(0, world.score - 150);
    world.combo = 0;
    world.events.push({ type: "wrong", x: it.x, y: it.y });
    it.x = Math.max(RULES.leftWall, it.x - 12);
    return true;
  }
  const prev = world.combo;
  const early = it.x < RULES.earlyX;
  const gained = (early ? 150 : 100) * comboMult(world.combo);
  world.score += gained;
  world.combo += 1;
  world.bestCombo = Math.max(world.bestCombo, world.combo);
  world.events.push({ type: "pull", x: it.x, y: it.y, score: gained, early });
  if (early) world.events.push({ type: "early", x: it.x, y: it.y });
  noteCombo(world, prev);
  it.pull = { t: 0, x0: it.x, y0: it.y };
  return true;
}

function poolFor(shiftIdx) {
  const n = shiftIdx + 1;
  return CATALOG.filter((item) => item.unlock <= n);
}

function spawnItem(world) {
  const shift = SHIFTS[world.shiftIdx];
  const pool = poolFor(world.shiftIdx);
  const cleanPool = pool.filter((i) => i.clean);
  const junkPool = pool.filter((i) => !i.clean);
  const useClean = world.rng() < shift.clean && cleanPool.length;
  const list = useClean ? cleanPool : junkPool.length ? junkPool : cleanPool;
  if (!list.length) return;
  const kind = list[Math.floor(world.rng() * list.length)];
  const x = -18 - world.rng() * 12;
  const mid = (RULES.itemY0 + RULES.itemY1) / 2;
  const half = ((RULES.itemY1 - RULES.itemY0) / 2) * shift.spread;
  let y = mid;
  for (let n = 0; n < 8; n += 1) {
    y = mid + (world.rng() * 2 - 1) * half;
    const clash = world.items.some(
      (it) => !it.pull && Math.abs(it.x - x) < 20 && Math.abs(it.y - y) < 13,
    );
    if (!clash) break;
  }
  world.items.push({
    id: nextId,
    kind: kind.id,
    clean: kind.clean,
    x,
    y: Math.round(y),
    rot: world.rng() < 0.45 ? (world.rng() < 0.5 ? -1 : 1) * (Math.PI / 20) : 0,
    pull: null,
  });
  nextId += 1;
  world.seen += 1;
  if (!kind.clean) world.treated += 1;
}

function shipItem(world, it) {
  if (it.clean) {
    const prev = world.combo;
    const gained = 25 * comboMult(world.combo);
    world.score += gained;
    world.shipped += 1;
    world.combo += 1;
    world.bestCombo = Math.max(world.bestCombo, world.combo);
    world.events.push({ type: "ship", x: RULES.exitX - 20, y: it.y, score: gained });
    noteCombo(world, prev);
    return;
  }
  world.combo = 0;
  world.slam = {
    t: 0,
    hitHim: false,
    cracked: false,
    item: CATALOG.find((c) => c.id === it.kind) ?? it,
    fromX: RULES.exitX - 14,
    fromY: it.y,
    final: world.suit >= 4,
  };
}

export function updateWorld(world, dt) {
  world.elapsed += dt;
  world.t += dt;
  if (world.slam) {
    world.slam.t += dt;
    if (!world.slam.hitHim && world.slam.t >= RULES.slamHit) {
      world.slam.hitHim = true;
      world.suit = Math.min(5, world.suit + 1);
      world.events.push({ type: "thud" });
    }
    if (!world.slam.cracked && world.slam.t >= RULES.slamCrack) {
      world.slam.cracked = true;
      world.cracks.push({
        seed: 1000 + world.cracks.length * 7919,
        big: world.slam.final,
      });
      world.events.push({ type: "impact" });
    }
    if (world.slam.t >= RULES.slamEnd) {
      const fin = world.slam.final;
      world.slam = null;
      if (fin) {
        world.phase = "over";
        world.events.push({
          type: "over",
          score: world.score,
          shipped: world.shipped,
        });
      }
    }
    return;
  }
  if (world.phase === "over") return;
  if (world.phase !== "playing") return;

  world.shiftT += dt;
  world.runT += dt;
  world.shiftCard = Math.max(0, world.shiftCard - dt);
  if (world.shiftT >= RULES.shiftDuration && world.shiftIdx < SHIFTS.length - 1) {
    world.shiftT = 0;
    world.shiftIdx += 1;
    world.shiftCard = RULES.shiftCard;
    world.events.push({ type: "shift", name: SHIFTS[world.shiftIdx].name });
  }

  const speed = beltSpeed(world);
  world.beltX += speed * dt;
  world.spawnIn -= dt;
  const onBelt = world.items.reduce((n, it) => n + (it.pull ? 0 : 1), 0);
  if (world.spawnIn <= 0 && onBelt < RULES.maxOnBelt) {
    world.spawnIn = SHIFTS[world.shiftIdx].every * (0.65 + world.rng() * 0.7);
    spawnItem(world);
  }

  for (let i = world.items.length - 1; i >= 0; i -= 1) {
    const it = world.items[i];
    if (it.pull) {
      it.pull.t += dt;
      if (it.pull.t >= RULES.pullTime) world.items.splice(i, 1);
      continue;
    }
    it.x += speed * dt;
    if (it.x >= RULES.exitX + 6) {
      shipItem(world, it);
      world.items.splice(i, 1);
    }
  }
}
