import { test } from "node:test";
import assert from "node:assert/strict";
import {
  RULES,
  ITEMS,
  BONUSES,
  viewSize,
  launchBase,
  flightLimit,
  createWorld,
  updateWorld,
  swing,
  continueRound,
  setAim,
  nudgeAim,
} from "../js/world.js";

function fly(world) {
  updateWorld(world, RULES.readyDelay);
}

function catchTarget(world) {
  const t = world.target;
  return swing(world, t.x + t.w / 2, t.y + t.h / 2);
}

function finishItem(world) {
  if (world.phase === "struck") updateWorld(world, RULES.struckDelay);
  if (world.phase === "escaped") updateWorld(world, RULES.escapedDelay);
}

test("rules match spec", () => {
  assert.equal(RULES.width, 256);
  assert.equal(RULES.height, 224);
  assert.equal(RULES.ground, 176);
  assert.equal(RULES.ceiling, 18);
  assert.equal(RULES.gravity, 78);
  assert.equal(RULES.lift, 104);
  assert.equal(RULES.grabs, 3);
  assert.equal(RULES.targetsPerRound, 10);
  assert.equal(RULES.maxMisses, 3);
  assert.equal(RULES.maxBonuses, 3);
  assert.equal(RULES.bonusPeriod, 3.6);
  assert.equal(RULES.readyDelay, 0.6);
  assert.equal(RULES.struckDelay, 0.45);
  assert.equal(RULES.escapedDelay, 0.7);
  assert.equal(RULES.perfectBonus, 50);
  assert.equal(RULES.launch0, 38);
  assert.equal(RULES.cursorSpeed, 150);
  assert.deepEqual(viewSize(), { width: 256, height: 224 });
  assert.equal(ITEMS.ball.value, 1);
  assert.equal(ITEMS.teddy.value, 5);
  assert.equal(ITEMS.car.value, 20);
  assert.equal(ITEMS.robot.value, 100);
  assert.equal(ITEMS.robot.noSpin, true);
  assert.equal(BONUSES.plane.value, 150);
  assert.equal(BONUSES.board.value, 200);
  assert.equal(BONUSES.balloon.value, 300);
  assert.equal(BONUSES.rc.value, 500);
  assert.equal(BONUSES.chest.value, 1000);
});

test("launchBase follows accelerating uncapped curve", () => {
  assert.equal(launchBase(1), 38);
  assert.equal(launchBase(2), 47);
  assert.equal(launchBase(3), 60);
  assert.equal(launchBase(5), 98);
  assert.equal(launchBase(7), 152);
  assert.equal(launchBase(10), 263);
});

test("flightLimit shrinks then floors at 2.2", () => {
  assert.equal(flightLimit(1), 8);
  assert.equal(flightLimit(2), 7.45);
  assert.equal(flightLimit(10), 3.05);
  assert.equal(flightLimit(20), 2.2);
});

test("createWorld starts ready on round 1", () => {
  const w = createWorld({ seed: 1 });
  assert.equal(w.phase, "ready");
  assert.equal(w.round, 1);
  assert.equal(w.saved, 0);
  assert.equal(w.misses, 0);
  assert.equal(w.targetIndex, 0);
  assert.equal(w.target, null);
  assert.deepEqual(w.aim, { x: 128, y: 112 });
});

test("ready delay spawns a flying target and resets grabs", () => {
  const w = createWorld({ seed: 1 });
  w.grabs = 0;
  fly(w);
  assert.equal(w.phase, "flying");
  assert.ok(w.target);
  assert.equal(w.target.phase, "flying");
  assert.equal(w.grabs, 3);
  assert.ok(["ball", "teddy", "car", "robot"].includes(w.target.type));
});

test("swing miss decrements grabs and does not score", () => {
  const w = createWorld({ seed: 1 });
  fly(w);
  const result = swing(w, w.target.x - 80, w.target.y - 80);
  assert.equal(result.result, "miss");
  assert.equal(w.grabs, 2);
  assert.equal(w.saved, 0);
  assert.equal(w.hitsThisRound, 0);
  assert.equal(w.phase, "flying");
});

test("swing hit scores and enters struck", () => {
  const w = createWorld({ seed: 1 });
  fly(w);
  const value = w.target.value;
  const result = catchTarget(w);
  assert.equal(result.result, "hit");
  assert.equal(result.value, value);
  assert.equal(w.saved, value);
  assert.equal(w.hitsThisRound, 1);
  assert.equal(w.phase, "struck");
  assert.equal(w.grabs, 2);
});

test("swing before flying is ignored", () => {
  const w = createWorld({ seed: 1 });
  const result = swing(w, 128, 100);
  assert.equal(result.result, "ignored");
  assert.equal(w.grabs, 3);
});

test("three escaped items end the run", () => {
  const w = createWorld({ seed: 7 });
  for (let i = 0; i < 3; i += 1) {
    fly(w);
    assert.equal(w.phase, "flying");
    updateWorld(w, flightLimit(w.round) + 0.05);
    assert.equal(w.phase, "escaped");
    assert.equal(w.misses, i + 1);
    updateWorld(w, RULES.escapedDelay);
  }
  assert.equal(w.phase, "gameOver");
  assert.equal(w.misses, 3);
});

test("ten hits award perfect bonus and go to roundOver", () => {
  const w = createWorld({ seed: 3 });
  let toyTotal = 0;
  for (let i = 0; i < 10; i += 1) {
    fly(w);
    toyTotal += w.target.value;
    const result = catchTarget(w);
    assert.equal(result.result, "hit");
    finishItem(w);
  }
  assert.equal(w.phase, "roundOver");
  assert.equal(w.round, 2);
  assert.equal(w.cleanRound, 50);
  assert.equal(w.saved, toyTotal + 50);
  assert.equal(w.targetIndex, 0);
  assert.equal(w.hitsThisRound, 0);
});

test("continueRound leaves roundOver into ready", () => {
  const w = createWorld({ seed: 3 });
  for (let i = 0; i < 10; i += 1) {
    fly(w);
    catchTarget(w);
    finishItem(w);
  }
  assert.equal(continueRound(w), true);
  assert.equal(w.phase, "ready");
  assert.equal(continueRound(w), false);
});

test("bonus catch scores without advancing targetIndex", () => {
  const w = createWorld({ seed: 11 });
  fly(w);
  w.bonuses.push({
    kind: "chest",
    motion: "streak",
    value: 1000,
    w: 14,
    h: 11,
    x: 80,
    y: 40,
    vx: 10,
    vy: 0,
    rot: 0,
    spin: 0,
    age: 0,
    life: 2.4,
    phaseT: 0,
  });
  const index = w.targetIndex;
  const result = swing(w, 87, 45);
  assert.equal(result.result, "bonus");
  assert.equal(result.value, 1000);
  assert.equal(w.saved, 1000);
  assert.equal(w.targetIndex, index);
  assert.equal(w.hitsThisRound, 0);
  assert.equal(w.phase, "flying");
  assert.equal(w.grabs, 2);
});

test("setAim and nudgeAim stay inside the view", () => {
  const w = createWorld({ seed: 1 });
  setAim(w, -10, 400);
  assert.equal(w.aim.x, 0);
  assert.equal(w.aim.y, 224);
  setAim(w, 10, 10);
  nudgeAim(w, 1, 1, 0);
  assert.equal(w.aim.x, 160);
  nudgeAim(w, 2, 1, 0);
  assert.equal(w.aim.x, 256);
});
