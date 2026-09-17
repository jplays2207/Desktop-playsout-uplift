import { test } from "node:test";
import assert from "node:assert/strict";
import {
  RULES,
  viewSize,
  boardOrigin,
  stepInterval,
  moveLerp,
  createWorld,
  startGame,
  queueTurn,
  updateWorld,
  tapDirection,
} from "../js/world.js";

test("rules match spec", () => {
  assert.equal(RULES.cols, 16);
  assert.equal(RULES.rows, 16);
  assert.equal(RULES.cell, 20);
  assert.equal(RULES.border, 5);
  assert.equal(RULES.header, 30);
  assert.equal(RULES.footer, 16);
  assert.equal(RULES.startLength, 1);
  assert.equal(RULES.growBy, 1);
  assert.equal(RULES.step0, 0.32);
  assert.equal(RULES.step40, 0.16);
  assert.equal(RULES.scoreRamp, 40);
  assert.equal(RULES.maxQueue, 2);
  assert.equal(RULES.restartDelay, 0.8);
  assert.deepEqual(viewSize(), { width: 336, height: 376 });
  const origin = boardOrigin();
  assert.equal(origin.gridX, 8);
  assert.equal(origin.gridY, 35);
});

test("createWorld starts ready facing right at (5,8)", () => {
  const w = createWorld({ seed: 1 });
  assert.equal(w.phase, "ready");
  assert.equal(w.score, 0);
  assert.equal(w.friends, 0);
  assert.equal(w.line.length, 1);
  assert.equal(w.line[0].x, 5);
  assert.equal(w.line[0].y, 8);
  assert.equal(w.line[0].role, "rio");
  assert.deepEqual(w.dir, { x: 1, y: 0 });
  assert.ok(w.friend);
  assert.notEqual(w.friend.x, 5);
  assert.ok(["boy", "girl"].includes(w.friend.gender));
});

test("startGame from ready enters playing", () => {
  const w = createWorld({ seed: 1 });
  assert.equal(startGame(w), true);
  assert.equal(w.phase, "playing");
  assert.equal(startGame(w), false);
});

test("step interval lerps across friends 0..40 then holds", () => {
  assert.equal(stepInterval(0), 0.32);
  assert.equal(stepInterval(40), 0.16);
  assert.equal(stepInterval(99), 0.16);
});

test("queueTurn from ready sets dir and starts", () => {
  const w = createWorld({ seed: 1 });
  assert.equal(queueTurn(w, 0, -1), true);
  assert.equal(w.phase, "playing");
  assert.deepEqual(w.dir, { x: 0, y: -1 });
});

test("cannot reverse into current or queued dir", () => {
  const w = createWorld({ seed: 1 });
  startGame(w);
  assert.equal(queueTurn(w, -1, 0), false);
  assert.equal(queueTurn(w, 0, -1), true);
  assert.equal(queueTurn(w, 0, 1), false);
});

test("cannot queue more than 2 turns or the same dir", () => {
  const w = createWorld({ seed: 1 });
  startGame(w);
  assert.equal(queueTurn(w, 0, -1), true);
  assert.equal(queueTurn(w, 1, 0), true);
  assert.equal(queueTurn(w, 0, 1), false);
  const w2 = createWorld({ seed: 1 });
  startGame(w2);
  assert.equal(queueTurn(w2, 1, 0), false);
});

test("walking into a wall dies", () => {
  const w = createWorld({ seed: 1 });
  w.phase = "playing";
  w.friend = { x: 0, y: 0, gender: "boy", shirt: "yellow", skin: "peach" };
  w.line = [{ x: 15, y: 8, px: 15, py: 8, role: "rio", gender: null, shirt: null, skin: null }];
  w.dir = { x: 1, y: 0 };
  w.queue = [];
  w.owed = [];
  w.acc = 0;
  updateWorld(w, RULES.step0);
  assert.equal(w.phase, "dead");
  assert.ok(w.events.some((e) => e.type === "bust" && e.cause === "wall"));
});

test("walking into body dies but tail is free when not growing", () => {
  const w = createWorld({ seed: 1 });
  w.phase = "playing";
  w.friend = { x: 0, y: 0, gender: "boy", shirt: "yellow", skin: "peach" };
  w.line = [
    { x: 5, y: 8, px: 5, py: 8, role: "rio", gender: null, shirt: null, skin: null },
    { x: 4, y: 8, px: 4, py: 8, role: "friend", gender: "girl", shirt: "pink", skin: "tan" },
  ];
  w.dir = { x: -1, y: 0 };
  w.queue = [];
  w.owed = [];
  w.acc = 0;
  updateWorld(w, RULES.step0);
  assert.equal(w.phase, "playing");
  assert.equal(w.line[0].x, 4);
  assert.equal(w.line.length, 2);
});

test("picking up a friend scores ramping points and grows on later steps", () => {
  const w = createWorld({ seed: 1 });
  w.phase = "playing";
  w.line = [{ x: 5, y: 8, px: 5, py: 8, role: "rio", gender: null, shirt: null, skin: null }];
  w.friend = { x: 6, y: 8, gender: "girl", shirt: "orange", skin: "pale" };
  w.dir = { x: 1, y: 0 };
  w.queue = [];
  w.owed = [];
  w.acc = 0;
  updateWorld(w, RULES.step0);
  assert.equal(w.friends, 1);
  assert.equal(w.score, 80);
  assert.equal(w.owed.length, 1);
  assert.ok(w.events.some((e) => e.type === "collar"));
  w.events.length = 0;
  updateWorld(w, stepInterval(w.friends));
  assert.equal(w.line.length, 2);
  assert.equal(w.line[1].role, "friend");
  assert.equal(w.line[1].gender, "girl");
});

test("second friend adds 90 for a total of 170", () => {
  const w = createWorld({ seed: 1 });
  w.phase = "playing";
  w.line = [{ x: 5, y: 8, px: 5, py: 8, role: "rio", gender: null, shirt: null, skin: null }];
  w.friend = { x: 6, y: 8, gender: "boy", shirt: "yellow", skin: "tan" };
  w.dir = { x: 1, y: 0 };
  w.queue = [];
  w.owed = [];
  w.friends = 1;
  w.score = 80;
  w.acc = 0;
  updateWorld(w, stepInterval(w.friends));
  assert.equal(w.friends, 2);
  assert.equal(w.score, 170);
});

test("tap near head is ignored; otherwise picks dominant axis", () => {
  const w = createWorld({ seed: 1 });
  startGame(w);
  const origin = boardOrigin();
  const cx = origin.gridX + 5 * RULES.cell + RULES.cell / 2;
  const cy = origin.gridY + 8 * RULES.cell + RULES.cell / 2;
  assert.equal(tapDirection(w, cx, cy), null);
  assert.deepEqual(tapDirection(w, cx + 20, cy), { x: 1, y: 0 });
  assert.deepEqual(tapDirection(w, cx, cy - 20), { x: 0, y: -1 });
  w.phase = "ready";
  assert.equal(tapDirection(w, cx + 20, cy), null);
});

test("moveLerp is 1 when not playing", () => {
  const w = createWorld({ seed: 1 });
  assert.equal(moveLerp(w), 1);
});
