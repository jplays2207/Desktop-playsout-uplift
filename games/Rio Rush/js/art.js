import { RULES, SHIRTS, SKINS, boardOrigin, moveLerp, viewSize } from "./world.js";
import {
  blit,
  drawText,
  drawTextCentered,
  padRows,
  spriteFromRows,
  textWidth,
} from "./runtime.js";

const SHIRT = {
  yellow: { w: "#f0d14a", n: "#d4b12e" },
  pink: { w: "#e86aa0", n: "#c44d82" },
  orange: { w: "#f08a30", n: "#cc6e1c" },
  purple: { w: "#8b6bcf", n: "#6c4fb0" },
  green: { w: "#2fa35a", n: "#237a43" },
};

const SKIN = {
  pale: { s: "#f4d5b8" },
  peach: { s: "#e8b48c" },
  tan: { s: "#c68642" },
  brown: { s: "#8d5524" },
};

const RIO_PAL = {
  k: "#1a1420",
  r: "#d42b2b",
  b: "#8a1c1c",
  s: "#e8b48c",
  e: "#1a1420",
  w: "#f2f4f8",
  t: "#1e3a5f",
  n: "#c8ccd4",
  p: "#3a4a72",
  d: "#2a2430",
  h: "#3a2416",
};

const BASE = {
  k: "#1a1420",
  e: "#1a1420",
  h: "#3a2416",
  p: "#4a5a72",
  d: "#2a2430",
};

const RIO_FRONT = padRows([
  ".......rrrrrr.......",
  "......rrrrrrrr......",
  ".....rrbbbbbbrr.....",
  "......ssssssss......",
  ".....ses....ses.....",
  ".....ssssssssss.....",
  "......ssssssss......",
  ".......ssssss.......",
  "......wwttttww......",
  ".....wwwttttwww.....",
  "....wwwwttttwwww....",
  "....nwwwttttwwwn....",
  "....nnwwttttwwnn....",
  ".....pppppppppp.....",
  ".....ppp....ppp.....",
  ".....ppp....ppp.....",
  ".....dd......dd.....",
  ".....dd......dd.....",
]);

const RIO_BACK = padRows([
  ".......rrrrrr.......",
  "......rrrrrrrr......",
  ".....rrrrrrrrrr.....",
  "......hhhhhhhh......",
  ".....hhhhhhhhhh.....",
  "......hhhhhhhh......",
  ".......hhhhhh.......",
  "........hhhh........",
  "......wwttttww......",
  ".....wwwttttwww.....",
  "....wwwwttttwwww....",
  "....nwwwttttwwwn....",
  "....nnwwttttwwnn....",
  ".....pppppppppp.....",
  ".....ppp....ppp.....",
  ".....ppp....ppp.....",
  ".....dd......dd.....",
  ".....dd......dd.....",
]);

const RIO_SIDE = padRows([
  "........rrrrrr......",
  ".......rrrrrrrr.....",
  "......rrbbbbbbr.....",
  ".......sssssss......",
  "......se.sssss......",
  ".......sssssss......",
  "........sssss.......",
  ".........sss........",
  ".......wwtttw.......",
  "......wwwtttww......",
  ".....wwwwtttwww.....",
  ".....nwwwtttwwn.....",
  ".....nnwwtttwwn.....",
  "......pppppppp......",
  "......ppp..ppp......",
  "......ppp..ppp......",
  "......dd....dd......",
  "......dd....dd......",
]);

const BOY_FRONT = padRows([
  ".......hhhhhh.......",
  "......hhhhhhhh......",
  ".....hhsssssshh.....",
  ".....hssssssssh.....",
  ".....ses....ses.....",
  ".....ssssssssss.....",
  "......ssssssss......",
  ".......ssssss.......",
  "......wwwwwwww......",
  ".....wwwwwwwwww.....",
  "....wwwwwwwwwwww....",
  "....nwwwwwwwwwwn....",
  "....nnwwwwwwwwnn....",
  ".....pppppppppp.....",
  ".....ppp....ppp.....",
  ".....ppp....ppp.....",
  ".....dd......dd.....",
  ".....dd......dd.....",
]);

const BOY_BACK = padRows([
  ".......hhhhhh.......",
  "......hhhhhhhh......",
  ".....hhhhhhhhhh.....",
  ".....hhhhhhhhhh.....",
  "......hhhhhhhh......",
  ".......hhhhhh.......",
  "........hhhh........",
  ".........hh.........",
  "......wwwwwwww......",
  ".....wwwwwwwwww.....",
  "....wwwwwwwwwwww....",
  "....nwwwwwwwwwwn....",
  "....nnwwwwwwwwnn....",
  ".....pppppppppp.....",
  ".....ppp....ppp.....",
  ".....ppp....ppp.....",
  ".....dd......dd.....",
  ".....dd......dd.....",
]);

const BOY_SIDE = padRows([
  "........hhhhhh......",
  ".......hhhhhhhh.....",
  "......hhssssssh.....",
  "......hssssssss.....",
  "......se.sssss......",
  ".......sssssss......",
  "........sssss.......",
  ".........sss........",
  ".......wwwwww.......",
  "......wwwwwwww......",
  ".....wwwwwwwwww.....",
  ".....nwwwwwwwwn.....",
  ".....nnwwwwwwwn.....",
  "......pppppppp......",
  "......ppp..ppp......",
  "......ppp..ppp......",
  "......dd....dd......",
  "......dd....dd......",
]);

const GIRL_FRONT = padRows([
  ".....hh......hh.....",
  "......hhhhhhhh......",
  ".....hhsssssshh.....",
  ".....hssssssssh.....",
  ".....ses....ses.....",
  ".....ssssssssss.....",
  "......ssssssss......",
  ".......ssssss.......",
  "......wwwwwwww......",
  ".....wwwwwwwwww.....",
  "....wwwwwwwwwwww....",
  "....nwwwwwwwwwwn....",
  "....nnwwwwwwwwnn....",
  ".....wwwwwwwwww.....",
  ".....www....www.....",
  ".....ppp....ppp.....",
  ".....dd......dd.....",
  ".....dd......dd.....",
]);

const GIRL_BACK = padRows([
  ".....hh......hh.....",
  "......hhhhhhhh......",
  ".....hhhhhhhhhh.....",
  ".....hhhhhhhhhh.....",
  "......hhhhhhhh......",
  ".......hhhhhh.......",
  "........hhhh........",
  ".........hh.........",
  "......wwwwwwww......",
  ".....wwwwwwwwww.....",
  "....wwwwwwwwwwww....",
  "....nwwwwwwwwwwn....",
  "....nnwwwwwwwwnn....",
  ".....wwwwwwwwww.....",
  ".....www....www.....",
  ".....ppp....ppp.....",
  ".....dd......dd.....",
  ".....dd......dd.....",
]);

const GIRL_SIDE = padRows([
  ".....hh...hhhhh.....",
  "......hhhhhhhhh.....",
  "......hhssssssh.....",
  "......hssssssss.....",
  "......se.sssss......",
  ".......sssssss......",
  "........sssss.......",
  ".........sss........",
  ".......wwwwww.......",
  "......wwwwwwww......",
  ".....wwwwwwwwww.....",
  ".....nwwwwwwwwn.....",
  ".....nnwwwwwwwn.....",
  "......wwwwwwww......",
  "......www..www......",
  "......ppp..ppp......",
  "......dd....dd......",
  "......dd....dd......",
]);

const SHIRT_COLORS = {
  yellow: ["#f0d14a", "#ffe680", "#d4b12e"],
  pink: ["#e86aa0", "#f2a0c4", "#c44d82"],
  orange: ["#f08a30", "#ffc078", "#cc6e1c"],
  purple: ["#8b6bcf", "#b79be8", "#6c4fb0"],
  green: ["#2fa35a", "#7edc9a", "#237a43"],
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

function friendPal(shirtKey, skinKey, joined) {
  const shirt = joined ? SHIRT.green : SHIRT[shirtKey];
  const skin = SKIN[skinKey];
  return {
    ...BASE,
    s: skin.s,
    w: shirt.w,
    n: shirt.n,
    p: joined ? "#2d5a3a" : "#4a5a72",
  };
}

function poses(gender) {
  if (gender === "girl") return { front: GIRL_FRONT, back: GIRL_BACK, side: GIRL_SIDE, loose: GIRL_FRONT };
  return { front: BOY_FRONT, back: BOY_BACK, side: BOY_SIDE, loose: BOY_FRONT };
}

function makeBoard() {
  const { cols, rows, cell, border } = RULES;
  const innerW = cols * cell;
  const innerH = rows * cell;
  const canvas = document.createElement("canvas");
  canvas.width = innerW + border * 2;
  canvas.height = innerH + border * 2;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  const stripe = 4;
  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      ctx.fillStyle = Math.floor((x + y) / stripe) % 2 === 0 ? "#e07a5f" : "#1e2a3a";
      ctx.fillRect(x, y, 1, 1);
    }
  }
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      ctx.fillStyle = (c + r) % 2 === 0 ? "#5e8cad" : "#4f7a98";
      ctx.fillRect(border + c * cell, border + r * cell, cell, cell);
    }
  }
  const rng = makeRng(7);
  for (let y = 0; y < innerH; y += 1) {
    for (let x = 0; x < innerW; x += 1) {
      if (rng() >= 0.05) continue;
      ctx.fillStyle = rng() < 0.5 ? "#7aa3bc" : "#3d6580";
      ctx.fillRect(border + x, border + y, 1, 1);
    }
  }
  ctx.fillStyle = "#1e2a3a";
  ctx.fillRect(border - 1, border - 1, innerW + 2, 1);
  ctx.fillRect(border - 1, border + innerH, innerW + 2, 1);
  ctx.fillRect(border - 1, border - 1, 1, innerH + 2);
  ctx.fillRect(border + innerW, border - 1, 1, innerH + 2);
  return canvas;
}

function overlayCard(ctx, w, h, { title, lines = [], prompt, titleScale = 2, top }) {
  ctx.fillStyle = "rgba(8, 12, 20, 0.72)";
  ctx.fillRect(0, 0, w, h);
  const innerW = Math.min(
    w - 8,
    Math.max(
      textWidth(title, titleScale),
      ...lines.map((line) => textWidth(line)),
      prompt ? textWidth(prompt) : 0,
    ) + 28,
  );
  let boxH = 12 + 7 * titleScale;
  if (lines.length) boxH += 10 + lines.length * 12 - 5;
  if (prompt) boxH += 10 + 7;
  boxH += 12;
  const x = Math.round((w - innerW) / 2);
  const y = Math.round(top ?? (h - boxH) / 2);
  ctx.fillStyle = "#0b1020";
  ctx.fillRect(x, y, innerW, boxH);
  ctx.fillStyle = "#18233f";
  ctx.fillRect(x + 1, y + 1, innerW - 2, boxH - 2);
  ctx.fillStyle = "#0d1326";
  ctx.fillRect(x + 3, y + 3, innerW - 6, boxH - 6);
  let cy = y + 12;
  drawTextCentered(ctx, title, w / 2, cy, "#ffe680", titleScale);
  cy += 7 * titleScale;
  if (lines.length) {
    cy += 10;
    for (const line of lines) {
      drawTextCentered(ctx, line, w / 2, cy, "#9fb4c8");
      cy += 12;
    }
    cy -= 5;
  }
  if (prompt) {
    cy += 10;
    drawTextCentered(ctx, prompt, w / 2, cy, "#ffe680");
  }
}

function overlayBar(ctx, w, title, subtitle, top) {
  ctx.fillStyle = "rgba(8, 12, 20, 0.82)";
  ctx.fillRect(0, top, w, 52);
  drawTextCentered(ctx, title, w / 2, top + 8, "#ffe680", 2);
  drawTextCentered(ctx, subtitle, w / 2, top + 30, "#e8edf5");
}

function facing(seg, world) {
  let ox = seg.x - seg.px;
  let oy = seg.y - seg.py;
  if (ox === 0 && oy === 0) {
    ox = world.dir.x;
    oy = world.dir.y;
  }
  return { ox, oy };
}

export function createArt() {
  const rio = {
    front: spriteFromRows(RIO_FRONT, RIO_PAL),
    back: spriteFromRows(RIO_BACK, RIO_PAL),
    side: spriteFromRows(RIO_SIDE, RIO_PAL),
  };
  const kids = { boy: {}, girl: {} };
  for (const gender of ["boy", "girl"]) {
    const set = poses(gender);
    for (const skin of SKINS) {
      kids[gender][skin] = {};
      for (const shirt of [...SHIRTS, "green"]) {
        const pal = friendPal(shirt, skin, shirt === "green");
        kids[gender][skin][shirt] = {
          front: spriteFromRows(set.front, pal),
          back: spriteFromRows(set.back, pal),
          side: spriteFromRows(set.side, pal),
          loose: spriteFromRows(set.loose, pal),
        };
      }
    }
  }
  const board = makeBoard();
  const origin = boardOrigin();
  const view = viewSize();
  let particles = [];
  let floats = [];
  let pulse = 0;

  function cellCenter(x, y) {
    return {
      x: origin.gridX + x * RULES.cell + RULES.cell / 2,
      y: origin.gridY + y * RULES.cell + RULES.cell / 2,
    };
  }

  function pickPose(frames, ox, oy) {
    if (ox !== 0) return { sprite: frames.side, flip: ox < 0 };
    if (oy < 0) return { sprite: frames.back, flip: false };
    return { sprite: frames.front, flip: false };
  }

  function burst(x, y, shirt = "green") {
    const colors = SHIRT_COLORS[shirt] ?? SHIRT_COLORS.green;
    for (let i = 0; i < 16; i += 1) {
      const a = (i / 16) * Math.PI * 2 + Math.random() * 0.4;
      const sp = 26 + Math.random() * 54;
      particles.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 22,
        life: 0.5 + Math.random() * 0.45,
        age: 0,
        color: colors[i % colors.length],
        size: Math.random() < 0.28 ? 2 : 1,
      });
    }
  }

  function splat(x, y) {
    burst(x, y, "green");
  }

  function spawnFloat(x, y, msg, col) {
    floats.push({ x, y, msg, col, t: 0 });
  }

  function drawFriend(ctx, time, reducedMotion) {
    return function drawWaiting(friend) {
      if (!friend) return;
      const px = origin.gridX + friend.x * RULES.cell;
      const py = origin.gridY + friend.y * RULES.cell;
      const bob = reducedMotion ? 0 : Math.round(Math.sin(time * 5) * 1.4);
      const glow = reducedMotion ? 0.5 : 0.4 + Math.sin(time * 6) * 0.28;
      ctx.fillStyle = `rgba(245, 197, 66, ${glow.toFixed(2)})`;
      const a = 5;
      const r = -1;
      const c = RULES.cell;
      const ticks = [
        [r, r, a, 1],
        [r, r, 1, a],
        [c + 1 - a, r, a, 1],
        [c, r, 1, a],
        [r, c, a, 1],
        [r, c + 1 - a, 1, a],
        [c + 1 - a, c, a, 1],
        [c, c + 1 - a, 1, a],
      ];
      for (const [sx, sy, sw, sh] of ticks) ctx.fillRect(px + sx, py + sy, sw, sh);
      const frames = kids[friend.gender]?.[friend.skin]?.[friend.shirt]
        ?? kids.boy.peach.yellow;
      blit(ctx, frames.loose, px, py + bob);
    };
  }

  function drawLine(ctx, world) {
    const t = moveLerp(world);
    for (let i = world.line.length - 1; i >= 0; i -= 1) {
      const seg = world.line[i];
      const x = origin.gridX + (seg.px + (seg.x - seg.px) * t) * RULES.cell;
      const y = origin.gridY + (seg.py + (seg.y - seg.py) * t) * RULES.cell;
      const { ox, oy } = facing(seg, world);
      if (seg.role === "rio" || i === 0) {
        const pose = pickPose(rio, ox, oy);
        blit(ctx, pose.sprite, x, y, pose.flip);
      } else {
        const frames = kids[seg.gender]?.[seg.skin]?.green
          ?? kids.girl.peach.green;
        const pose = pickPose(frames, ox, oy);
        blit(ctx, pose.sprite, x, y, pose.flip);
      }
    }
  }

  function drawHud(ctx, world, best) {
    ctx.fillStyle = "#151a24";
    ctx.fillRect(0, 0, view.width, RULES.header);
    ctx.fillStyle = "#0b0e14";
    ctx.fillRect(0, RULES.header - 1, view.width, 1);
    const bounce = Math.round(pulse * 2);
    const end = drawText(ctx, "FRIENDS", 8, 12, "#8f9cb4");
    drawText(ctx, String(world.score), end + 4, 8 - bounce, "#f2f4f8", 2);
    if (best > 0) {
      const label = `BEST ${best}`;
      drawText(ctx, label, view.width - 8 - textWidth(label), 12, "#f5c542");
    }
  }

  function draw(ctx, { world, time, best, newBest, reducedMotion }) {
    ctx.fillStyle = "#0d1017";
    ctx.fillRect(0, 0, view.width, view.height);
    ctx.drawImage(board, origin.ox, origin.oy);
    drawFriend(ctx, time, reducedMotion)(world.friend);
    drawLine(ctx, world);
    for (const p of particles) {
      const k = p.age / p.life;
      ctx.globalAlpha = k < 0.66 ? 1 : Math.max(0, 1 - (k - 0.66) / 0.34);
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
    }
    ctx.globalAlpha = 1;
    for (const f of floats) {
      const e = f.t / 0.9;
      const fw = textWidth(f.msg);
      const ox = Math.max(2, Math.min(view.width - fw - 2, Math.round(f.x - fw / 2)));
      const oy = Math.round(f.y - 6 - e * 16);
      ctx.globalAlpha = Math.max(0, 1 - e * e);
      drawText(ctx, f.msg, ox + 1, oy + 1, "rgba(8, 12, 20, 0.55)");
      drawText(ctx, f.msg, ox, oy, f.col);
    }
    ctx.globalAlpha = 1;
    drawHud(ctx, world, best);
    const barTop = origin.gridY + Math.round((RULES.rows * RULES.cell - 52) / 2);
    if (world.phase === "ready") {
      overlayCard(ctx, view.width, view.height, {
        title: "RIO RUSH",
        lines: [
          "FIND YOUR FRIENDS ON THE YARD",
          "BOYS AND GIRLS WAITING TO PLAY",
          "NEVER DOUBLE BACK OVER THE LINE",
        ],
        prompt: "CLICK OR PRESS SPACE TO START",
        top: origin.gridY + 36,
      });
    } else if (world.phase === "dead") {
      overlayBar(
        ctx,
        view.width,
        `${world.score} - ${world.friends} FRIENDS`,
        newBest ? "NEW BEST - SPACE TO GO AGAIN" : "SPACE TO GO AGAIN",
        barTop,
      );
    } else if (world.phase === "cleared") {
      overlayBar(
        ctx,
        view.width,
        "ALL HERE",
        `${world.score} - ${world.friends} FRIENDS`,
        barTop,
      );
    }
  }

  return {
    draw,
    burst,
    splat,
    spawnFloat,
    cellCenter,
    pulse(amount = 1) {
      pulse = amount;
    },
    updateParticles(dt) {
      pulse = Math.max(0, pulse - dt * 3.5);
      for (const p of particles) {
        p.age += dt;
        p.vy += 190 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 1 - 2.2 * dt;
      }
      particles = particles.filter((p) => p.age < p.life);
      for (const f of floats) f.t += dt;
      floats = floats.filter((f) => f.t < 0.9);
    },
    clearParticles() {
      particles = [];
      floats = [];
      pulse = 0;
    },
  };
}
