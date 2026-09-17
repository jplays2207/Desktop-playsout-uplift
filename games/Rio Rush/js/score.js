export const SCORE_KEY = 'playhouse.rio-rush.best';

export function readBest(storage) {
  try {
    const db = storage ?? globalThis.localStorage;
    const raw = db?.getItem(SCORE_KEY);
    if (raw == null) return 0;
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

export function writeBest(storage, value) {
  try {
    const db = storage ?? globalThis.localStorage;
    db.setItem(SCORE_KEY, String(value));
    return true;
  } catch {
    return false;
  }
}

export function submitBest(storage, value) {
  if (!Number.isFinite(value) || value <= readBest(storage)) return false;
  return writeBest(storage, value);
}
