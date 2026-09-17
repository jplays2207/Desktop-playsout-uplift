import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SCORE_KEY, readBest, writeBest, submitBest } from '../js/score.js';

const storage = () => {
  const data = new Map();
  return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, String(value)) };
};

test('rio rush best score persists only higher values', () => {
  const db = storage();
  assert.equal(SCORE_KEY, 'playhouse.rio-rush.best');
  assert.equal(readBest(db), 0);
  assert.equal(submitBest(db, 80), true);
  assert.equal(readBest(db), 80);
  assert.equal(submitBest(db, 40), false);
  assert.equal(readBest(db), 80);
});

test('rio rush storage failures are contained', () => {
  assert.equal(readBest({ getItem() { throw new Error('blocked'); } }), 0);
  assert.equal(writeBest({ setItem() { throw new Error('blocked'); } }, 1), false);
});
