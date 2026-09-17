import { RULES } from "./world.js";
import {
  blit,
  blitRotated,
  drawText,
  drawTextCentered,
  padRows,
  spriteFromRows,
} from "./runtime.js";

function sprite(rows, palette) {
  return spriteFromRows(padRows(rows), palette);
}

function formatScore(n) {
  return Math.round(n).toLocaleString("en-US");
}

const SPRITES = {
  ball: sprite([
    "......kk......",
    "....kkoook....",
    "...kooooook...",
    "..koooooookk..",
    ".koowooooook.",
    ".kooooooooook.",
    "koooooooooook",
    "koooooooooook",
    ".kooooooooook.",
    ".kkoooooookk.",
    "..kkkkkkkkkk..",
    "....kkkkkk....",
  ], { k: "#8a2a1c", o: "#e2564a", w: "#f7d0c8" }),
  teddy: sprite([
    "..nn....nn..",
    ".nssn..nssn.",
    ".nsssnsssn.",
    "nnssssssssnn",
    "nsswwsswwns",
    "nssskkssssn",
    ".nssssssssn.",
    ".nnssssssnn.",
    "..nnnssnnn..",
    "...n.nn.n...",
  ], { n: "#6b4a2a", s: "#c48a4a", w: "#f4f7fb", k: "#1e2430" }),
  car: sprite([
    "....bbbbbb....",
    "...bwwwwwwb...",
    "..bwwyyyywwb..",
    ".bbbbbbbbbbbb.",
    "bboooooooooobb",
    "bboooooooooobb",
    ".kk.bbbbbb.kk.",
    "..k........k..",
  ], { b: "#3a6aa8", w: "#d8e8f8", y: "#f5d97a", o: "#e2564a", k: "#1e2430" }),
  robot: sprite([
    ".kkkkkkkk.",
    "kgwwwwwwgk",
    "kgwyyyywgk",
    "kgwwwwwwgk",
    "kggggggggk",
    ".kkkkkkkk.",
    ".k.k..k.k.",
    "kk.k..k.kk",
  ], { k: "#2a3038", g: "#7a8490", w: "#e8edf5", y: "#7fe08a" }),
  plane: sprite([
    "...........w..",
    "..........ww..",
    "........wwwwk.",
    "wwwwwwwwwwwwk",
    ".wwwwwwwwwwk.",
    "..k....kk.....",
    "..............",
    "..............",
  ], { w: "#f4f7fb", k: "#3a3f4a" }),
  board: sprite([
    "..............",
    "..yyyyyyyyyy..",
    ".yoooooooooy.",
    "yoooooooooooy",
    ".k..yyyyyy..k.",
    "..k........k..",
    "..............",
    "..............",
  ], { y: "#f2a24a", o: "#4a8fd4", k: "#1e2430" }),
  balloon: sprite([
    "...rrrrr....",
    "..rrwrrrr...",
    ".rrrrrrrrr..",
    ".rrrrrrrrr..",
    "..rrrrrrr...",
    "...rrkrr....",
    ".....k......",
    ".....k......",
  ], { r: "#e2564a", w: "#f7d0c8", k: "#5c4030" }),
  rc: sprite([
    "...................",
    "....bbbbbbbbb......",
    "...bwwwwwwwwb......",
    "..bwwyyyyywwb.kk...",
    ".bbbbbbbbbbbbk..k..",
    "kk...............k.",
    "...................",
    "...................",
  ], { b: "#3a6aa8", w: "#e8edf5", y: "#f5d97a", k: "#1e2430" }),
  chest: sprite([
    "..nnnnnnnnnn..",
    ".nyyyyyyyyyn.",
    "nyooooooooyyn",
    "nyyyyyyyyyyyn",
    "nnnnnnnnnnnnnn",
    "nxxxxxxxxxxn",
    "nxxxxxxxxxxn",
    ".nnnnnnnnnn.",
  ], { n: "#6b4a2a", y: "#f5d97a", o: "#c48a4a", x: "#8a5a2a" }),
  net: sprite([
    "...kkkkkkkkk...............",
    ".kk.mmmmmmm.kk.............",
    "k..mmmmmmmmm..k............",
    "k...mmmmmmm...k............",
    ".kk.........kkk............",
    "..kkkkkkkkkkk.nn...........",
    "..k.wwwwwww.k..nn..........",
    "..kw.w.w.w.wk...nn.........",
    "..k.w.w.w.w.k....nn........",
    "...kw.w.w.wk......nn.......",
    "...k.w.w.w.k.......nn......",
    "....kw.w.wk.........ooo....",
    "....k.w.w.k..........ooo...",
    ".....kw.wk............ooo..",
    ".....k.w.k.............ooo.",
    "......kwk...............ooo",
    "......kkk...............kkk",
  ], { k: "#243642", m: "#4d7286", w: "#eef5fa", n: "#8a6a3a", o: "#c08b3f" }),
  kidA: sprite([
    ".ss.",
    "swws",
    ".ss.",
    ".bb.",
    "b..b",
    ".nn.",
  ], { s: "#f0d9a8", w: "#1e2430", b: "#4a8fd4", n: "#3a3f4a" }),
  kidB: sprite([
    ".pp.",
    "pssp",
    ".ss.",
    ".yy.",
    "y..y",
    ".nn.",
  ], { p: "#e79ab8", s: "#c48a4a", y: "#f2a24a", n: "#3a3f4a" }),
  kite: sprite([
    "..r..",
    ".ror.",
    "rwror",
    ".rbr.",
    "..r..",
  ], { r: "#e2564a", o: "#f2a24a", w: "#f4f7fb", b: "#4a8fd4" }),
  bird: sprite([
    ".k.k.",
    "kmkmk",
    ".kkk.",
  ], { k: "#1e2430", m: "#6b7280" }),
  bus: sprite([
    "....yyyyyyyyyy...",
    "...ywwywwywwyy...",
    "..yyyyyyyyyyyyy..",
    ".yyyyyyyyyyyyyyy.",
    "yykk.yyyyyyy.kkyy",
    "..k.........k....",
  ], { y: "#f5d97a", w: "#4a8fd4", k: "#1e2430" }),
};

const ITEM_SPRITE = {
  ball: "ball",
  teddy: "teddy",
  car: "car",
  robot: "robot",
};

const BONUS_SPRITE = {
  plane: "plane",
  board: "board",
  balloon: "balloon",
  rc: "rc",
  chest: "chest",
};

const CLOUDS = [
  { x: 10, y: 26, speed: 6.5, scale: 1.3, alpha: 0.5 },
  { x: 96, y: 16, speed: 4.2, scale: 1, alpha: 0.42 },
  { x: 170, y: 38, speed: 8, scale: 0.8, alpha: 0.34 },
  { x: 220, y: 22, speed: 3.4, scale: 1.5, alpha: 0.3 },
];

function drawClouds(ctx, time) {
  for (let i = 0; i < CLOUDS.length; i += 1) {
    const c = CLOUDS[i];
    const x = ((c.x + time * c.speed) % (RULES.width + 80)) - 40;
    const y = c.y + Math.sin(time * 0.35 + i * 1.7) * 0.9;
    ctx.fillStyle = `rgba(255, 244, 232, ${c.alpha})`;
    ctx.fillRect(Math.round(x + 4), Math.round(y), Math.round(18 * c.scale), Math.round(6 * c.scale));
    ctx.fillRect(Math.round(x), Math.round(y + 3), Math.round(12 * c.scale), Math.round(4 * c.scale));
    ctx.fillRect(Math.round(x + 14), Math.round(y + 2), Math.round(10 * c.scale), Math.round(4 * c.scale));
  }
}

function drawSchool(ctx, ground) {
  const x = 8;
  const h = 42;
  const y = ground - h;
  ctx.fillStyle = "#d8cfc2";
  ctx.fillRect(x, y, 86, h);
  ctx.fillStyle = "#c8a24a";
  ctx.fillRect(x - 2, y - 6, 90, 8);
  ctx.fillStyle = "#8a6a3a";
  ctx.fillRect(x + 36, y + 18, 12, h - 18);
  ctx.fillStyle = "#4a8fd4";
  for (let col = 0; col < 4; col += 1) {
    for (let row = 0; row < 2; row += 1) {
      ctx.fillRect(x + 8 + col * 18, y + 8 + row * 12, 8, 8);
    }
  }
  ctx.fillStyle = "#f5d97a";
  ctx.fillRect(x + 40, y + 28, 2, 2);
}

function drawTower(ctx, ground) {
  const x = 128;
  const top = 48;
  ctx.fillStyle = "#9aa3b4";
  ctx.fillRect(x + 3, top, 4, ground - top);
  ctx.fillStyle = "#c9cfdb";
  ctx.fillRect(x + 4, top, 2, ground - top);
  for (let y = top + 6; y < ground - 4; y += 8) {
    ctx.fillStyle = "#7b8496";
    ctx.fillRect(x, y, 10, 1);
    ctx.fillRect(x + 1, y + 4, 8, 1);
  }
  ctx.fillStyle = "#e6eaf2";
  ctx.fillRect(x + 1, top - 8, 8, 8);
  ctx.fillStyle = "#c9a227";
  ctx.fillRect(x + 4, top - 12, 2, 4);
}

function drawFlags(ctx, ground, time) {
  const poles = [22, 66, 186, 214, 240];
  const colors = ["#e2564a", "#f5d97a", "#4a8fd4", "#4aa564", "#e79ab8"];
  poles.forEach((x, i) => {
    ctx.fillStyle = "#d8dde6";
    ctx.fillRect(x, ground - 36, 1, 36);
    ctx.fillStyle = "#f2c744";
    ctx.fillRect(x, ground - 37, 1, 1);
    const wave = Math.sin(time * 5 + i) * 1.4;
    ctx.fillStyle = colors[i];
    ctx.fillRect(x + 1, ground - 34 + Math.round(wave), 14, 8);
    ctx.fillStyle = colors[(i + 2) % colors.length];
    ctx.fillRect(x + 1, ground - 30 + Math.round(wave), 10, 3);
  });
  for (let i = 0; i < 8; i += 1) {
    const x = 96 + i * 7;
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(x, ground - 50 + Math.round(Math.sin(time * 3 + i) * 2), 6, 4);
  }
  ctx.fillStyle = "#9aa3b4";
  ctx.fillRect(96, ground - 54, 56, 1);
}

function drawGrass(ctx, ground) {
  let y = ground;
  let band = 2;
  let light = true;
  while (y < RULES.height) {
    ctx.fillStyle = light ? "#2f8f45" : "#226b34";
    ctx.fillRect(0, y, RULES.width, Math.min(band, RULES.height - y));
    y += band;
    band = Math.min(band + 1, 9);
    light = !light;
  }
  ctx.fillStyle = "rgba(16, 56, 28, 0.55)";
  ctx.fillRect(0, ground, RULES.width, 1);
  for (let x = -4; x < RULES.width; x += 21) {
    ctx.fillStyle = "#49b45f";
    ctx.fillRect(x + 4, ground - 3, 1, 3);
    ctx.fillRect(x + 6, ground - 5, 1, 5);
    ctx.fillRect(x + 8, ground - 3, 1, 3);
  }
}

function drawSandbox(ctx, ground) {
  const x = 80;
  const y = ground + 7;
  const w = 96;
  const h = 14;
  ctx.fillStyle = "#c4a574";
  ctx.fillRect(x - 2, y - 1, w + 4, h + 3);
  ctx.fillStyle = "#e6d2a8";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#d4bc8a";
  for (let i = 0; i < 18; i += 1) {
    ctx.fillRect(x + (i * 17) % (w - 2), y + (i * 5) % (h - 2), 2, 1);
  }
  const tiles = [
    [x + 12, y + 8, 8, 5],
    [x + 22, y + 2, 8, 5],
    [x + 32, y + 8, 8, 5],
    [x + 42, y + 2, 8, 5],
    [x + 52, y + 8, 8, 5],
    [x + 62, y + 2, 10, 10],
  ];
  ctx.fillStyle = "#f4eee0";
  for (const [tx, ty, tw, th] of tiles) ctx.fillRect(tx, ty, tw, th);
  ctx.fillStyle = "#c9a227";
  tiles.forEach((tile, i) => {
    ctx.fillRect(tile[0], tile[1], tile[2], 1);
    ctx.fillRect(tile[0], tile[1], 1, tile[3]);
  });
}

function drawKite(ctx, time, ground, reduced) {
  const bob = reduced ? 0 : Math.sin(time * 0.75) * 7;
  const x = 206 + bob;
  const y = 50 + (reduced ? 0 : Math.cos(time * 0.97) * 3);
  ctx.strokeStyle = "rgba(240, 240, 245, 0.35)";
  ctx.beginPath();
  ctx.moveTo(Math.round(x) + 2, Math.round(y) + 5);
  ctx.quadraticCurveTo(Math.round(x - bob * 0.6), Math.round(y + 28), 202, ground - 2);
  ctx.stroke();
  blit(ctx, SPRITES.kite, x, y);
}

function drawBirds(ctx, time, reduced) {
  const cycle = time % 38;
  if (!reduced && cycle > 13) return;
  const x = reduced ? 40 : -30 + (cycle / 13) * (RULES.width + 60);
  const y = 24;
  const flock = [[0, 0], [-8, 4], [-16, 8], [8, 4], [16, 8]];
  for (const [dx, dy] of flock) blit(ctx, SPRITES.bird, x + dx, y + dy);
}

function drawKids(ctx, ground, time, reduced) {
  for (let i = 0; i < 6; i += 1) {
    const x = 8 + (i * 53) % (RULES.width - 16);
    const y = ground + 3 + (reduced ? 0 : i % 2);
    blit(ctx, i % 2 ? SPRITES.kidA : SPRITES.kidB, x, y, i % 3 === 0);
  }
}

function drawBus(ctx, ground, time, reduced) {
  if (reduced) return;
  const cycle = time % 52;
  if (cycle > 9) return;
  const x = -40 + (cycle / 9) * (RULES.width + 80);
  blit(ctx, SPRITES.bus, x, ground - 9);
}

function drawSky(ctx) {
  const sky = ctx.createLinearGradient(0, 0, 0, RULES.ground);
  sky.addColorStop(0, "#4a6fa0");
  sky.addColorStop(0.55, "#c48aa8");
  sky.addColorStop(1, "#e8a070");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, RULES.width, RULES.ground);
  const sunX = 206;
  const sunY = RULES.ground - 26;
  const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 46);
  glow.addColorStop(0, "rgba(255, 214, 150, 0.55)");
  glow.addColorStop(1, "rgba(255, 214, 150, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(sunX - 46, sunY - 46, 92, 92);
  ctx.fillStyle = "#ffe6b0";
  ctx.beginPath();
  ctx.arc(sunX, sunY, 7, 0, Math.PI * 2);
  ctx.fill();
}

function drawShadow(ctx, item) {
  const foot = item.y + item.h;
  const t = Math.min(1, Math.max(0, (RULES.ground - foot) / (RULES.ground - RULES.ceiling)));
  const w = Math.max(3, Math.round(item.w * (1 - 0.5 * t)));
  const a = 0.34 * (1 - 0.72 * t);
  const x = Math.round(item.x + item.w / 2);
  ctx.fillStyle = `rgba(14, 40, 22, ${a.toFixed(3)})`;
  ctx.fillRect(x - Math.floor(w / 2) + 1, RULES.ground + 1, w - 2, 1);
  ctx.fillRect(x - Math.floor(w / 2), RULES.ground + 2, w, 1);
}

function drawSparkle(ctx, item, time) {
  const cx = item.x + item.w / 2;
  const cy = item.y + item.h / 2;
  const r = Math.max(item.w, item.h) / 2 + 3;
  for (let i = 0; i < 4; i += 1) {
    const ang = time * 2.2 + (item.phaseT ?? 0) + i * (Math.PI / 2);
    const pulse = Math.sin(time * 11 + (item.phaseT ?? 0) + i * 1.9);
    if (pulse < 0.15) continue;
    const x = Math.round(cx + Math.cos(ang) * r);
    const y = Math.round(cy + Math.sin(ang) * r * 0.72);
    ctx.fillStyle = pulse > 0.75 ? "#ffffff" : "#ffe680";
    ctx.fillRect(x, y, 1, 1);
  }
}

function drawCard(ctx, title, lines, prompt, best) {
  ctx.fillStyle = "rgba(8, 12, 20, 0.72)";
  ctx.fillRect(0, 0, RULES.width, RULES.height);
  const width = Math.min(RULES.width - 8, 220);
  const height = 28 + lines.length * 12 + 22;
  const x = Math.round((RULES.width - width) / 2);
  const y = Math.round((RULES.height - height) / 2);
  ctx.fillStyle = "#0b1020";
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = "#18233f";
  ctx.fillRect(x + 1, y + 1, width - 2, height - 2);
  ctx.fillStyle = "#0d1326";
  ctx.fillRect(x + 3, y + 3, width - 6, height - 6);
  let ty = y + 10;
  drawTextCentered(ctx, title, RULES.width / 2, ty, "#ffe680", 2);
  ty += 18;
  for (const line of lines) {
    drawTextCentered(ctx, line, RULES.width / 2, ty, "#9fb4c8");
    ty += 12;
  }
  drawTextCentered(ctx, prompt, RULES.width / 2, ty, "#ffe680");
  if (best) {
    ty += 12;
    drawTextCentered(ctx, best, RULES.width / 2, ty, "#c9a227");
  }
}

function drawBanner(ctx, title, subtitle) {
  ctx.fillStyle = "rgba(8, 12, 20, 0.82)";
  ctx.fillRect(0, 78, RULES.width, 54);
  drawTextCentered(ctx, title, RULES.width / 2, 86, "#ffe680", 2);
  drawTextCentered(ctx, subtitle, RULES.width / 2, 108, "#e8edf5");
}

function drawHud(ctx, world, displayed, best) {
  ctx.fillStyle = "rgba(8, 12, 20, 0.62)";
  ctx.fillRect(0, 0, RULES.width, 16);
  drawText(ctx, `R${world.round}`, 4, 4, "#9fb4d0");
  drawText(ctx, `${formatScore(displayed)} RECYCLED`, 22, 4, "#7fe08a");
  if (best > 0) drawText(ctx, `BEST ${formatScore(best)}`, 22, 13, "#c9a227");
  for (let i = 0; i < RULES.maxMisses; i += 1) {
    const x = 150 + i * 10;
    ctx.fillStyle = i < world.misses ? "#e2564a" : "rgba(160, 180, 200, 0.30)";
    for (let o = 0; o < 5; o += 1) {
      ctx.fillRect(x + o, 5 + o, 1, 1);
      ctx.fillRect(x + 4 - o, 5 + o, 1, 1);
    }
  }
  for (let i = 0; i < world.grabs; i += 1) {
    const x = RULES.width - 12 - i * 8;
    ctx.fillStyle = "#eaf2f7";
    ctx.fillRect(x + 1, 4, 4, 1);
    ctx.fillRect(x + 1, 10, 4, 1);
    ctx.fillRect(x, 5, 1, 5);
    ctx.fillRect(x + 5, 5, 1, 5);
    ctx.fillStyle = "#7fa8c0";
    ctx.fillRect(x + 2, 6, 2, 3);
  }
  const y = RULES.height - 7;
  for (let i = 0; i < RULES.targetsPerRound; i += 1) {
    const done = i < world.targetIndex;
    const hit = i < world.hitsThisRound;
    ctx.fillStyle = hit ? "#7fe08a" : done ? "#7a1f1f" : "rgba(0,0,0,0.35)";
    ctx.fillRect(6 + i * 8, y, 5, 4);
  }
}

export function createArt() {
  let particles = [];
  let floats = [];

  function burst(x, y, color = "#f5d97a", power = 1) {
    const n = Math.round(14 * power);
    for (let i = 0; i < n; i += 1) {
      const ang = (i / n) * Math.PI * 2 + Math.random() * 0.4;
      const spd = 26 + Math.random() * 54 * power;
      particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 22,
        life: 0.5 + Math.random() * 0.45,
        age: 0,
        color,
        size: Math.random() < 0.28 ? 2 : 1,
      });
    }
  }

  function splat(x, y, color = "#4aa564") {
    for (let i = 0; i < 12; i += 1) {
      const ang = -Math.PI + (i / 12) * Math.PI;
      const spd = 30 + Math.random() * 46;
      particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd * 0.62,
        life: 0.4 + Math.random() * 0.4,
        age: 0,
        color,
        size: 1,
      });
    }
  }

  function spawnFloat(x, y, msg, color = "#ffe680") {
    floats.push({ x, y, msg, color, t: 0 });
  }

  function draw(ctx, { world, time, best, displayed, cover, newBest, reducedMotion, swingPulse }) {
    drawSky(ctx);
    if (!reducedMotion) drawClouds(ctx, time);
    else drawClouds(ctx, 0);
    drawTower(ctx, RULES.ground);
    drawSchool(ctx, RULES.ground);
    drawFlags(ctx, RULES.ground, reducedMotion ? 0 : time);
    drawGrass(ctx, RULES.ground);
    drawSandbox(ctx, RULES.ground);
    drawKite(ctx, time, RULES.ground, reducedMotion);
    drawBirds(ctx, time, reducedMotion);
    drawKids(ctx, RULES.ground, time, reducedMotion);
    drawBus(ctx, RULES.ground, time, reducedMotion);

    const target = world.target;
    if (target && target.phase === "flying") {
      drawShadow(ctx, target);
      const bob = Math.sin(target.bobT * 6) * 1.2;
      blitRotated(
        ctx,
        SPRITES[ITEM_SPRITE[target.type]],
        target.x,
        target.y + bob,
        target.rot ?? 0,
        target.vx < 0,
      );
    }

    for (const bonus of world.bonuses) {
      const sprite = SPRITES[BONUS_SPRITE[bonus.kind]];
      if (!sprite) continue;
      blitRotated(ctx, sprite, bonus.x, bonus.y, bonus.rot ?? 0, bonus.vx < 0);
      drawSparkle(ctx, bonus, time);
    }

    for (const p of particles) {
      const t = p.age / p.life;
      ctx.globalAlpha = t < 0.66 ? 1 : Math.max(0, 1 - (t - 0.66) / 0.34);
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
    }
    ctx.globalAlpha = 1;

    for (const f of floats) {
      ctx.globalAlpha = Math.max(0, 1 - f.t / 1.1);
      drawTextCentered(ctx, f.msg, f.x + 8, f.y - 10 - f.t * 14, f.color);
    }
    ctx.globalAlpha = 1;

    if (cover) {
      drawCard(
        ctx,
        "RECYCLE TYCOON",
        ["CATCH THE TOYS", "ON THE SCHOOL YARD", "CLICK TO SWING THE NET", "THREE MISSES ENDS THE RUN"],
        "CLICK TO START",
        best > 0 ? `BEST ${formatScore(best)}` : undefined,
      );
    } else if (world.phase === "roundOver") {
      if (world.cleanRound) {
        drawBanner(
          ctx,
          `PERFECT ROUND ${world.round - 1}`,
          `+${formatScore(world.cleanRound)} BONUS - CLICK TO CONTINUE`,
        );
      } else {
        drawBanner(ctx, `ROUND ${world.round - 1} CLEAR`, "CLICK OR SPACE TO CONTINUE");
      }
      if (newBest) drawTextCentered(ctx, "NEW BEST", RULES.width / 2, 128, "#c9a227");
    } else if (world.phase === "gameOver") {
      drawBanner(
        ctx,
        "THREE MISSED",
        `${formatScore(world.saved)} RECYCLED - CLICK TO PLAY AGAIN`,
      );
      if (newBest) drawTextCentered(ctx, "NEW BEST", RULES.width / 2, 128, "#c9a227");
    }

    if (!cover) drawHud(ctx, world, displayed, best);

    const dip = swingPulse * swingPulse * 4;
    blit(ctx, SPRITES.net, world.aim.x - 7, world.aim.y - 3 + dip);
    if (swingPulse > 0.55) {
      const radius = (1 - swingPulse) * 26;
      ctx.strokeStyle = `rgba(200, 236, 255, ${((swingPulse - 0.55) * 1.6).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(Math.round(world.aim.x), Math.round(world.aim.y - dip), Math.max(1, radius), 0, Math.PI * 2);
      ctx.stroke();
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
      floats = floats.filter((f) => f.t < 1.1);
    },
    clearParticles() {
      particles = [];
      floats = [];
    },
  };
}
