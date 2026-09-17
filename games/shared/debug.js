const DEBUG_LOG_LIMIT = 200;
const DEBUG_STORAGE_KEY = '__playsOutDebugRecords';

function canUseDebug() {
  return (
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('debug') === '129299'
  );
}

function getRecords() {
  const existing = window[DEBUG_STORAGE_KEY];
  if (Array.isArray(existing)) return existing;

  const records = [];
  window[DEBUG_STORAGE_KEY] = records;
  return records;
}

function installDebugApi() {
  if (window.PlaysOutDebug) return;

  window.PlaysOutDebug = {
    getLogs() {
      return [...getRecords()];
    },
    async copyLogs() {
      const text = JSON.stringify(getRecords(), null, 2);
      await navigator.clipboard.writeText(text);
      return text;
    },
  };
}

export function isGameDebugEnabled() {
  return canUseDebug();
}

export function gameDebug(scope, event, details = {}) {
  if (!canUseDebug()) return;

  installDebugApi();
  const record = {
    at: new Date().toISOString(),
    scope,
    event,
    details,
  };
  const records = getRecords();
  records.push(record);
  if (records.length > DEBUG_LOG_LIMIT) records.splice(0, records.length - DEBUG_LOG_LIMIT);
  console.info(`[PlaysOut][${scope}] ${event}`, details);
}

export function describeGameError(error) {
  const candidate = error && typeof error === 'object' ? error : {};
  return {
    code: typeof candidate.code === 'string' ? candidate.code : null,
    httpStatus: Number.isInteger(candidate.httpStatus) ? candidate.httpStatus : null,
    name: error instanceof Error ? error.name : typeof error,
  };
}
