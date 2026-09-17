export const RULES = {
  cols: 16,
  rows: 16,
  cell: 20,
  border: 5,
  header: 30,
  footer: 16,
  viewPad: 6,
  startLength: 1,
  growBy: 1,
  step0: 0.32,
  step40: 0.16,
  scoreRamp: 40,
  maxQueue: 2,
  restartDelay: 0.8,
};

export const POINTS = {
  base: 80,
  step: 10,
};

export function awardPoints(n) {
  return POINTS.base + (n - 1) * POINTS.step;
}

export const SHIRTS = ["yellow", "pink", "orange", "purple"];
export const GENDERS = ["boy", "girl"];
export const SKINS = ["pale", "peach", "tan", "brown"];

export const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

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
  return {
    width: RULES.cols * RULES.cell + RULES.border * 2 + RULES.viewPad,
    height: RULES.header + RULES.rows * RULES.cell + RULES.border * 2 + RULES.footer,
  };
}

export function boardOrigin() {
  const { width } = viewSize();
  const boardW = RULES.cols * RULES.cell + RULES.border * 2;
  const ox = Math.floor((width - boardW) / 2);
  const oy = RULES.header;
  return { ox, oy, gridX: ox + RULES.border, gridY: oy + RULES.border };
}

export function stepInterval(friends) {
  const t = Math.min(1, Math.max(0, friends / RULES.scoreRamp));
  return RULES.step0 + (RULES.step40 - RULES.step0) * t;
}

export function moveLerp(world) {
  if (world.phase !== "playing") return 1;
  return Math.min(1, world.acc / stepInterval(world.friends));
}

function occupies(world, x, y) {
  return world.line.some((seg) => seg.x === x && seg.y === y);
}

function placeFriend(world) {
  const empty = [];
  for (let y = 0; y < RULES.rows; y += 1) {
    for (let x = 0; x < RULES.cols; x += 1) {
      if (!occupies(world, x, y)) empty.push({ x, y });
    }
  }
  if (empty.length === 0) {
    world.friend = null;
    world.phase = "cleared";
    world.t = 0;
    world.events.push({ type: "cleared", score: world.score });
    return;
  }
  const cell = empty[Math.floor(world.rng() * empty.length)];
  world.friend = {
    x: cell.x,
    y: cell.y,
    gender: GENDERS[Math.floor(world.rng() * GENDERS.length)],
    shirt: SHIRTS[Math.floor(world.rng() * SHIRTS.length)],
    skin: SKINS[Math.floor(world.rng() * SKINS.length)],
  };
}

export function createWorld({ seed = 1 } = {}) {
  const world = {
    phase: "ready",
    rng: makeRng(seed),
    elapsed: 0,
    t: 0,
    acc: 0,
    dir: { ...DIRS.right },
    queue: [],
    line: [],
    owed: [],
    friend: null,
    score: 0,
    friends: 0,
    events: [],
  };
  const x = Math.floor(RULES.cols / 3);
  const y = Math.floor(RULES.rows / 2);
  world.line.push({
    x,
    y,
    px: x,
    py: y,
    role: "rio",
    gender: null,
    shirt: null,
    skin: null,
  });
  placeFriend(world);
  return world;
}

export function startGame(world) {
  if (world.phase !== "ready") return false;
  world.phase = "playing";
  world.t = 0;
  world.acc = 0;
  return true;
}

export function queueTurn(world, dx, dy) {
  if (world.phase === "dead" || world.phase === "cleared") return false;
  const last = world.queue.length > 0 ? world.queue[world.queue.length - 1] : world.dir;
  if (dx === -last.x && dy === -last.y) return false;
  if (world.phase === "ready") {
    world.dir = { x: dx, y: dy };
    return startGame(world);
  }
  if (dx === last.x && dy === last.y) return false;
  if (world.queue.length >= RULES.maxQueue) return false;
  world.queue.push({ x: dx, y: dy });
  world.events.push({ type: "turn" });
  return true;
}

function bust(world, cause, x, y) {
  world.phase = "dead";
  world.t = 0;
  world.acc = 0;
  world.events.push({ type: "bust", cause, x, y, score: world.score });
}

function step(world) {
  if (world.queue.length > 0) world.dir = world.queue.shift();
  const head = world.line[0];
  const nx = head.x + world.dir.x;
  const ny = head.y + world.dir.y;
  if (nx < 0 || ny < 0 || nx >= RULES.cols || ny >= RULES.rows) {
    bust(world, "wall", nx, ny);
    return;
  }
  const tailIndex = world.line.length - 1;
  for (let i = 0; i < world.line.length; i += 1) {
    if (i === tailIndex && world.owed.length === 0) continue;
    if (world.line[i].x === nx && world.line[i].y === ny) {
      bust(world, "line", nx, ny);
      return;
    }
  }
  const snapshot = world.line.map((seg) => ({
    x: seg.x,
    y: seg.y,
    role: seg.role,
    gender: seg.gender,
    shirt: seg.shirt,
    skin: seg.skin,
  }));
  const growth = world.owed.length > 0 ? world.owed.shift() : null;
  world.line.unshift({
    x: nx,
    y: ny,
    px: head.x,
    py: head.y,
    role: "rio",
    gender: null,
    shirt: null,
    skin: null,
  });
  if (growth === null) world.line.pop();
  for (let i = 1; i < world.line.length; i += 1) {
    const prev = snapshot[i] ?? {
      x: world.line[i].x,
      y: world.line[i].y,
      role: "friend",
      gender: growth && growth.gender,
      shirt: growth && growth.shirt,
      skin: growth && growth.skin,
    };
    world.line[i].px = prev.x;
    world.line[i].py = prev.y;
    world.line[i].role = "friend";
    world.line[i].gender = prev.gender;
    world.line[i].shirt = prev.shirt;
    world.line[i].skin = prev.skin;
  }
  if (world.friend && nx === world.friend.x && ny === world.friend.y) {
    const { gender, shirt, skin } = world.friend;
    world.friends += 1;
    const gained = awardPoints(world.friends);
    world.score += gained;
    for (let n = 0; n < RULES.growBy; n += 1) {
      world.owed.push({ gender, shirt, skin });
    }
    world.events.push({
      type: "collar",
      x: nx,
      y: ny,
      gender,
      shirt,
      skin,
      score: world.score,
      gained,
      friends: world.friends,
    });
    placeFriend(world);
  }
}

export function updateWorld(world, dt) {
  world.t += dt;
  if (world.phase !== "playing") return;
  world.elapsed += dt;
  world.acc += dt;
  while (world.phase === "playing" && world.acc >= stepInterval(world.friends)) {
    world.acc -= stepInterval(world.friends);
    step(world);
  }
}

export function tapDirection(world, gameX, gameY) {
  if (world.phase !== "playing") return null;
  const { gridX, gridY } = boardOrigin();
  const head = world.line[0];
  const cx = gridX + head.x * RULES.cell + RULES.cell / 2;
  const cy = gridY + head.y * RULES.cell + RULES.cell / 2;
  const dx = gameX - cx;
  const dy = gameY - cy;
  if (Math.abs(dx) < RULES.cell / 2 && Math.abs(dy) < RULES.cell / 2) return null;
  if (Math.abs(dx) > Math.abs(dy)) return { x: Math.sign(dx), y: 0 };
  return { x: 0, y: Math.sign(dy) };
}
