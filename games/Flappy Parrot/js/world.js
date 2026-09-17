export const PHYSICS = {
  gravity: 640,
  flapVy: -196,
  maxFall: 268,
  crashBounce: -70,
  birdX: 66,
  birdW: 22,
  birdH: 20,
  groundY: 194,
  columnW: 22,
  columnGap: 112,
  hitbox: { x: 5, y: 6, w: 12, h: 8 },
  startY: 82,
  viewW: 256,
  viewH: 224,
  gapMinY: 24,
  gapBottomPad: 30,
  gapWander: 44,
  firstColumnPad: 60,
  speed0: 60,
  speed20: 94,
  gap0: 72,
  gap20: 56,
  scoreRamp: 20,
};

export const POINTS = {
  base: 80,
  step: 10,
};

export function awardPoints(n) {
  return POINTS.base + (n - 1) * POINTS.step;
}

function clamp01(t) {
  return Math.min(1, Math.max(0, t));
}

function lerp(a, b, t) {
  return a + (b - a) * clamp01(t);
}

export function scrollSpeed(score) {
  return lerp(PHYSICS.speed0, PHYSICS.speed20, score / PHYSICS.scoreRamp);
}

export function gapHeight(score) {
  return Math.round(lerp(PHYSICS.gap0, PHYSICS.gap20, score / PHYSICS.scoreRamp));
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

export function createWorld({ seed = 1 } = {}) {
  return {
    phase: "ready",
    rng: makeRng(seed),
    elapsed: 0,
    t: 0,
    y: PHYSICS.startY,
    vy: 0,
    columns: [],
    score: 0,
    clears: 0,
    events: [],
  };
}

export function birdHitbox(world) {
  const { x, y, w, h } = PHYSICS.hitbox;
  return {
    x: PHYSICS.birdX + x,
    y: world.y + y,
    w,
    h,
  };
}

export function columnBoxes(column) {
  const gapBottom = column.gapY + column.gap;
  return {
    top: { x: column.x, y: 0, w: PHYSICS.columnW, h: column.gapY },
    bottom: {
      x: column.x,
      y: gapBottom,
      w: PHYSICS.columnW,
      h: PHYSICS.groundY - gapBottom,
    },
  };
}

function aabb(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function pickGapY(world, gap) {
  const minCenter = PHYSICS.gapMinY + gap / 2;
  const maxCenter = PHYSICS.groundY - gap - PHYSICS.gapBottomPad + gap / 2;
  const last = world.columns[world.columns.length - 1];
  const prevCenter = last
    ? last.gapY + last.gap / 2
    : (minCenter + maxCenter) / 2;
  const wander = (world.rng() * 2 - 1) * PHYSICS.gapWander;
  const center = Math.min(maxCenter, Math.max(minCenter, prevCenter + wander));
  return Math.round(center - gap / 2);
}

function spawnColumn(world, x) {
  const gap = gapHeight(world.clears);
  world.columns.push({
    x,
    gap,
    gapY: pickGapY(world, gap),
    passed: false,
  });
}

export function flap(world) {
  if (world.phase === "falling" || world.phase === "dead") return false;
  if (world.phase === "ready") {
    world.phase = "playing";
    world.t = 0;
  }
  world.vy = PHYSICS.flapVy;
  world.events.push({ type: "flap" });
  return true;
}

function crashIntoColumn(world, hitY) {
  world.phase = "falling";
  world.t = 0;
  world.vy = PHYSICS.crashBounce;
  world.events.push({
    type: "crash",
    x: PHYSICS.birdX + PHYSICS.birdW / 2,
    y: hitY,
  });
}

export function updateWorld(world, dt, viewport) {
  world.t += dt;
  if (world.phase === "dead" || world.phase === "ready") return;

  world.elapsed += dt;
  world.vy = Math.min(PHYSICS.maxFall, world.vy + PHYSICS.gravity * dt);
  world.y += world.vy * dt;
  if (world.y < 0) {
    world.y = 0;
    world.vy = 0;
  }

  if (world.phase === "falling") {
    if (world.y + PHYSICS.birdH >= PHYSICS.groundY) {
      world.y = PHYSICS.groundY - PHYSICS.birdH;
      world.vy = 0;
      world.phase = "dead";
      world.t = 0;
      world.events.push({
        type: "land",
        x: PHYSICS.birdX + PHYSICS.birdW / 2,
        y: PHYSICS.groundY,
      });
    }
    return;
  }

  const speed = scrollSpeed(world.clears);
  for (const column of world.columns) column.x -= speed * dt;
  if (world.columns.length > 0 && world.columns[0].x + PHYSICS.columnW < 0) {
    world.columns.shift();
  }
  if (world.columns.length === 0) {
    spawnColumn(world, viewport.width + PHYSICS.firstColumnPad);
  }
  while (world.columns[world.columns.length - 1].x < viewport.width) {
    spawnColumn(
      world,
      world.columns[world.columns.length - 1].x + PHYSICS.columnGap,
    );
  }

  if (world.y + PHYSICS.birdH >= PHYSICS.groundY) {
    world.y = PHYSICS.groundY - PHYSICS.birdH;
    world.vy = 0;
    world.phase = "dead";
    world.t = 0;
    const x = PHYSICS.birdX + PHYSICS.birdW / 2;
    world.events.push({ type: "crash", x, y: PHYSICS.groundY });
    world.events.push({ type: "land", x, y: PHYSICS.groundY });
    return;
  }

  const box = birdHitbox(world);
  for (const column of world.columns) {
    const { top, bottom } = columnBoxes(column);
    if (aabb(box, top) || aabb(box, bottom)) {
      crashIntoColumn(world, box.y + box.h / 2);
      return;
    }
  }

  const birdCenterX = PHYSICS.birdX + PHYSICS.birdW / 2;
  for (const column of world.columns) {
    if (column.passed || column.x + PHYSICS.columnW > birdCenterX) continue;
    column.passed = true;
    world.clears += 1;
    const gained = awardPoints(world.clears);
    world.score += gained;
    world.events.push({
      type: "score",
      score: world.score,
      gained,
      clears: world.clears,
    });
  }
}
