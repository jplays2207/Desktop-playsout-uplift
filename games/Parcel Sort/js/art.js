import {
  RULES,
  SHIFTS,
  comboMult,
  outboundGrade,
  rejectPercent,
  pullPos,
} from "./world.js";
import {
  blit,
  drawText,
  drawTextCentered,
  padRows,
  spriteFromRows,
  textWidth,
} from "./runtime.js";

const PURPLE = "#9b4dff";

const PAL = {
  k: "#12151a",
  m: "#6a7178",
  M: "#b4bcc4",
  w: "#e8eef4",
  y: "#e8cf7a",
  r: "#ff5a4a",
  g: "#8fe08a",
  n: "#2b343d",
  b: "#4a5661",
  c: "#c49a5a",
  t: "#8a6a45",
  v: "#5ad4ff",
  V: "#2a6a88",
  o: "#ff9a3c",
  a: "#d42b2b",
  A: "#ff7a6e",
  s: "#f4d5b8",
  f: "#3fa34a",
  F: "#2a7a34",
  u: "#6b3f2a",
  p: "#9b4dff",
  e: "#efc45e",
  d: "#2a2430",
};

const ITEM = {
  k: PAL.k,
  c: PAL.c,
  C: "#d8b47a",
  t: PAL.t,
  w: PAL.w,
  y: PAL.y,
  m: PAL.m,
  M: PAL.M,
  r: PAL.a,
  R: PAL.A,
  g: PAL.f,
  G: PAL.F,
  s: PAL.s,
  u: PAL.u,
  v: PAL.v,
  o: PAL.o,
  e: PAL.e,
  n: PAL.n,
  b: "#4a86c0",
  p: "#cf6a88",
};

function rows(list) {
  return padRows(list);
}

const ITEMS = {
  box_brown: rows([
    "................",
    "..kkkkkkkkkkkk..",
    "..kCCCCCCCCCCk..",
    "..kcccccccccck..",
    "..kcttttttttck..",
    "..kcccccccccck..",
    "..kcCcccccccck..",
    "..kcccccccccck..",
    "..kcccccccccck..",
    "..kctcccccctck..",
    "..ktttttttttck..",
    "..kkkkkkkkkkkk..",
    "................",
    "................",
    "................",
    "................",
  ]),
  box_tape: rows([
    "................",
    "..kkkkkkkkkkkk..",
    "..kyyyyyyyyyyk..",
    "..kCCCCCCCCCCk..",
    "..kcccccccccck..",
    "..kccyyyyyycck..",
    "..kcccccccccck..",
    "..kcccccccccck..",
    "..kcccccccccck..",
    "..ktttttttttck..",
    "..kyyyyyyyyyyk..",
    "..kkkkkkkkkkkk..",
    "................",
    "................",
    "................",
    "................",
  ]),
  box_label: rows([
    "................",
    "..kkkkkkkkkkkk..",
    "..kCCCCCCCCCCk..",
    "..kcwwwwwwwcck..",
    "..kcwkmkvwwcck..",
    "..kcwwwwwwwcck..",
    "..kcccccccccck..",
    "..kcttttttttck..",
    "..kcccccccccck..",
    "..kcccccccccck..",
    "..ktttttttttck..",
    "..kkkkkkkkkkkk..",
    "................",
    "................",
    "................",
    "................",
  ]),
  box_small: rows([
    "................",
    "................",
    "....kkkkkkkk....",
    "....kCCCCCCk....",
    "....kcwwwcck....",
    "....kcccccck....",
    "....kctttcck....",
    "....ktttttck....",
    "....kkkkkkkk....",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
  ]),
  box_stripe: rows([
    "................",
    "..kkkkkkkkkkkk..",
    "..kCnCnCnCnCck..",
    "..kcncncncncck..",
    "..kcccccccccck..",
    "..kcttttttttck..",
    "..kcccccccccck..",
    "..kcncncncncck..",
    "..kcncncncncck..",
    "..kcccccccccck..",
    "..ktttttttttck..",
    "..kkkkkkkkkkkk..",
    "................",
    "................",
    "................",
    "................",
  ]),
  bag_white: rows([
    "................",
    ".....kkkkkk.....",
    "....kwwwwwwk....",
    "...kwwCCCCCwk...",
    "...kwwkkkkwwk...",
    "...kwwwwwwwwk...",
    "...kwwwwwwwwk...",
    "...kwwwwwwwwk...",
    "...kwwmmmmwwk...",
    "...kwwwwwwwwk...",
    "...kwwmmmmmmk...",
    "....kkkkkkkk....",
    "................",
    "................",
    "................",
    "................",
  ]),
  bag_yellow: rows([
    "................",
    ".....kkkkkk.....",
    "....kyyyyyyk....",
    "...kyyCCCCCyk...",
    "...kyykkkkyyk...",
    "...kyyyyyyyyk...",
    "...kyyyyyyyyk...",
    "...kyyyyyyyyk...",
    "...kyyttttyyk...",
    "...kyyyyyyyyk...",
    "...kyyttttttk...",
    "....kkkkkkkk....",
    "................",
    "................",
    "................",
    "................",
  ]),
  tube_kraft: rows([
    "................",
    "................",
    ".kkkkkkkkkkkkkk.",
    "kttccccccccccttk",
    "ktCccccccccccCtk",
    "ktCkkkkkkkkkkCtk",
    "ktCccccccccccCtk",
    "kttccccccccccttk",
    ".kkkkkkkkkkkkkk.",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
  ]),
  apple: rows([
    "................",
    ".......k........",
    "......kg........",
    ".....krrrrk.....",
    "....krrRrrrkk...",
    "...krrrrrrrrk...",
    "...krrrrrrrrk...",
    "...krrrrrrrrk...",
    "...krrrrrrrrk...",
    "....krrrrrrk....",
    ".....kkkkkk.....",
    "................",
    "................",
    "................",
    "................",
    "................",
  ]),
  banana: rows([
    "................",
    "...........kk...",
    ".........keeek..",
    "........keeeeek.",
    ".......keeeeeek.",
    "......keeeeeek..",
    ".....keeeeeek...",
    "....keeeeek.....",
    "...keeeek.......",
    "...keeek........",
    "...kkkk.........",
    "................",
    "................",
    "................",
    "................",
    "................",
  ]),
  burger: rows([
    "................",
    "....kkkkkkkk....",
    "...keeeeeeeek...",
    "...krrrrrrrrk...",
    "...kggggggggk...",
    "...kcccccccck...",
    "...keeeeeeeek...",
    "....kkkkkkkk....",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
  ]),
  cat: rows([
    "................",
    "..k...k.........",
    ".kuk.kuk........",
    ".kuuuuuk........",
    ".kwkukwk........",
    ".kuuoouuk.......",
    ".kuuuuuukkk.....",
    "..kuuuuuuuk.....",
    "..kuuukuuk......",
    "...kkkkkk.......",
    "...k....k.......",
    "................",
    "................",
    "................",
    "................",
    "................",
  ]),
  duck: rows([
    "................",
    ".........kk.....",
    "....kk..keek....",
    "...kooookeek....",
    "....k.keeeek....",
    ".....keeevek....",
    "....kkeeeeek....",
    ".....keeeeek....",
    "......kkkkkk....",
    "......k...k.....",
    ".....kk...kk....",
    "................",
    "................",
    "................",
    "................",
    "................",
  ]),
  bird: rows([
    "................",
    "......kk........",
    ".....kbbek......",
    "....kbbbeek.....",
    "...kbbbbbek.....",
    "...kbbboook.....",
    "....kbbbbk......",
    ".....kkkkk......",
    "......k.k.......",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
  ]),
  frog: rows([
    "................",
    "....k....k......",
    "...kgk..kgk.....",
    "...kggggggk.....",
    "...kgvggvgk.....",
    "...kggggggk.....",
    "....kggggk......",
    "....kggggk......",
    ".....kkkk.......",
    "....k....k......",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
  ]),
  fish: rows([
    "................",
    "................",
    "....kk...kk.....",
    "...kbbk.kbk.....",
    "..kbbbbkbbk.....",
    "..kbvbbkbbk.....",
    "..kbbbbkbbk.....",
    "...kbbk.kbk.....",
    "....kk...kk.....",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
  ]),
  cactus: rows([
    "................",
    "......kgk.......",
    ".....kgggk......",
    "..kgkggggk......",
    "..kggggggkgk....",
    "...kkggggkggk...",
    ".....kgggk......",
    ".....kgggk......",
    ".....ktttk......",
    "......kkk.......",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
  ]),
  fern: rows([
    "................",
    "....g.g.g.......",
    "...gGgGgG.......",
    "..gGggGggG......",
    "...gGgGgG.......",
    "....gktkg.......",
    ".....ktk........",
    ".....ktk........",
    ".....kkk........",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
  ]),
};

const ROBOT = rows([
  "............................",
  "............................",
  "..........kkkkkkkk..........",
  ".........kMMMMMMMMk.........",
  "........kMvvvvvvvvMk........",
  "........kMvVVVVVVvMk........",
  "........kMMkkkkkkMMk........",
  ".........kMMMMMMMMk.........",
  "..........kkkkkkkk..........",
  "....kkkkkkMMMMMMMMkkkkkk....",
  "...kAAAAAAMMMMMMMMAAAAAAk...",
  "...kAAwwwAMMMMMMMAwwwAAk...",
  "...kAAAAAAMMMMMMMMAAAAAAk...",
  "....kkkkkkMMMMMMMMkkkkkk....",
  "........kMMMMMMMMMk.........",
  ".......kMMMkkkkkkMMMk.......",
  "......kMMMkMMMMMMkMMMk......",
  ".....kMMMMkMMMMMMkMMMMk.....",
  ".....kMMMMkkkkkkkMMMMMk.....",
  "......kMMMMMMMMMMMMMMk......",
  ".......kMMMMMMMMMMMMk.......",
  "........kMMMk..kMMMk........",
  "........kMMMk..kMMMk........",
  "........kMMMk..kMMMk........",
  "........kkkkk..kkkkk........",
  "........kmmmk..kmmmk........",
  "........kmmmk..kmmmk........",
  "........kkkkk..kkkkk........",
]);

const CLAW_OPEN = rows([
  "..kkkkkkkk..",
  ".kMMwwwwMMk.",
  ".kMMkkkkMMk.",
  "kkMk....kMkk",
  "kMk......kMk",
  "kMk......kMk",
  "kk........kk",
  "............",
]);

const CLAW_SHUT = rows([
  "..kkkkkkkk..",
  ".kMMwwwwMMk.",
  ".kMMMMMMMMk.",
  ".kMMkkkkMMk.",
  "..kMMMMMMk..",
  "...kMMMMk...",
  "....kkkk....",
  "............",
]);

const GLOVE = rows([
  "...kkkkk....",
  "..kAAAAAAk..",
  ".kAAwwwAAAk.",
  "kAAAAAAAAAAk",
  "kAAAAAAAAAAk",
  "kAAAAAAAAAAk",
  "kAAaaaaAAAAk",
  "kAAAAAAAAAAk",
  ".kAAAAAAAAAk",
  "..kkkkkkkk..",
  "...kssssk...",
  "....kkkk....",
]);

function crackRng(seed) {
  let t = seed | 0;
  return () => {
    t = (t + 1831565813) | 0;
    let e = Math.imul(t ^ (t >>> 15), 1 | t);
    e = e + Math.imul(e ^ (e >>> 7), 61 | e) ^ e;
    return ((e ^ (e >>> 14)) >>> 0) / 4294967296;
  };
}

function line(ctx, x0, y0, x1, y1) {
  let x = Math.round(x0);
  let y = Math.round(y0);
  const x2 = Math.round(x1);
  const y2 = Math.round(y1);
  const dx = Math.abs(x2 - x);
  const sx = x < x2 ? 1 : -1;
  const dy = -Math.abs(y2 - y);
  const sy = y < y2 ? 1 : -1;
  let err = dx + dy;
  while (true) {
    if (x >= 0 && x < RULES.width && y >= 0 && y < RULES.height) ctx.fillRect(x, y, 1, 1);
    if (x === x2 && y === y2) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y += sy;
    }
  }
}

export function createArt() {
  const itemSprites = {};
  for (const [id, art] of Object.entries(ITEMS)) {
    itemSprites[id] = spriteFromRows(art, ITEM);
  }
  const robot = spriteFromRows(ROBOT, {
    k: PAL.k,
    M: PAL.M,
    m: PAL.m,
    v: PAL.v,
    V: PAL.V,
    A: PAL.A,
    a: PAL.a,
    w: PAL.w,
  });
  const clawOpen = spriteFromRows(CLAW_OPEN, { k: PAL.k, M: PAL.M, w: PAL.w });
  const clawShut = spriteFromRows(CLAW_SHUT, { k: PAL.k, M: PAL.M, w: PAL.w });
  const glove = spriteFromRows(GLOVE, {
    k: PAL.k,
    A: PAL.A,
    a: PAL.a,
    w: PAL.w,
    s: PAL.s,
  });

  let particles = [];
  let floats = [];

  function burst(x, y, color) {
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2;
      particles.push({
        x,
        y,
        vx: Math.cos(a) * 30,
        vy: Math.sin(a) * 30 - 14,
        t: 0,
        color,
      });
    }
  }

  function spawnFloat(x, y, msg, col) {
    floats.push({ x, y, msg, col, t: 0 });
  }

  function outline(ctx, sprite, x, y) {
    const c = sprite.image.getContext("2d");
    const data = c.getImageData(0, 0, sprite.width, sprite.height).data;
    const w = sprite.width;
    const h = sprite.height;
    const opaque = (px, py) => {
      if (px < 0 || py < 0 || px >= w || py >= h) return false;
      return data[(py * w + px) * 4 + 3] > 128;
    };
    ctx.fillStyle = PURPLE;
    for (let py = 0; py < h; py += 1) {
      for (let px = 0; px < w; px += 1) {
        if (!opaque(px, py)) continue;
        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          if (!opaque(px + dx, py + dy)) {
            ctx.fillRect(Math.floor(x) + px + dx, Math.floor(y) + py + dy, 1, 1);
          }
        }
      }
    }
  }

  function drawItem(ctx, kind, clean, x, y, rot = 0) {
    const sprite = itemSprites[kind] ?? itemSprites.box_brown;
    const px = Math.round(x);
    const py = Math.round(y);
    if (rot) {
      ctx.save();
      ctx.translate(px + 8, py + 8);
      ctx.rotate(rot);
      ctx.drawImage(sprite.image, -8, -8);
      if (!clean) outline(ctx, sprite, -8, -8);
      ctx.restore();
      return;
    }
    blit(ctx, sprite, px, py);
    if (!clean) outline(ctx, sprite, px, py);
  }

  function drawRobot(ctx, world, time, reducedMotion) {
    const bob = reducedMotion || world.slam ? 0 : Math.sin(time * 1.6) > 0.75 ? -1 : 0;
    const x = RULES.robotX;
    const y = RULES.robotY + bob;
    blit(ctx, robot, x, y);
    const glance = world.px < -50 ? 0 : Math.max(-1, Math.min(1, Math.round((world.px - (x + 14)) / 70)));
    ctx.fillStyle = PAL.k;
    ctx.fillRect(x + 11 + glance, y + 6, 2, 2);
    ctx.fillRect(x + 17 + glance, y + 6, 2, 2);
    if (world.suit >= 1) {
      ctx.fillStyle = PAL.d;
      ctx.fillRect(x + 10, y + 14, 4, 2);
      ctx.fillRect(x + 18, y + 16, 3, 3);
    }
    if (world.suit >= 2) {
      ctx.fillStyle = PAL.o;
      ctx.fillRect(x + 8, y + 10, 1, 1);
      ctx.fillRect(x + 22, y + 12, 1, 1);
      ctx.fillRect(x + 14, y + 18, 1, 1);
    }
    if (world.suit >= 3) {
      ctx.fillStyle = PAL.k;
      ctx.fillRect(x + 12, y + 2, 7, 1);
      ctx.fillStyle = PAL.a;
      ctx.fillRect(x + 13, y + 3, 2, 3);
    }
    if (world.suit >= 4) {
      ctx.fillStyle = "rgba(74,28,60,0.85)";
      ctx.fillRect(x + 9, y + 2, 6, 5);
    }
    if (world.suit >= 5) {
      ctx.fillStyle = "rgba(74,28,60,0.85)";
      ctx.fillRect(x + 16, y + 2, 6, 5);
      ctx.fillStyle = PAL.o;
      ctx.fillRect(x + 14, y + 8, 2, 2);
    }
  }

  function drawBelt(ctx, world) {
    ctx.fillStyle = "#2a333c";
    ctx.fillRect(0, RULES.beltTop - 5, RULES.width, 5);
    ctx.fillStyle = "#9aa7b2";
    ctx.fillRect(0, RULES.beltTop - 5, RULES.width, 1);
    ctx.fillStyle = "#5a6570";
    ctx.fillRect(0, RULES.beltTop - 1, RULES.width, 1);
    ctx.fillStyle = "#4b555f";
    ctx.fillRect(0, RULES.beltTop, RULES.width, RULES.beltBottom - RULES.beltTop);
    const h = world.beltX % 14;
    for (let u = -14 + h; u < RULES.width; u += 14) {
      const m = Math.round(u);
      ctx.fillStyle = "#0000002e";
      ctx.fillRect(m, RULES.beltTop, 1, RULES.beltBottom - RULES.beltTop);
      ctx.fillStyle = "#ffffff10";
      ctx.fillRect(m + 1, RULES.beltTop, 1, RULES.beltBottom - RULES.beltTop);
    }
    ctx.fillStyle = "#0009";
    ctx.fillRect(0, RULES.beltTop, RULES.width, 2);
    ctx.fillStyle = "#2a333c";
    ctx.fillRect(0, RULES.beltBottom, RULES.width, 6);
    ctx.fillStyle = "#8b99a5";
    ctx.fillRect(0, RULES.beltBottom, RULES.width, 1);
    ctx.fillStyle = "#1a2026";
    ctx.fillRect(0, RULES.beltBottom + 5, RULES.width, 1);
  }

  function drawPoster(ctx, x, y, header, title, kind, clean) {
    ctx.fillStyle = "#0a0d10";
    ctx.fillRect(x, y, 42, 34);
    ctx.fillStyle = "#e8eef4";
    ctx.fillRect(x + 1, y + 1, 40, 32);
    ctx.fillStyle = header;
    ctx.fillRect(x + 1, y + 1, 40, 7);
    drawText(ctx, title, x + 5, y + 2, "#0b0e11");
    drawItem(ctx, kind, clean, x + 13, y + 12, 0);
  }

  function drawScene(ctx) {
    ctx.fillStyle = "#0b0e11";
    ctx.fillRect(0, 0, RULES.width, RULES.height);
    ctx.fillStyle = "#161c22";
    ctx.fillRect(0, 0, RULES.width, RULES.beltTop);
    for (let px = 0; px < RULES.width; px += 8) {
      ctx.fillStyle = "#1a2229";
      ctx.fillRect(px, 12, 1, RULES.beltTop - 18);
    }
    drawPoster(ctx, 6, 16, "#7ecb7a", "BOX", "box_brown", true);
    drawPoster(ctx, 52, 16, "#7ecb7a", "BAG", "bag_white", true);
    drawPoster(ctx, 176, 16, "#d45a4a", "OFF", "apple", false);
    drawPoster(ctx, 222, 16, "#d45a4a", "OFF", "cat", false);
  }

  function drawFixtures(ctx) {
    const bx = 4;
    const by = 142;
    ctx.fillStyle = "#3d2a16";
    ctx.fillRect(bx, by + 4, 60, 32);
    ctx.fillStyle = "#6b4a28";
    ctx.fillRect(bx + 2, by + 6, 56, 28);
    ctx.fillStyle = "#8a6234";
    ctx.fillRect(bx + 2, by + 6, 56, 2);
    for (let i = 0; i < 60; i += 6) {
      ctx.fillStyle = (i / 6) % 2 === 0 ? "#e8cf7a" : "#12151a";
      ctx.fillRect(bx + i, by, 6, 6);
    }
    drawText(ctx, "REJECT", bx + 10, by + 16, "#e6c37a");

    const rx = 268;
    ctx.fillStyle = "#0a0d10";
    ctx.fillRect(rx - 2, RULES.beltTop - 8, RULES.width - rx + 2, 72);
    ctx.fillStyle = "#c9a03a";
    ctx.fillRect(rx + 8, RULES.beltTop + 2, 42, 34);
    ctx.fillStyle = "#7a5a18";
    ctx.fillRect(rx + 8, RULES.beltTop + 32, 42, 3);
    ctx.fillStyle = "#f0bb3c";
    ctx.fillRect(rx, RULES.beltTop + 14, 50, 44);
    ctx.fillStyle = "#5a4212";
    ctx.fillRect(rx, RULES.beltTop + 14, 50, 2);
    drawText(ctx, "OUTBOUND", rx + 2, RULES.beltTop + 30, "#5a4212");
    for (let i = 0; i < 50; i += 5) {
      ctx.fillStyle = (i / 5) % 2 === 0 ? "#12151a" : "#e8cf7a";
      ctx.fillRect(rx + i, RULES.beltTop + 54, 5, 4);
    }
  }

  function drawHud(ctx, world) {
    ctx.fillStyle = "#0d1115";
    ctx.fillRect(0, 0, RULES.width, RULES.header);
    ctx.fillStyle = "#2b343d";
    ctx.fillRect(0, RULES.header - 1, RULES.width, 1);
    drawText(ctx, "SCORE", 5, 3, "#5f6f7c");
    drawText(ctx, String(world.score).padStart(6, "0"), 37, 3, "#e8eef4");
    const mult = comboMult(world.combo);
    if (mult > 1) drawText(ctx, `X${mult}`, 78, 3, "#7ad2e8");
    drawText(ctx, "OUT", 108, 3, "#5f6f7c");
    ctx.fillStyle = "#1c2329";
    ctx.fillRect(124, 3, RULES.crateBar, 5);
    const filled = Math.min(RULES.crateBar, Math.round((world.shipped / RULES.crateCap) * RULES.crateBar));
    ctx.fillStyle = "#8fe08a";
    ctx.fillRect(124, 3, Math.max(0, filled), 5);
    drawText(ctx, SHIFTS[world.shiftIdx].name, 192, 3, "#8d9aa5");
    for (let i = 0; i < 5; i += 1) {
      const ox = RULES.width - 34 + i * 6;
      ctx.fillStyle = i < world.suit ? "#ff5a4a" : "#2b343d";
      ctx.fillRect(ox, 3, 4, 5);
    }
  }

  function drawSlam(ctx, world, time) {
    const slam = world.slam;
    if (!slam) return;
    if (slam.t < RULES.slamHit) {
      const o = slam.t / RULES.slamHit;
      const x = slam.fromX + (RULES.robotX + 10 - slam.fromX) * o;
      const y = slam.fromY + (RULES.robotY + 16 - slam.fromY) * o - Math.sin(o * Math.PI) * 20;
      drawItem(ctx, slam.item.kind ?? slam.item.id, false, x, y, o * 9);
      return;
    }
    const span = RULES.slamEnd - RULES.slamHit;
    const k = (slam.t - RULES.slamHit) / span;
    const hit = (RULES.slamCrack - RULES.slamHit) / span;
    const size = k < hit
      ? 10 + ((k / hit) ** 2) * 150
      : 160 - ((k - hit) / Math.max(0.001, 1 - hit)) * 150;
    const cx = RULES.width / 2;
    const cy = RULES.beltTop / 2 + 4;
    ctx.fillStyle = `rgba(0,0,0,${0.34 * Math.min(1, size / 120)})`;
    ctx.fillRect(0, 0, RULES.width, RULES.beltTop - 12);
    const scale = Math.max(6, size) / 12;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.drawImage(glove.image, -glove.width / 2, -glove.height / 2);
    ctx.restore();
    if (slam.cracked && k < hit + 0.12) {
      ctx.globalAlpha = 1 - (k - hit) / 0.12;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, RULES.width, RULES.height);
      ctx.globalAlpha = 1;
    }
  }

  function drawCracks(ctx, world) {
    for (const crack of world.cracks) {
      const rng = crackRng(crack.seed);
      let x = 34 + rng() * (RULES.width - 68);
      let y = 24 + rng() * (RULES.height - 60);
      const n = crack.big ? 11 : 7;
      for (let i = 0; i < n; i += 1) {
        let ang = (i / n) * Math.PI * 2 + rng() * 0.7;
        let cx = x;
        let cy = y;
        const dist = (crack.big ? 55 : 30) + rng() * (crack.big ? 90 : 60);
        let walked = 0;
        while (walked < dist) {
          const step = 3 + rng() * 6;
          const nx = cx + Math.cos(ang) * step;
          const ny = cy + Math.sin(ang) * step;
          ctx.fillStyle = "#0a0d11cc";
          line(ctx, cx + 1, cy + 1, nx + 1, ny + 1);
          ctx.fillStyle = "#cfe2f0aa";
          line(ctx, cx, cy, nx, ny);
          cx = nx;
          cy = ny;
          walked += step;
          ang += (rng() - 0.5) * 0.8;
        }
      }
    }
  }

  function drawIntro(ctx, time) {
    ctx.fillStyle = "#080b0eee";
    ctx.fillRect(0, 0, RULES.width, RULES.height);
    drawTextCentered(ctx, "PARCEL SORT", RULES.width / 2, 10, "#f0e6cf");
    drawTextCentered(ctx, "CLEAN BOXES AND BAGS RIDE", RULES.width / 2, 22, "#e8cf7a");
    drawTextCentered(ctx, "PURPLE FRAME COMES OFF", RULES.width / 2, 32, "#e8cf7a");
    drawText(ctx, "LET IT RIDE", 8, 42, "#8fe08a");
    drawText(ctx, "KNOCK IT OFF", 166, 42, "#ff7a6e");
    const clean = ["box_brown", "bag_white", "tube_kraft", "box_tape", "box_label", "bag_yellow", "box_small", "box_stripe"];
    const junk = ["apple", "cat", "banana", "duck", "cactus", "fish", "burger", "bird"];
    clean.forEach((id, i) => drawItem(ctx, id, true, 8 + (i % 4) * 18, 50 + Math.floor(i / 4) * 18, 0));
    junk.forEach((id, i) => drawItem(ctx, id, false, 166 + (i % 4) * 18, 50 + Math.floor(i / 4) * 18, 0));
    const blink = time % 1.2 < 0.85 ? "#f0e6cf" : "#6c7883";
    drawTextCentered(ctx, "CLICK OR PRESS SPACE TO START", RULES.width / 2, RULES.height - 12, blink);
  }

  function drawOver(ctx, world, best, newBest) {
    ctx.fillStyle = "#080b0ee0";
    ctx.fillRect(0, RULES.beltTop - 12, RULES.width, RULES.height - RULES.beltTop + 12);
    const grade = outboundGrade(world.shipped);
    const pct = rejectPercent(world);
    const lines = [
      ["LINE SHUT DOWN", "#ff7a6e"],
      [`SCORE ${world.score}`, "#e8eef4"],
      [`SHIPPED ${world.shipped}   BEST X${world.bestCombo}`, "#8d9aa5"],
      [newBest ? "NEW BEST" : `BEST ${best}`, newBest ? "#8fe08a" : "#6c7883"],
      [`${pct}% OF YOUR LINE WAS REJECT`, "#e8cf7a"],
      [`GRADE  ${grade}`, "#8fe08a"],
      ["CLICK TO RUN IT AGAIN", "#5f6f7c"],
    ];
    let y = RULES.beltTop - 4;
    for (const [msg, col] of lines) {
      drawTextCentered(ctx, msg, RULES.width / 2, y, col);
      y += 12;
    }
  }

  function draw(ctx, { world, time, best, newBest, reducedMotion, flash = 0 }) {
    drawScene(ctx);
    drawRobot(ctx, world, time, reducedMotion);
    drawBelt(ctx, world);
    for (const it of world.items) {
      if (it.pull) continue;
      ctx.fillStyle = "#00000044";
      ctx.fillRect(Math.round(it.x) + 2, it.y + 15, 12, 2);
    }
    for (const it of world.items) {
      if (it.pull) continue;
      drawItem(ctx, it.kind, it.clean, it.x, it.y, it.rot);
    }
    drawFixtures(ctx);
    for (const it of world.items) {
      if (!it.pull) continue;
      const p = pullPos(it);
      drawItem(ctx, it.kind, it.clean, p.x, p.y, it.rot + it.pull.t * 6);
    }
    if (world.px > -50) {
      const shut = time - (world.hitAt ?? -9) < RULES.grabFlash || world.elapsed - world.hitAt < RULES.grabFlash;
      blit(ctx, shut ? clawShut : clawOpen, world.px - 4, world.py - 5);
    }
    drawSlam(ctx, world, time);
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, 1 - p.t / 0.5);
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 2);
      ctx.globalAlpha = 1;
    }
    for (const f of floats) {
      const e = f.t / 0.9;
      const w = textWidth(f.msg);
      let ox = Math.round(f.x + 8 - w / 2);
      let oy = Math.round(f.y - 2 - e * 10);
      ox = Math.max(2, Math.min(RULES.width - w - 2, ox));
      oy = Math.max(RULES.beltTop + 2, Math.min(RULES.beltBottom - 8, oy));
      ctx.globalAlpha = Math.max(0, 1 - e * e);
      ctx.fillStyle = "#0a0d10e0";
      ctx.fillRect(ox - 2, oy - 2, w + 4, 9);
      drawText(ctx, f.msg, ox, oy, f.col);
      ctx.globalAlpha = 1;
    }
    if (world.shiftCard > 0 && world.phase === "playing") {
      ctx.globalAlpha = Math.min(1, world.shiftCard);
      ctx.fillStyle = "#0b0e11cc";
      ctx.fillRect(0, 60, RULES.width, 14);
      drawTextCentered(ctx, SHIFTS[world.shiftIdx].name, RULES.width / 2, 64, "#e8cf7a");
      ctx.globalAlpha = 1;
    }
    if (flash > 0 && !reducedMotion) {
      ctx.fillStyle = `rgba(255,90,74,${flash * 0.28})`;
      ctx.fillRect(0, 0, RULES.width, RULES.height);
    }
    drawHud(ctx, world);
    drawCracks(ctx, world);
    if (world.phase === "intro") drawIntro(ctx, time);
    else if (world.phase === "over") drawOver(ctx, world, best, newBest);
  }

  return {
    draw,
    burst,
    spawnFloat,
    updateParticles(dt) {
      for (const p of particles) {
        p.t += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 150 * dt;
      }
      particles = particles.filter((p) => p.t < 0.5);
      for (const f of floats) f.t += dt;
      floats = floats.filter((f) => f.t < 0.9);
    },
    clearParticles() {
      particles = [];
      floats = [];
    },
  };
}
