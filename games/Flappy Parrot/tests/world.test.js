import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PHYSICS,
  createWorld,
  flap,
  updateWorld,
  birdHitbox,
  scrollSpeed,
  gapHeight,
} from "../js/world.js";

test("physics constants match spec", () => {
  assert.equal(PHYSICS.gravity, 640);
  assert.equal(PHYSICS.flapVy, -196);
  assert.equal(PHYSICS.maxFall, 268);
  assert.equal(PHYSICS.crashBounce, -70);
  assert.equal(PHYSICS.birdX, 66);
  assert.equal(PHYSICS.birdW, 22);
  assert.equal(PHYSICS.birdH, 20);
  assert.equal(PHYSICS.groundY, 194);
  assert.equal(PHYSICS.columnW, 22);
  assert.equal(PHYSICS.columnGap, 112);
  assert.deepEqual(PHYSICS.hitbox, { x: 5, y: 6, w: 12, h: 8 });
});

test("createWorld starts ready at y=82", () => {
  const w = createWorld({ seed: 1 });
  assert.equal(w.phase, "ready");
  assert.equal(w.y, 82);
  assert.equal(w.vy, 0);
  assert.equal(w.score, 0);
  assert.equal(w.clears, 0);
  assert.equal(w.columns.length, 0);
});

test("flap from ready enters playing with flap velocity", () => {
  const w = createWorld({ seed: 1 });
  assert.equal(flap(w), true);
  assert.equal(w.phase, "playing");
  assert.equal(w.vy, -196);
  assert.equal(w.events.some((e) => e.type === "flap"), true);
});

test("gravity applies after one 1/60s tick while playing", () => {
  const w = createWorld({ seed: 1 });
  flap(w);
  w.events.length = 0;
  const vy0 = w.vy;
  const y0 = w.y;
  updateWorld(w, 1 / 60, { width: 256, height: 224 });
  assert.ok(w.vy > vy0);
  assert.ok(w.y !== y0);
  assert.ok(w.vy <= 268);
});

test("scroll speed and gap lerp across clears 0..20 then hold", () => {
  assert.equal(scrollSpeed(0), 60);
  assert.equal(scrollSpeed(20), 94);
  assert.equal(scrollSpeed(99), 94);
  assert.equal(gapHeight(0), 72);
  assert.equal(gapHeight(20), 56);
  assert.equal(gapHeight(99), 56);
});

test("hitbox is inset from bird sprite", () => {
  const w = createWorld({ seed: 1 });
  w.y = 100;
  assert.deepEqual(birdHitbox(w), { x: 71, y: 106, w: 12, h: 8 });
});

test("flap is ignored while dead or falling", () => {
  const w = createWorld({ seed: 1 });
  w.phase = "dead";
  assert.equal(flap(w), false);
  w.phase = "falling";
  assert.equal(flap(w), false);
});

test("passing a column awards ramping points once", () => {
  const w = createWorld({ seed: 1 });
  w.phase = "playing";
  w.y = 80;
  w.vy = 0;
  w.columns = [{ x: 50, gap: 72, gapY: 50, passed: false }];
  updateWorld(w, 1 / 60, { width: 256, height: 224 });
  assert.equal(w.clears, 1);
  assert.equal(w.score, 80);
  assert.equal(w.columns[0].passed, true);
  updateWorld(w, 1 / 60, { width: 256, height: 224 });
  assert.equal(w.score, 80);
});

test("second clear adds 90 for a total of 170", () => {
  const w = createWorld({ seed: 1 });
  w.phase = "playing";
  w.y = 80;
  w.vy = 0;
  w.columns = [
    { x: 50, gap: 72, gapY: 50, passed: true },
    { x: 50, gap: 72, gapY: 50, passed: false },
  ];
  w.clears = 1;
  w.score = 80;
  updateWorld(w, 1 / 60, { width: 256, height: 224 });
  assert.equal(w.clears, 2);
  assert.equal(w.score, 170);
});

test("hitting ground while playing dies", () => {
  const w = createWorld({ seed: 1 });
  w.phase = "playing";
  w.y = 180;
  w.vy = 200;
  w.columns = [];
  updateWorld(w, 1 / 60, { width: 256, height: 224 });
  assert.equal(w.phase, "dead");
  assert.ok(w.events.some((e) => e.type === "crash"));
  assert.ok(w.events.some((e) => e.type === "land"));
});
