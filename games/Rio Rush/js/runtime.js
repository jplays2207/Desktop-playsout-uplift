const FONT = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  C: ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  G: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.####'],
  H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  I: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '#####'],
  J: ['..###', '...#.', '...#.', '...#.', '...#.', '#..#.', '.##..'],
  K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
  N: ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  Q: ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
  X: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
  0: ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'],
  1: ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  2: ['.###.', '#...#', '....#', '..##.', '.#...', '#....', '#####'],
  3: ['####.', '....#', '....#', '.###.', '....#', '....#', '####.'],
  4: ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
  5: ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  6: ['..##.', '.#...', '#....', '####.', '#...#', '#...#', '.###.'],
  7: ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
  8: ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  9: ['.###.', '#...#', '#...#', '.####', '....#', '...#.', '.##..'],
  '-': ['.....', '.....', '.....', '#####', '.....', '.....', '.....'],
};

export function textWidth(text, scale = 1) {
  const s = String(text);
  if (s.length === 0) return 0;
  return (s.length * 6 - 1) * scale;
}

export function drawText(ctx, text, x, y, color, scale = 1) {
  ctx.fillStyle = color;
  let cx = Math.round(x);
  const cy = Math.round(y);
  for (const ch of String(text).toUpperCase()) {
    if (ch === ' ') {
      cx += 6 * scale;
      continue;
    }
    const glyph = FONT[ch];
    if (glyph) {
      for (let row = 0; row < 7; row += 1) {
        for (let col = 0; col < 5; col += 1) {
          if (glyph[row][col] === '#') {
            ctx.fillRect(cx + col * scale, cy + row * scale, scale, scale);
          }
        }
      }
    }
    cx += 6 * scale;
  }
  return cx;
}

export function drawTextCentered(ctx, text, cx, y, color, scale = 1) {
  drawText(ctx, text, Math.round(cx - textWidth(text, scale) / 2), y, color, scale);
}

export function spriteFromRows(rows, palette) {
  const height = rows.length;
  const width = height > 0 ? rows[0].length : 0;
  for (const row of rows) {
    if (row.length !== width) {
      throw new Error('sprite rows must be equal length');
    }
  }
  const image = document.createElement('canvas');
  image.width = Math.max(1, width);
  image.height = Math.max(1, height);
  const ctx = image.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const key = rows[y][x];
      if (key === '.' || key === ' ') continue;
      const color = palette[key];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  return { width, height, image };
}

export function blit(ctx, sprite, x, y, flip = false) {
  const px = Math.floor(x);
  const py = Math.floor(y);
  if (!flip) {
    ctx.drawImage(sprite.image, px, py);
    return;
  }
  ctx.save();
  ctx.translate(px + sprite.width, py);
  ctx.scale(-1, 1);
  ctx.drawImage(sprite.image, 0, 0);
  ctx.restore();
}

export function padRows(rows) {
  const width = rows.reduce((max, row) => Math.max(max, row.length), 0);
  return rows.map((row) => row.padEnd(width, '.'));
}

export function createDisplay(
  host,
  {
    width = 336,
    height = 376,
    background = '#0d1017',
    backgroundGradient = ['#1e3a5f', '#0d1017', '#4a202c'],
  } = {},
) {
  const buffer = document.createElement('canvas');
  buffer.width = width;
  buffer.height = height;
  const ctx = buffer.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const screen = document.createElement('canvas');
  screen.className = 'pixel-screen';
  const screenCtx = screen.getContext('2d');
  screenCtx.imageSmoothingEnabled = false;
  host.appendChild(screen);

  let scale = 1;
  let ox = 0;
  let oy = 0;

  function snapScale(raw) {
    if (raw < 1) return raw;
    const whole = Math.floor(raw);
    return raw - whole < 0.15 ? whole : raw;
  }

  function layout() {
    const box = host.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const pxW = Math.max(1, Math.floor(box.width * dpr));
    const pxH = Math.max(1, Math.floor(box.height * dpr));
    scale = snapScale(Math.min(pxW / width, pxH / height));
    screen.width = pxW;
    screen.height = pxH;
    screen.style.width = `${box.width}px`;
    screen.style.height = `${box.height}px`;
    ox = Math.max(0, Math.floor((pxW - width * scale) / 2));
    oy = Math.max(0, Math.floor((pxH - height * scale) / 2));
  }

  function present(shakeX = 0, shakeY = 0) {
    screenCtx.imageSmoothingEnabled = false;
    if (backgroundGradient?.length >= 2) {
      const gradient = screenCtx.createLinearGradient(0, 0, screen.width, 0);
      const last = backgroundGradient.length - 1;
      backgroundGradient.forEach((color, index) => {
        gradient.addColorStop(index / last, color);
      });
      screenCtx.fillStyle = gradient;
    } else {
      screenCtx.fillStyle = background;
    }
    screenCtx.fillRect(0, 0, screen.width, screen.height);
    screenCtx.drawImage(
      buffer,
      ox + Math.round(shakeX) * scale,
      oy + Math.round(shakeY) * scale,
      width * scale,
      height * scale,
    );
  }

  function toGame(clientX, clientY) {
    const box = screen.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const px = (clientX - box.left) * dpr;
    const py = (clientY - box.top) * dpr;
    return { x: (px - ox) / scale, y: (py - oy) / scale };
  }

  let resizeObserver = null;
  layout();
  if (typeof ResizeObserver === 'function') {
    resizeObserver = new ResizeObserver(layout);
    resizeObserver.observe(host);
  } else {
    window.addEventListener('resize', layout);
  }

  return {
    canvas: buffer,
    ctx,
    width,
    height,
    present,
    toGame,
    destroy() {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', layout);
      screen.remove();
    },
  };
}

export function startLoop({ update, render, fps = 60 }) {
  const step = 1 / fps;
  const stepMs = 1000 / fps;
  let last = performance.now();
  let acc = 0;
  let frame = 0;
  let running = true;
  let stopped = false;

  function tick(now) {
    if (!running) return;
    frame = requestAnimationFrame(tick);
    const dt = Math.min(Math.max(0, now - last), 250);
    last = now;
    acc += dt;
    while (acc >= stepMs) {
      update(step);
      acc -= stepMs;
    }
    render(acc / stepMs, dt / 1000);
  }

  frame = requestAnimationFrame(tick);
  return {
    pause() {
      if (!running || stopped) return;
      running = false;
      cancelAnimationFrame(frame);
    },
    resume() {
      if (running || stopped) return;
      running = true;
      last = performance.now();
      acc = 0;
      frame = requestAnimationFrame(tick);
    },
    stop() {
      if (stopped) return;
      stopped = true;
      running = false;
      cancelAnimationFrame(frame);
    },
  };
}

export function attachInput(host) {
  const clicks = [];

  function onDown(event) {
    if (event.button !== 0) return;
    event.preventDefault();
    clicks.push({ clientX: event.clientX, clientY: event.clientY });
  }

  function onContextMenu(event) {
    event.preventDefault();
  }

  host.addEventListener('pointerdown', onDown);
  host.addEventListener('contextmenu', onContextMenu);
  host.style.touchAction = 'none';

  return {
    takeClicks() {
      return clicks.splice(0, clicks.length);
    },
    dispose() {
      host.removeEventListener('pointerdown', onDown);
      host.removeEventListener('contextmenu', onContextMenu);
      clicks.length = 0;
    },
  };
}
