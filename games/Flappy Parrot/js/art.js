import { PHYSICS } from "./world.js";
import {
  blit,
  drawText,
  drawTextCentered,
  padRows,
  spriteFromRows,
  textWidth,
} from "./runtime.js";

const SKY_TOP = "#12417c";
const SKY_MID = "#4f8ec9";
const SKY_HORIZON = "#c6dfef";
const COLUMN = {
  outline: "#2b2f3a",
  light: "#fffdf6",
  face: "#ece5d4",
  shade: "#c3b79c",
  flute: "#d3c8ae",
  gold: "#d8a930",
};

const PARROT_PAL = {
  k: "#1a1210",
  r: "#e23a28",
  R: "#ff6a48",
  y: "#ffe14a",
  g: "#2ecf5a",
  b: "#3d6ce0",
  w: "#fff8ee",
  e: "#101010",
  o: "#ff9a2a",
};

const BUILDING_PAL = {
  k: "#4e5666",
  l: "#eef1f7",
  s: "#cdd4e0",
  d: "#9aa4b6",
  g: "#c8a24a",
};

const HOUSE_PAL = {
  k: "#8a7f74",
  l: "#ffffff",
  s: "#f2ece2",
  d: "#d8cfc2",
  w: "#a8967f",
  g: "#c8a24a",
};

const CASTLE_PAL = {
  k: "#3b201a",
  r: "#9c5241",
  m: "#6d3629",
  l: "#c47a5f",
  w: "#2a1a1e",
  g: "#c8a24a",
};

const TREE_PAL = {
  k: "#123320",
  g: "#1d5c31",
  l: "#2c8440",
  t: "#4a3a24",
  p: "#f0a8bd",
};

const CAP_PAL = {
  k: COLUMN.outline,
  l: COLUMN.light,
  s: COLUMN.face,
  d: COLUMN.shade,
  g: COLUMN.gold,
};

function makeSprites() {
  const parrotUp = spriteFromRows(
    padRows([
      "......gg..............",
      ".....gyyg.............",
      "....gyyyg...kkkk......",
      "...gyyyyg.kkrrrrk.....",
      "..kggggk.krrwwwrk.....",
      "...kkkk.krrwewrrko....",
      ".......krrrrrrrrkoo...",
      ".....kkrrrrRrrrrko....",
      "...bbkkyyyyrrrrrk.....",
      "..bbbbkkyyyyrrrk......",
      ".bbbbk..krrrkk........",
      "..bbk....kk...........",
      "...bk.................",
    ]),
    PARROT_PAL,
  );

  const parrotMid = spriteFromRows(
    padRows([
      "............kkkk......",
      ".........kkkrrrrk.....",
      ".....gggkrrrwwwrk.....",
      "...kgyyykrrrwewrrko...",
      "..kgyyyyyrrrrrrrrkoo..",
      ".kgggggkrrrrRrrrrko...",
      "..kkkkkkyyyyrrrrrk....",
      "...bbkkyyyyyyrrrk.....",
      "..bbbbk.krrrkk........",
      ".bbbbk...kk...........",
      "..bbk.................",
      "...bk.................",
    ]),
    PARROT_PAL,
  );

  const parrotDown = spriteFromRows(
    padRows([
      "............kkkk......",
      "...........krrrrk.....",
      "..........krrwwwrk.....",
      ".........krrwewrrko...",
      "........krrrrrrrrkoo..",
      ".....kkkrrrrRrrrrko...",
      "...bbkkyyyyrrrrrk.....",
      "..bbbbkgyyyyrrrk......",
      ".bbbbkgyyyyyrrkk......",
      "..bbk.kgggggk........",
      "...bk..kgyyygk........",
      "........kgggk.........",
      ".........kkk..........",
    ]),
    PARROT_PAL,
  );

  const columnCap = spriteFromRows(
    padRows([
      "..kkkkkkkkkkkkkkkkkk..",
      "..klllllllllllllllsk..",
      "..kssssssssssssssssk..",
      ".kllllllllllllllllllk.",
      ".kgggggggggggggggggdk.",
      "klllllllllllllllllllsk",
      "kssssssssssssssssssssk",
      "kkkkkkkkkkkkkkkkkkkkkk",
    ]),
    CAP_PAL,
  );

  const capitol = spriteFromRows(
    padRows([
      "..........ll..........",
      ".........kllk.........",
      "........kllllk........",
      ".......kllllllk.......",
      "......klllllllsk......",
      "......klllllllsk......",
      ".....kslllllllssk.....",
      "....kkslllllllsskk....",
      "...kslllwlllwllllsk...",
      "..ksllllllllllllllsk..",
      "kslwlwlwlwlwlwlwlwlssk",
      "kslllllllllllllllllsdk",
      "kkkkkkkkkkkkkkkkkkkkkk",
    ]),
    BUILDING_PAL,
  );

  const house = spriteFromRows(
    padRows([
      ".....................g",
      "....................kllk",
      "...................kllllk",
      "..................kllllllk",
      ".................kllllllllk",
      "................kkkkkkkkkkkk",
      ".............kllkllllllllllkllk",
      ".............kllklwwlwwlwwlkllk",
      "kkkkkkkkkkkkkkllklwwlwwlwwlkllkkkkkkkkkkkkkk",
      "klllllllllllkkllklwwlwwlwwlkllkklllllllllllk",
      "klwlwlwlwlwlkkllklwwlwwlwwlkllkklwlwlwlwlwlk",
      "klllllllllllkkllklwwlwwlwwlkllkklllllllllllk",
      "kdddddddddddkkddddddddddddddddkkdddddddddddk",
      "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk",
    ]),
    HOUSE_PAL,
  );

  const castle = spriteFromRows(
    padRows([
      "....g..........g",
      "...kkk........kkk",
      "...krk........krk",
      "..krrrk......krrrk",
      "..klrmk......klrmk",
      "..krwrk......krwrk",
      "..krrrkkkrkkkkrrrk",
      "kkkkrwrkklrmkkrwrkkk",
      "krrklrmkkrwrkklrmkrk",
      "krwkrrrkklrmkkrrrkwk",
      "kmmkmmmkkmmmkkmmmkmk",
      "kkkkkkkkkkkkkkkkkkkk",
    ]),
    CASTLE_PAL,
  );

  const block = spriteFromRows(
    padRows([
      "kkkkkkkkkkkk",
      "kllllllllllk",
      "klwlwlwlwlwk",
      "kllllllllllk",
      "klwlwlwlwlwk",
      "kddddddddddk",
      "kkkkkkkkkkkk",
    ]),
    BUILDING_PAL,
  );

  const lincoln = spriteFromRows(
    padRows([
      "kkkkkkkkkkkkkkkkkkkk",
      "kllllllllllllllllllk",
      "kddddddddddddddddddk",
      "klwlwlwlwlwlwlwlwllk",
      "klwlwlwlwlwlwlwlwllk",
      "kllllllllllllllllllk",
      "kddddddddddddddddddk",
      "kkkkkkkkkkkkkkkkkkkk",
    ]),
    BUILDING_PAL,
  );

  const elm = spriteFromRows(
    padRows(["..kkkk..", ".kgllgk.", "kglllllk", "kgllllgk", ".kgllgk.", "...tt...", "...tt..."]),
    TREE_PAL,
  );

  const cherry = spriteFromRows(
    padRows(["..kppk..", ".kpqqpk.", "kppqqppk", ".kpqqpk.", "...tk...", "...tt..."]),
    { ...TREE_PAL, q: "#d97f9c" },
  );

  return {
    parrotUp,
    parrotMid,
    parrotDown,
    columnCap,
    capitol,
    house,
    castle,
    block,
    lincoln,
    elm,
    cherry,
  };
}

function flipY(sprite) {
  const image = document.createElement("canvas");
  image.width = sprite.width;
  image.height = sprite.height;
  const ctx = image.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.translate(0, sprite.height);
  ctx.scale(1, -1);
  ctx.drawImage(sprite.image, 0, 0);
  return { width: sprite.width, height: sprite.height, image };
}

function makeLayer(width, height, paint, haze = 0) {
  const image = document.createElement("canvas");
  image.width = width;
  image.height = height;
  const ctx = image.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  paint(ctx);
  if (haze > 0) {
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = `rgba(198, 223, 239, ${haze})`;
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = "source-over";
  }
  return image;
}

function tile(ctx, image, viewW, scroll, y) {
  const w = image.width;
  let x = -(((scroll % w) + w) % w);
  for (; x < viewW; x += w) ctx.drawImage(image, Math.round(x), y);
}

function drawSky(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, SKY_TOP);
  g.addColorStop(0.55, SKY_MID);
  g.addColorStop(1, SKY_HORIZON);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const sunX = 208;
  const sunY = 40;
  const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 52);
  glow.addColorStop(0, "rgba(255, 244, 214, 0.5)");
  glow.addColorStop(1, "rgba(255, 244, 214, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(sunX - 52, sunY - 52, 104, 104);
  ctx.fillStyle = "#fff6d8";
  ctx.beginPath();
  ctx.arc(sunX, sunY, 6, 0, Math.PI * 2);
  ctx.fill();
}

const CLOUD = ["..####....", ".########.", "##########", ".########."];
const CLOUDS = [
  { x: 0.05, y: 20, scale: 2, speed: 3.1, alpha: 0.9 },
  { x: 0.32, y: 46, scale: 1, speed: 4.4, alpha: 0.75 },
  { x: 0.55, y: 14, scale: 3, speed: 2.2, alpha: 0.8 },
  { x: 0.78, y: 58, scale: 2, speed: 3.6, alpha: 0.65 },
  { x: 0.9, y: 34, scale: 1, speed: 5, alpha: 0.6 },
];

function drawClouds(ctx, viewW, time) {
  for (const cloud of CLOUDS) {
    const span = viewW + CLOUD[0].length * cloud.scale;
    const x = Math.round(viewW - ((cloud.x * span + time * cloud.speed) % span));
    ctx.globalAlpha = cloud.alpha;
    ctx.fillStyle = "#ffffff";
    for (let row = 0; row < CLOUD.length; row += 1) {
      for (let col = 0; col < CLOUD[row].length; col += 1) {
        if (CLOUD[row][col] === "#") {
          ctx.fillRect(x + col * cloud.scale, cloud.y + row * cloud.scale, cloud.scale, cloud.scale);
        }
      }
    }
  }
  ctx.globalAlpha = 1;
}

function drawColumnShaft(ctx, x, y, h) {
  if (h <= 0) return;
  ctx.fillStyle = COLUMN.outline;
  ctx.fillRect(x + 2, y, 18, h);
  ctx.fillStyle = COLUMN.light;
  ctx.fillRect(x + 3, y, 5, h);
  ctx.fillStyle = COLUMN.face;
  ctx.fillRect(x + 8, y, 6, h);
  ctx.fillStyle = COLUMN.shade;
  ctx.fillRect(x + 14, y, 5, h);
  ctx.fillStyle = COLUMN.flute;
  for (const fx of [5, 9, 13, 17]) ctx.fillRect(x + fx, y, 1, h);
}

function makePennant(w, h, colors) {
  const image = document.createElement("canvas");
  image.width = w;
  image.height = h;
  const ctx = image.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  for (let col = 0; col < w; col += 1) {
    const taper = Math.floor((col / Math.max(1, w - 1)) * (h / 2));
    const y0 = taper;
    const y1 = h - taper;
    const span = Math.max(1, y1 - y0);
    for (let y = y0; y < y1; y += 1) {
      const band = Math.min(colors.length - 1, Math.floor(((y - y0) / span) * colors.length));
      ctx.fillStyle = colors[band];
      ctx.fillRect(col, y, 1, 1);
    }
  }
  return { width: w, height: h, image };
}

function pixelLine(ctx, x0, y0, x1, y1, color, width = 1) {
  let x = Math.round(x0);
  let y = Math.round(y0);
  const endX = Math.round(x1);
  const endY = Math.round(y1);
  const dx = Math.abs(endX - x);
  const sx = x < endX ? 1 : -1;
  const dy = -Math.abs(endY - y);
  const sy = y < endY ? 1 : -1;
  let error = dx + dy;
  ctx.fillStyle = color;
  while (true) {
    ctx.fillRect(x, y, width, width);
    if (x === endX && y === endY) break;
    const next = error * 2;
    if (next >= dy) {
      error += dy;
      x += sx;
    }
    if (next <= dx) {
      error += dx;
      y += sy;
    }
  }
}

function drawEiffel(ctx, left, groundY, height) {
  const top = groundY - height;
  const cx = left + 23;
  const dark = "#3f342d";
  const iron = "#75665a";
  const light = "#b9a68e";
  const deck = "#d8c5a6";
  const upperY = top + 20;
  const middleY = top + 40;
  const lowerY = top + 64;
  const baseY = groundY - 1;

  const rail = (x0, y0, x1, y1) => {
    pixelLine(ctx, x0, y0, x1, y1, dark, 2);
    pixelLine(ctx, x0 + 1, y0, x1 + 1, y1, light);
  };
  const brace = (x0, x1, y0, y1) => {
    pixelLine(ctx, x0, y0, x1, y1, iron);
    pixelLine(ctx, x1, y0, x0, y1, iron);
  };
  const platform = (y, half) => {
    ctx.fillStyle = dark;
    ctx.fillRect(cx - half - 2, y - 1, half * 2 + 5, 4);
    ctx.fillStyle = deck;
    ctx.fillRect(cx - half - 1, y, half * 2 + 3, 1);
  };

  ctx.fillStyle = deck;
  ctx.fillRect(cx, top - 5, 1, 6);
  ctx.fillRect(cx - 1, top - 6, 3, 1);

  rail(cx, top, cx - 4, upperY);
  rail(cx, top, cx + 4, upperY);
  rail(cx - 4, upperY, cx - 9, middleY);
  rail(cx + 4, upperY, cx + 9, middleY);
  rail(cx - 9, middleY, cx - 15, lowerY);
  rail(cx + 9, middleY, cx + 15, lowerY);
  rail(cx - 15, lowerY, cx - 23, baseY);
  rail(cx + 15, lowerY, cx + 23, baseY);

  brace(cx - 3, cx + 3, top + 5, upperY - 3);
  brace(cx - 5, cx + 5, upperY + 4, upperY + 11);
  brace(cx - 7, cx + 7, upperY + 12, middleY - 3);
  brace(cx - 10, cx + 10, middleY + 4, middleY + 12);
  brace(cx - 12, cx + 12, middleY + 13, lowerY - 3);

  brace(cx - 19, cx - 12, lowerY + 5, lowerY + 14);
  brace(cx + 12, cx + 19, lowerY + 5, lowerY + 14);
  brace(cx - 22, cx - 15, lowerY + 16, baseY - 2);
  brace(cx + 15, cx + 22, lowerY + 16, baseY - 2);

  pixelLine(ctx, cx - 13, baseY, cx - 10, baseY - 13, dark, 2);
  pixelLine(ctx, cx - 10, baseY - 13, cx, baseY - 20, dark, 2);
  pixelLine(ctx, cx, baseY - 20, cx + 10, baseY - 13, dark, 2);
  pixelLine(ctx, cx + 10, baseY - 13, cx + 13, baseY, dark, 2);

  platform(upperY, 6);
  platform(middleY, 11);
  platform(lowerY, 17);

  ctx.fillStyle = dark;
  ctx.fillRect(cx - 25, baseY, 12, 2);
  ctx.fillRect(cx + 14, baseY, 12, 2);
}

function drawFlag(ctx, flag, x, y, poleH, time, phase) {
  ctx.fillStyle = "#dfe4ec";
  ctx.fillRect(x, y, 1, poleH);
  ctx.fillStyle = "#c8c8c8";
  ctx.fillRect(x, y - 1, 1, 1);
  for (let col = 0; col < flag.width; col += 1) {
    const t = col / Math.max(1, flag.width - 1);
    const wave = Math.sin(t * 5 - time * 4 + phase) * t * 1.8;
    ctx.drawImage(
      flag.image,
      col,
      0,
      1,
      flag.height,
      x + 1 + col,
      Math.round(y + wave),
      1,
      flag.height,
    );
  }
}

function drawGround(ctx, w, canvasH, groundY, scroll) {
  ctx.fillStyle = "#cfc4a8";
  ctx.fillRect(0, groundY, w, 6);
  ctx.fillStyle = "#a89c80";
  ctx.fillRect(0, groundY + 6, w, 1);
  ctx.fillStyle = "#3c6a33";
  ctx.fillRect(0, groundY + 7, w, canvasH - groundY - 7);
  ctx.fillStyle = "#4a7d3e";
  const stripe = 26;
  let x = -(((scroll % stripe) + stripe) % stripe);
  for (; x < w; x += stripe) ctx.fillRect(Math.round(x), groundY + 7, 13, canvasH - groundY - 7);
  ctx.fillStyle = "#2c5026";
  ctx.fillRect(0, canvasH - 3, w, 3);
}

function overlayCard(ctx, w, h, { title, lines = [], prompt, best, titleScale = 2, top }) {
  ctx.fillStyle = "rgba(8, 12, 20, 0.72)";
  ctx.fillRect(0, 0, w, h);
  const innerW = Math.min(
    w - 8,
    Math.max(
      textWidth(title, titleScale),
      ...lines.map((line) => textWidth(line)),
      prompt ? textWidth(prompt) : 0,
      best ? textWidth(best) : 0,
    ) + 28,
  );
  let boxH = 12 + 7 * titleScale;
  if (lines.length) boxH += 10 + lines.length * 12 - 5;
  if (prompt) boxH += 10 + 7;
  if (best) boxH += 12;
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
    cy += 7;
  }
  if (best) {
    cy += 5;
    drawTextCentered(ctx, best, w / 2, cy, "#c9a227");
  }
}

function overlayBar(ctx, w, title, subtitle) {
  ctx.fillStyle = "rgba(8, 12, 20, 0.82)";
  ctx.fillRect(0, 116, w, 50);
  drawTextCentered(ctx, title, w / 2, 124, "#ffe680", 2);
  drawTextCentered(ctx, subtitle, w / 2, 146, "#e8edf5");
}

export function createArt() {
  const sprites = makeSprites();
  const capBottom = flipY(sprites.columnCap);
  const far = makeLayer(288, 40, (ctx) => {
    const offsets = [0, 5, 2, 8, 1, 6, 3, 7, 0, 4, 9, 2];
    for (let i = 0; i < offsets.length; i += 1) {
      const x = i * 24;
      blit(ctx, sprites.block, x, 40 - sprites.block.height - offsets[i]);
      blit(ctx, sprites.block, x + 12, 40 - sprites.block.height - ((offsets[i] + 3) % 6));
    }
  }, 0.5);

  const nearH = 108;
  const near = makeLayer(512, nearH, (ctx) => {
    const place = (sprite, x) => blit(ctx, sprite, x, nearH - sprite.height);
    place(sprites.lincoln, 14);
    place(sprites.block, 48);
    drawEiffel(ctx, 118, nearH, 92);
    place(sprites.castle, 186);
    place(sprites.house, 248);
    place(sprites.block, 310);
    place(sprites.capitol, 366);
    place(sprites.block, 430);
    ctx.fillStyle = "rgba(30, 48, 70, 0.22)";
    ctx.fillRect(0, nearH - 2, 512, 2);
  }, 0.22);

  const trees = makeLayer(288, 12, (ctx) => {
    for (let i = 0; i * 18 < 288; i += 1) {
      const sprite = i % 4 === 1 ? sprites.cherry : sprites.elm;
      blit(ctx, sprite, i * 18, 12 - sprite.height);
    }
    ctx.fillStyle = "#153d24";
    ctx.fillRect(0, 9, 288, 3);
  });

  const pennants = [
    makePennant(15, 11, ["#e2564a", "#f5d97a", "#4aa564"]),
    makePennant(14, 10, ["#e79ab8", "#f5d97a", "#4a8fd4"]),
    makePennant(16, 11, ["#e2564a", "#7ad0ff", "#ffe14a"]),
    makePennant(13, 9, ["#7b5cff", "#e79ab8", "#ffe14a"]),
  ];
  const flags = [
    { x: 88, height: 28, phase: 0.4, art: 1 },
    { x: 240, height: 30, phase: 0, art: 0 },
    { x: 356, height: 26, phase: 1.7, art: 2 },
    { x: 448, height: 24, phase: 2.4, art: 3 },
  ];

  let particles = [];
  let floats = [];

  function burst(x, y) {
    const colors = ["#e23a28", "#ffe14a", "#2ecf5a", "#3d6ce0", "#ff9a2a"];
    for (let i = 0; i < 18; i += 1) {
      const a = (i / 18) * Math.PI * 2 + Math.random() * 0.4;
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
    for (let i = 0; i < 12; i += 1) {
      const a = -Math.PI + (i / 12) * Math.PI;
      const sp = 30 + Math.random() * 46;
      particles.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp * 0.62,
        life: 0.4 + Math.random() * 0.4,
        age: 0,
        color: i % 2 ? "#4a7d3e" : "#cfc4a8",
        size: 1,
      });
    }
  }

  function spawnFloat(x, y, msg, col) {
    floats.push({ x, y, msg, col, t: 0 });
  }

  function parrotFrame(world, flapTimer) {
    if (flapTimer > 0) {
      const t = 1 - flapTimer / 0.26;
      if (t < 0.35) return sprites.parrotDown;
      if (t < 0.7) return sprites.parrotMid;
      return sprites.parrotUp;
    }
    return world.vy > 150 ? sprites.parrotUp : sprites.parrotMid;
  }

  function draw(ctx, { world, scrollX, time, flapTimer, best, newBest, reducedMotion }) {
    const w = PHYSICS.viewW;
    const groundY = PHYSICS.groundY;
    drawSky(ctx, w, groundY);
    drawClouds(ctx, w, time);
    tile(ctx, far, w, scrollX * 0.16, groundY - far.height);
    tile(ctx, near, w, scrollX * 0.42, groundY - near.height);
    const nearScroll = scrollX * 0.42;
    let fx = -(((nearScroll % 512) + 512) % 512);
    for (; fx < w; fx += 512) {
      for (const f of flags) {
        const x = Math.round(fx + f.x);
        if (x > -16 && x < w + 16) {
          drawFlag(ctx, pennants[f.art], x, groundY - f.height, f.height, time, f.phase);
        }
      }
    }
    tile(ctx, trees, w, scrollX * 0.78, groundY - trees.height + 1);

    for (const column of world.columns) {
      const x = Math.round(column.x);
      const gapBottom = column.gapY + column.gap;
      drawColumnShaft(ctx, x, 0, column.gapY - capBottom.height);
      blit(ctx, capBottom, x, column.gapY - capBottom.height);
      blit(ctx, sprites.columnCap, x, gapBottom);
      drawColumnShaft(
        ctx,
        x,
        gapBottom + sprites.columnCap.height,
        groundY - gapBottom - sprites.columnCap.height,
      );
    }

    drawGround(ctx, w, PHYSICS.viewH, groundY, scrollX);

    const bob =
      world.phase === "ready" && !reducedMotion ? Math.sin(time * 3) * 2.5 : 0;
    const bird = parrotFrame(world, flapTimer);
    const birdY = world.y + bob;
    blit(ctx, bird, PHYSICS.birdX, birdY);

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
      const ox = Math.max(2, Math.min(w - fw - 2, Math.round(f.x - fw / 2)));
      const oy = Math.round(f.y - e * 18);
      ctx.globalAlpha = Math.max(0, 1 - e * e);
      drawText(ctx, f.msg, ox + 1, oy + 1, "rgba(10, 20, 34, 0.55)");
      drawText(ctx, f.msg, ox, oy, f.col);
    }
    ctx.globalAlpha = 1;

    if (world.phase !== "ready") {
      const label = String(world.score);
      const sx = Math.round((w - textWidth(label, 3)) / 2);
      const sy = 14;
      drawText(ctx, label, sx + 1, sy + 1, "rgba(10, 20, 34, 0.55)", 3);
      drawText(ctx, label, sx, sy, "#ffffff", 3);
    }
    if (best > 0) {
      drawText(ctx, `BEST ${best}`, 5, 6, "rgba(10, 20, 34, 0.5)");
      drawText(ctx, `BEST ${best}`, 4, 5, "#ffe680");
    }

    if (world.phase === "ready") {
      overlayCard(ctx, w, PHYSICS.viewH, {
        title: "FLAPPY PARROT",
        lines: ["KEEP THE BIRD IN THE AIR", "WHILE FLYING THROUGH THE COLUMNS"],
        prompt: "CLICK OR PRESS SPACE TO FLY",
      });
    } else if (world.phase === "dead") {
      const sub = newBest
        ? `NEW BEST ${world.score} - ${world.clears} CLEARED`
        : `${world.score} - ${world.clears} CLEARED`;
      overlayBar(ctx, w, "GROUNDED", sub);
    }
  }

  return {
    draw,
    burst,
    splat,
    spawnFloat,
    updateParticles(dt) {
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
    },
  };
}
