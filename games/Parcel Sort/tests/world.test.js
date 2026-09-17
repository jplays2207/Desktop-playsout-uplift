import { test } from "node:test";
import assert from "node:assert/strict";
import {
  RULES,
  SHIFTS,
  CATALOG,
  viewSize,
  beltSpeed,
  comboMult,
  outboundGrade,
  rejectPercent,
  pullPos,
  createWorld,
  startPlaying,
  resetToIntro,
  grab,
  setClaw,
  nudgeClaw,
  updateWorld,
} from "../js/world.js";

test("rules match spec", () => {
  assert.equal(RULES.width, 320);
  assert.equal(RULES.height, 180);
  assert.equal(RULES.header, 12);
  assert.equal(RULES.beltTop, 84);
  assert.equal(RULES.beltBottom, 140);
  assert.equal(RULES.itemY0, 86);
  assert.equal(RULES.itemY1, 122);
  assert.equal(RULES.leftWall, 26);
  assert.equal(RULES.exitX, 278);
  assert.equal(RULES.rejectX, 44);
  assert.equal(RULES.rejectY, 150);
  assert.equal(RULES.robotX, 132);
  assert.equal(RULES.robotY, 10);
  assert.equal(RULES.hitRange, 13);
  assert.equal(RULES.sprite, 16);
  assert.equal(RULES.earlyX, 110);
  assert.equal(RULES.pullTime, 0.38);
  assert.equal(RULES.slamHit, 0.3);
  assert.equal(RULES.slamCrack, 0.58);
  assert.equal(RULES.slamEnd, 0.95);
  assert.equal(RULES.shiftDuration, 34);
  assert.equal(RULES.speedCap, 1.6);
  assert.equal(RULES.speedRamp, 0.12);
  assert.equal(RULES.maxOnBelt, 9);
  assert.equal(RULES.clawSpeed, 150);
  assert.deepEqual(viewSize(), { width: 320, height: 180 });
});

test("seven warehouse shifts with original numbers", () => {
  assert.equal(SHIFTS.length, 7);
  assert.deepEqual(
    SHIFTS.map((s) => s.name),
    ["RECEIVING", "INBOUND", "SCAN LINE", "LABELING", "PEAK HOUR", "OUTBOUND", "AUDIT"],
  );
  assert.deepEqual(
    SHIFTS.map((s) => s.speed),
    [26, 30, 34, 38, 43, 48, 54],
  );
  assert.deepEqual(
    SHIFTS.map((s) => s.every),
    [1.5, 1.3, 1.1, 0.95, 0.85, 0.75, 0.65],
  );
  assert.deepEqual(
    SHIFTS.map((s) => s.spread),
    [0.3, 0.45, 0.65, 0.8, 1, 1, 1],
  );
  assert.deepEqual(
    SHIFTS.map((s) => s.clean),
    [0.6, 0.6, 0.58, 0.55, 0.53, 0.5, 0.5],
  );
});

test("catalog has enough boxes, bags, and reject items", () => {
  const clean = CATALOG.filter((i) => i.clean);
  const junk = CATALOG.filter((i) => !i.clean);
  const boxes = clean.filter((i) => i.id.startsWith("box_"));
  const bags = clean.filter((i) => i.id.startsWith("bag_"));
  assert.equal(clean.length, 8);
  assert.equal(junk.length, 10);
  assert.ok(boxes.length >= 5);
  assert.ok(bags.length >= 2);
  assert.ok(clean.some((i) => i.id === "tube_kraft"));
  assert.deepEqual(
    CATALOG.filter((i) => i.unlock === 1 && i.clean).map((i) => i.id).sort(),
    ["bag_white", "box_brown", "tube_kraft"],
  );
  assert.deepEqual(
    CATALOG.filter((i) => i.unlock === 1 && !i.clean).map((i) => i.id).sort(),
    ["apple", "banana", "cat"],
  );
});

test("comboMult and outboundGrade thresholds", () => {
  assert.equal(comboMult(0), 1);
  assert.equal(comboMult(5), 1);
  assert.equal(comboMult(6), 2);
  assert.equal(comboMult(15), 3);
  assert.equal(comboMult(30), 4);
  assert.equal(outboundGrade(0), "BULK");
  assert.equal(outboundGrade(10), "DEFERRED");
  assert.equal(outboundGrade(18), "STANDARD");
  assert.equal(outboundGrade(26), "PRIORITY");
  assert.equal(outboundGrade(34), "EXPRESS");
});

test("createWorld starts intro", () => {
  const w = createWorld({ seed: 1 });
  assert.equal(w.phase, "intro");
  assert.equal(w.score, 0);
  assert.equal(w.suit, 0);
  assert.equal(w.items.length, 0);
  assert.equal(w.shiftIdx, 0);
  assert.equal(w.spawnIn, 0.6);
});

test("startPlaying from intro enters playing and clears belt", () => {
  const w = createWorld({ seed: 1 });
  w.items.push({ id: 1, kind: "apple", clean: false, x: 40, y: 100, rot: 0, pull: null });
  assert.equal(startPlaying(w), true);
  assert.equal(w.phase, "playing");
  assert.equal(w.items.length, 0);
  assert.equal(startPlaying(w), false);
});

test("beltSpeed ramps with runT then caps at 1.6x", () => {
  const w = createWorld({ seed: 1, intro: false });
  w.runT = 0;
  assert.equal(beltSpeed(w), 26);
  w.runT = 60;
  assert.equal(beltSpeed(w), 26 * (1 + 0.12));
  w.runT = 10000;
  assert.equal(beltSpeed(w), 26 * 1.6);
});

test("grabbing reject scores and starts pull", () => {
  const w = createWorld({ seed: 1, intro: false });
  w.items.push({ id: 1, kind: "apple", clean: false, x: 140, y: 100, rot: 0, pull: null });
  assert.equal(grab(w, 148, 108), true);
  assert.equal(w.score, 100);
  assert.equal(w.combo, 1);
  assert.ok(w.items[0].pull);
  assert.ok(w.events.some((e) => e.type === "pull"));
});

test("early reject on left third scores 150", () => {
  const w = createWorld({ seed: 1, intro: false });
  w.items.push({ id: 1, kind: "apple", clean: false, x: 80, y: 100, rot: 0, pull: null });
  grab(w, 88, 108);
  assert.equal(w.score, 150);
  assert.ok(w.events.some((e) => e.type === "early"));
});

test("grabbing a clean item subtracts 150 and nudges back", () => {
  const w = createWorld({ seed: 1, intro: false });
  w.score = 200;
  w.combo = 6;
  w.items.push({ id: 1, kind: "box_brown", clean: true, x: 140, y: 100, rot: 0, pull: null });
  grab(w, 148, 108);
  assert.equal(w.score, 50);
  assert.equal(w.combo, 0);
  assert.equal(w.items[0].x, 128);
  assert.equal(w.items[0].pull, null);
  assert.ok(w.events.some((e) => e.type === "wrong"));
});

test("clean item exiting the belt ships", () => {
  const w = createWorld({ seed: 1, intro: false });
  w.items.push({ id: 1, kind: "box_brown", clean: true, x: 283, y: 100, rot: 0, pull: null });
  updateWorld(w, 0.05);
  assert.equal(w.shipped, 1);
  assert.equal(w.score, 25);
  assert.equal(w.items.length, 0);
  assert.ok(w.events.some((e) => e.type === "ship"));
});

test("reject exiting starts slam and fifth hit is final", () => {
  const w = createWorld({ seed: 1, intro: false });
  w.suit = 4;
  w.items.push({ id: 1, kind: "apple", clean: false, x: 283, y: 100, rot: 0, pull: null });
  updateWorld(w, 0.05);
  assert.ok(w.slam);
  assert.equal(w.slam.final, true);
  assert.equal(w.combo, 0);
  updateWorld(w, 0.3);
  assert.equal(w.suit, 5);
  assert.ok(w.events.some((e) => e.type === "thud"));
  updateWorld(w, 0.28);
  assert.ok(w.events.some((e) => e.type === "impact"));
  updateWorld(w, 0.4);
  assert.equal(w.phase, "over");
  assert.ok(w.events.some((e) => e.type === "over"));
});

test("slam pauses the belt but grab still works", () => {
  const w = createWorld({ seed: 1, intro: false });
  w.slam = {
    t: 0,
    hitHim: false,
    cracked: false,
    item: CATALOG.find((i) => i.id === "apple"),
    fromX: 260,
    fromY: 100,
    final: false,
  };
  w.items.push({ id: 2, kind: "apple", clean: false, x: 140, y: 100, rot: 0, pull: null });
  const x = w.items[0].x;
  updateWorld(w, 0.1);
  assert.equal(w.items[0].x, x);
  assert.equal(grab(w, 148, 108), true);
  assert.ok(w.items[0].pull);
});

test("shift advances after 34s and last shift holds", () => {
  const w = createWorld({ seed: 1, intro: false });
  updateWorld(w, 34);
  assert.equal(w.shiftIdx, 1);
  assert.equal(SHIFTS[w.shiftIdx].name, "INBOUND");
  w.shiftIdx = 6;
  w.shiftT = 0;
  updateWorld(w, 40);
  assert.equal(w.shiftIdx, 6);
});

test("nudgeClaw stays on the belt band", () => {
  const w = createWorld({ seed: 1, intro: false });
  setClaw(w, 10, 90);
  nudgeClaw(w, 1, -1, -1);
  assert.ok(w.px >= 2);
  assert.ok(w.py >= RULES.beltTop);
  setClaw(w, 310, 130);
  nudgeClaw(w, 1, 1, 1);
  assert.ok(w.px <= 318);
  assert.ok(w.py <= RULES.beltBottom);
});

test("pullPos arcs toward the reject chute", () => {
  const item = {
    pull: { t: 0.19, x0: 120, y0: 100 },
  };
  const p = pullPos(item);
  assert.ok(p.x < 120);
  assert.ok(p.y < 100);
});

test("rejectPercent uses treated/seen", () => {
  const w = createWorld({ seed: 1, intro: false });
  w.seen = 10;
  w.treated = 4;
  assert.equal(rejectPercent(w), 40);
});

test("resetToIntro returns to intro", () => {
  const w = createWorld({ seed: 1, intro: false });
  w.score = 9;
  resetToIntro(w);
  assert.equal(w.phase, "intro");
  assert.equal(w.score, 0);
});
