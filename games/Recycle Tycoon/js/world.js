export const RULES = {
  width: 256,
  height: 224,
  ground: 176,
  ceiling: 18,
  gravity: 78,
  lift: 104,
  grabs: 3,
  targetsPerRound: 10,
  maxMisses: 3,
  maxBonuses: 3,
  bonusPeriod: 3.6,
  readyDelay: 0.6,
  struckDelay: 0.45,
  escapedDelay: 0.7,
  perfectBonus: 50,
  launch0: 38,
  cursorSpeed: 150,
};

export const ITEMS = {
  ball: { value: 1, weight: 42, speed: 1, w: 16, h: 14 },
  teddy: { value: 5, weight: 30, speed: 1.15, w: 16, h: 14 },
  car: { value: 20, weight: 20, speed: 1.35, w: 14, h: 12 },
  robot: { value: 100, weight: 8, speed: 1.7, w: 10, h: 10, noSpin: true },
};

export const BONUSES = {
  plane: { value: 150, weight: 34, motion: "flutter", w: 14, h: 9, life: 5.5 },
  board: { value: 200, weight: 26, motion: "lob", w: 14, h: 9, life: 4.5 },
  balloon: { value: 300, weight: 20, motion: "float", w: 13, h: 9, life: 6 },
  rc: { value: 500, weight: 14, motion: "glide", w: 19, h: 10, life: 3.4 },
  chest: { value: 1000, weight: 6, motion: "streak", w: 14, h: 11, life: 2.4 },
};

const ITEM_IDS = Object.keys(ITEMS);
const BONUS_IDS = Object.keys(BONUSES);

const PROFILES = [
  { name: "arc", weight: 52, lift: [0.92, 1.1], drive: [0.9, 1.15], spin: [-2.2, 2.2] },
  { name: "floater", weight: 24, lift: [1.1, 1.26], drive: [0.55, 0.78], spin: [-1.1, 1.1] },
  { name: "liner", weight: 24, lift: [0.6, 0.76], drive: [1.35, 1.7], spin: [-4.5, 4.5] },
];

export function viewSize() {
  return { width: RULES.width, height: RULES.height };
}

export function launchBase(round) {
  let speed = RULES.launch0;
  for (let n = 2; n <= round; n += 1) {
    speed += 9 + (n - 2) * 4;
  }
  return speed;
}

export function flightLimit(round) {
  return Math.max(2.2, 8 - (round - 1) * 0.55);
}

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

function pick(list, weights, rng) {
  const total = weights.reduce((sum, w) => sum + w, 0);
  let roll = rng() * total;
  for (let i = 0; i < list.length; i += 1) {
    roll -= weights[i];
    if (roll <= 0) return list[i];
  }
  return list[list.length - 1];
}

function lerpRange(range, t) {
  return range[0] + (range[1] - range[0]) * t;
}

function pickItem(round, rng) {
  const boost = Math.min((round - 1) * 0.12, 1.2);
  const weights = ITEM_IDS.map((id, s) => ITEMS[id].weight * (1 + boost * (s / (ITEM_IDS.length - 1))));
  return pick(ITEM_IDS, weights, rng);
}

function pickProfile(rng) {
  return pick(PROFILES, PROFILES.map((p) => p.weight), rng);
}

function pickBonus(rng) {
  return pick(BONUS_IDS, BONUS_IDS.map((id) => BONUSES[id].weight), rng);
}

function spawnTarget(round, rng) {
  const type = pickItem(round, rng);
  const spec = ITEMS[type];
  const profile = pickProfile(rng);
  const jitter = 0.9 + rng() * 0.2;
  const speed = launchBase(round) * spec.speed * lerpRange(profile.drive, rng()) * jitter;
  const fromLeft = rng() < 0.5;
  return {
    type,
    profile: profile.name,
    value: spec.value,
    w: spec.w,
    h: spec.h,
    x: fromLeft ? -spec.w : RULES.width,
    y: RULES.ground - spec.h - 4 - rng() * 8,
    vx: (fromLeft ? 1 : -1) * speed,
    vy: -RULES.lift * lerpRange(profile.lift, rng()),
    speed,
    spin: spec.noSpin ? 0 : lerpRange(profile.spin, rng()),
    rot: 0,
    phase: "flying",
    timer: 0,
    bobT: 0,
  };
}

function spawnBonus(rng) {
  const kind = pickBonus(rng);
  const spec = BONUSES[kind];
  const fromLeft = rng() < 0.5;
  const dir = fromLeft ? 1 : -1;
  let y;
  let vx;
  let vy = 0;
  switch (spec.motion) {
    case "glide":
      y = RULES.ceiling + 6 + rng() * 26;
      vx = dir * (78 + rng() * 24);
      break;
    case "streak":
      y = RULES.ceiling + 10 + rng() * 34;
      vx = dir * (128 + rng() * 34);
      break;
    case "flutter":
      y = RULES.ceiling + 2;
      vx = dir * (16 + rng() * 12);
      vy = 15 + rng() * 8;
      break;
    case "float":
      y = RULES.ground - 30 - rng() * 20;
      vx = dir * (26 + rng() * 14);
      vy = -46 - rng() * 12;
      break;
    default:
      y = RULES.ground - 20;
      vx = dir * (44 + rng() * 20);
      vy = -96 - rng() * 16;
  }
  return {
    kind,
    motion: spec.motion,
    value: spec.value,
    w: spec.w,
    h: spec.h,
    x: fromLeft ? -spec.w : RULES.width,
    y,
    vx,
    vy,
    rot: 0,
    spin: spec.motion === "lob" ? (rng() - 0.5) * 5 : 0,
    age: 0,
    life: spec.life,
    phaseT: rng() * Math.PI * 2,
  };
}

function stepBonus(item, dt) {
  item.age += dt;
  item.rot += item.spin * dt;
  item.phaseT += dt;
  switch (item.motion) {
    case "glide":
    case "streak":
      item.x += item.vx * dt;
      item.y += Math.sin(item.phaseT * 1.8) * 9 * dt;
      break;
    case "flutter":
      item.x += (item.vx + Math.sin(item.phaseT * 3.1) * 26) * dt;
      item.y += item.vy * dt;
      item.rot = Math.sin(item.phaseT * 3.1) * 0.5;
      break;
    case "float":
      item.vy += 22 * dt;
      item.x += item.vx * dt;
      item.y += item.vy * dt;
      break;
    default:
      item.vy += RULES.gravity * dt;
      item.x += item.vx * dt;
      item.y += item.vy * dt;
  }
}

function bonusGone(item) {
  return (
    item.age >= item.life ||
    item.y > RULES.ground - 2 ||
    item.x < -item.w - 12 ||
    item.x > RULES.width + 12
  );
}

function stepTarget(item, dt) {
  item.timer += dt;
  item.bobT += dt;
  item.rot += (item.spin ?? 0) * dt;
  if (item.phase !== "flying") return item;
  item.vy += RULES.gravity * dt;
  item.x += item.vx * dt;
  item.y += item.vy * dt;
  if (item.y < RULES.ceiling) {
    item.y = RULES.ceiling;
    item.vy = Math.abs(item.vy) * 0.35;
  }
  return item;
}

function landed(item) {
  return item.y > RULES.ground - item.h;
}

function targetGone(item) {
  return landed(item) || item.x < -item.w - 10 || item.x > RULES.width + 10;
}

function hitsItem(item, point) {
  if (item.phase && item.phase !== "flying") return false;
  const pad = item.w <= 10 ? 3 : 1;
  return (
    point.x >= item.x - pad &&
    point.x <= item.x + item.w + pad &&
    point.y >= item.y - pad &&
    point.y <= item.y + item.h + pad
  );
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function createWorld({ seed } = {}) {
  const nextSeed = seed ?? Math.floor(Math.random() * 4294967295);
  const rng = makeRng(nextSeed);
  return {
    seed: nextSeed,
    rng,
    round: 1,
    saved: 0,
    grabs: RULES.grabs,
    targetIndex: 0,
    hitsThisRound: 0,
    misses: 0,
    cleanRound: null,
    phase: "ready",
    phaseT: 0,
    target: null,
    lastResult: null,
    popup: null,
    impact: null,
    bonuses: [],
    bonusIn: 1.5 + rng() * RULES.bonusPeriod,
    bonusHit: null,
    bonusExpired: [],
    events: [],
    aim: { x: RULES.width / 2, y: RULES.height / 2 },
  };
}

function advanceItem(world) {
  world.targetIndex += 1;
  world.target = null;
  if (world.misses >= RULES.maxMisses) {
    world.phase = "gameOver";
    world.phaseT = 0;
    world.events.push({ type: "gameOver" });
    return;
  }
  if (world.targetIndex < RULES.targetsPerRound) {
    world.phase = "ready";
    world.phaseT = 0;
    return;
  }
  if (world.hitsThisRound >= RULES.targetsPerRound) {
    const bonus = RULES.perfectBonus * world.round;
    world.saved += bonus;
    world.cleanRound = bonus;
  } else {
    world.cleanRound = null;
  }
  world.round += 1;
  world.targetIndex = 0;
  world.hitsThisRound = 0;
  world.phase = "roundOver";
  world.phaseT = 0;
  world.events.push({ type: "roundOver", cleanRound: world.cleanRound, round: world.round - 1 });
}

export function updateWorld(world, dt) {
  world.phaseT += dt;
  for (const bonus of world.bonuses) stepBonus(bonus, dt);
  const kept = [];
  for (const bonus of world.bonuses) {
    if (!bonusGone(bonus)) {
      kept.push(bonus);
      continue;
    }
    const off = bonus.x < -bonus.w - 10 || bonus.x > RULES.width + 10;
    if (!off) {
      world.bonusExpired.push({
        x: bonus.x + bonus.w / 2,
        y: bonus.y + bonus.h / 2,
        kind: bonus.kind,
      });
    }
  }
  world.bonuses = kept;

  if (world.phase !== "gameOver" && world.phase !== "roundOver") {
    world.bonusIn -= dt;
    if (world.bonusIn <= 0) {
      if (world.bonuses.length < RULES.maxBonuses) world.bonuses.push(spawnBonus(world.rng));
      world.bonusIn = RULES.bonusPeriod * (0.55 + world.rng() * 0.9);
    }
  }

  if (world.popup) {
    world.popup.t += dt;
    if (world.popup.t > 1.1) world.popup = null;
  }

  switch (world.phase) {
    case "ready":
      if (world.phaseT >= RULES.readyDelay) {
        world.target = spawnTarget(world.round, world.rng);
        world.grabs = RULES.grabs;
        world.phase = "flying";
        world.phaseT = 0;
      }
      break;
    case "flying":
      stepTarget(world.target, dt);
      if (targetGone(world.target) || world.target.timer >= flightLimit(world.round)) {
        if (landed(world.target)) {
          world.impact = {
            x: world.target.x + world.target.w / 2,
            y: RULES.ground,
            type: world.target.type,
          };
        }
        world.target.phase = "escaped";
        world.phase = "escaped";
        world.phaseT = 0;
        world.lastResult = "escaped";
        world.misses += 1;
        world.events.push({ type: "escaped", splat: !!world.impact });
      }
      break;
    case "struck":
      if (world.phaseT >= RULES.struckDelay) {
        world.phase = "escaped";
        world.phaseT = 0;
      }
      break;
    case "escaped":
      if (world.phaseT >= RULES.escapedDelay) advanceItem(world);
      break;
    default:
      break;
  }
}

export function swing(world, x, y) {
  const point = { x, y };
  if (world.grabs > 0) {
    for (let i = world.bonuses.length - 1; i >= 0; i -= 1) {
      const bonus = world.bonuses[i];
      if (hitsItem({ ...bonus, phase: "flying" }, point)) {
        world.grabs -= 1;
        world.saved += bonus.value;
        world.bonusHit = {
          x: bonus.x + bonus.w / 2,
          y: bonus.y,
          value: bonus.value,
          kind: bonus.kind,
        };
        world.popup = { t: 0, value: bonus.value, x: bonus.x, y: bonus.y };
        world.bonuses.splice(i, 1);
        world.events.push({
          type: "bonus",
          kind: bonus.kind,
          value: bonus.value,
          x: bonus.x,
          y: bonus.y,
        });
        return { result: "bonus", type: bonus.kind, value: bonus.value };
      }
    }
  }
  if (world.phase !== "flying" || world.grabs <= 0) return { result: "ignored" };
  world.grabs -= 1;
  if (hitsItem(world.target, point)) {
    const { type, value } = world.target;
    world.saved += value;
    world.hitsThisRound += 1;
    world.target.phase = "struck";
    world.phase = "struck";
    world.phaseT = 0;
    world.lastResult = "hit";
    world.popup = { t: 0, value, x: world.target.x, y: world.target.y };
    world.events.push({
      type: "hit",
      itemType: type,
      value,
      x: world.target.x,
      y: world.target.y,
    });
    return { result: "hit", type, value };
  }
  world.events.push({ type: "miss" });
  return { result: "miss" };
}

export function continueRound(world) {
  if (world.phase !== "roundOver") return false;
  world.phase = "ready";
  world.phaseT = 0;
  return true;
}

export function setAim(world, x, y) {
  world.aim.x = clamp(x, 0, RULES.width);
  world.aim.y = clamp(y, 0, RULES.height);
}

export function nudgeAim(world, dt, dx, dy) {
  if (!dx && !dy) return;
  const len = Math.hypot(dx, dy) || 1;
  setAim(
    world,
    world.aim.x + (dx / len) * RULES.cursorSpeed * dt,
    world.aim.y + (dy / len) * RULES.cursorSpeed * dt,
  );
}
