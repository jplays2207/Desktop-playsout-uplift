import { describeGameError, gameDebug } from './debug.js?v=20260911-debug';

const SCORE_ENDPOINT = 'https://api.playsout.com/playsout/game/result';
const CLIENT_VERSION = '1.0.0';
const SHARED_KEY_BYTES = new Uint8Array([
  181, 158, 190, 134, 99, 62, 230, 125, 36, 59, 72, 247, 146, 53, 181, 194, 221, 198, 117, 85, 57,
  43, 243, 41, 219, 217, 168, 141, 63, 214, 48, 188,
]);

let importedKeyPromise = null;

export class ScoreUploadError extends Error {
  constructor(message, { code = 'SCORE_UPLOAD_FAILED', httpStatus = null } = {}) {
    super(message);
    this.name = 'ScoreUploadError';
    this.code = code;
    this.httpStatus = httpStatus;
  }

  get isAuthenticationError() {
    return this.httpStatus === 401 || this.httpStatus === 403;
  }
}

function assertPositiveInteger(value, name) {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new ScoreUploadError(`${name} must be a positive integer.`, {
      code: `INVALID_${name.toUpperCase()}`,
    });
  }
}

function assertScore(value) {
  if (!Number.isSafeInteger(value) || value < 0 || value > 10000) {
    throw new ScoreUploadError('Score must be an integer from 0 to 10000.', {
      code: 'SCORE_OUT_OF_RANGE',
    });
  }
}

function createUuid() {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (item) => item.toString(16).padStart(2, '0'));
  return [
    hex.slice(0, 4).join(''),
    hex.slice(4, 6).join(''),
    hex.slice(6, 8).join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10, 16).join(''),
  ].join('-');
}

function bytesToBase64(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function getEncryptionKey() {
  if (!globalThis.crypto?.subtle) {
    throw new ScoreUploadError('Web Crypto is unavailable in this browser.', {
      code: 'WEB_CRYPTO_UNAVAILABLE',
    });
  }

  importedKeyPromise ??= globalThis.crypto.subtle.importKey(
    'raw',
    SHARED_KEY_BYTES,
    { name: 'AES-GCM' },
    false,
    ['encrypt'],
  );
  return importedKeyPromise;
}

async function encryptScore({ userId, gameId, score }) {
  const key = await getEncryptionKey();
  const nonce = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const payload = {
    userId,
    gameId,
    submissionId: createUuid(),
    value: score,
    timestamp: Math.floor(Date.now() / 1000),
    clientVersion: CLIENT_VERSION,
  };
  const plaintext = new TextEncoder().encode(JSON.stringify(payload));
  const encrypted = await globalThis.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce, tagLength: 128 },
    key,
    plaintext,
  );

  return {
    nonce: bytesToBase64(nonce),
    ciphertext: bytesToBase64(new Uint8Array(encrypted)),
  };
}

async function readJsonResponse(response) {
  try {
    return await response.json();
  } catch {
    gameDebug('ScoreUpload', 'response.invalid-json', { httpStatus: response.status });
    throw new ScoreUploadError('The score service returned an invalid response.', {
      code: 'INVALID_SCORE_RESPONSE',
      httpStatus: response.status,
    });
  }
}

export async function uploadGameScore({ userId, gameId, score, accessToken, signal }) {
  gameDebug('ScoreUpload', 'validation.started', {
    gameId,
    hasAccessToken: typeof accessToken === 'string' && accessToken.length > 0,
    hasUserId: Number.isSafeInteger(userId) && userId > 0,
    score,
    webCryptoAvailable: Boolean(globalThis.crypto?.subtle),
  });
  assertPositiveInteger(userId, 'userId');
  assertPositiveInteger(gameId, 'gameId');
  if (gameId > 5) {
    throw new ScoreUploadError('The game ID is not supported.', {
      code: 'UNSUPPORTED_GAME_ID',
    });
  }
  assertScore(score);
  if (typeof accessToken !== 'string' || accessToken.length === 0) {
    throw new ScoreUploadError('A valid access token is required.', {
      code: 'ACCESS_TOKEN_REQUIRED',
    });
  }

  let encryptedResult;
  try {
    encryptedResult = await encryptScore({ userId, gameId, score });
    gameDebug('ScoreUpload', 'encryption.succeeded', {
      ciphertextLength: encryptedResult.ciphertext.length,
      nonceLength: encryptedResult.nonce.length,
    });
  } catch (error) {
    gameDebug('ScoreUpload', 'encryption.failed', describeGameError(error));
    throw error;
  }

  let response;
  try {
    gameDebug('ScoreUpload', 'request.started', { gameId, method: 'POST' });
    response = await fetch(`${SCORE_ENDPOINT}?gameId=${encodeURIComponent(gameId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        token: accessToken,
      },
      body: JSON.stringify(encryptedResult),
      signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw error;
    gameDebug('ScoreUpload', 'request.failed-before-response', describeGameError(error));
    throw new ScoreUploadError('Unable to reach the score service.', {
      code: 'SCORE_NETWORK_ERROR',
    });
  }

  const result = await readJsonResponse(response);
  gameDebug('ScoreUpload', 'response.received', {
    applicationCode: typeof result?.code === 'number' ? result.code : null,
    hasData: Boolean(result?.data),
    httpStatus: response.status,
  });
  if (!response.ok || result?.code !== 10000 || !result.data) {
    gameDebug('ScoreUpload', 'response.rejected', {
      applicationCode: typeof result?.code === 'number' ? result.code : null,
      httpStatus: response.status,
    });
    throw new ScoreUploadError('The score service rejected this result.', {
      code:
        typeof result?.msg === 'string' && result.msg.length > 0
          ? result.msg
          : `HTTP_${response.status}`,
      httpStatus: response.status,
    });
  }

  return result.data;
}
