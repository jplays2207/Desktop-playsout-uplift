import { ScoreUploadError, uploadGameScore } from './score-upload.js?v=20260911-debug';
import { describeGameError, gameDebug, isGameDebugEnabled } from './debug.js?v=20260911-debug';

function isAuthenticated(result) {
  return (
    result?.status === 'authenticated' &&
    Number.isSafeInteger(result.userId) &&
    result.userId > 0 &&
    typeof result.accessToken === 'string' &&
    result.accessToken.length > 0
  );
}

function createRunId() {
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

export function assertGameMountOptions(options, { gameId, title }) {
  if (!(options?.container instanceof HTMLElement)) {
    throw new TypeError(`${title} mount requires an HTMLElement container.`);
  }
  if (options.gameId !== gameId) {
    throw new TypeError(`${title} requires gameId=${gameId}.`);
  }
  if (
    !options.auth ||
    options.auth.version !== '1.0' ||
    typeof options.auth.getAuthState !== 'function' ||
    typeof options.auth.getAccessToken !== 'function' ||
    typeof options.auth.requestLogin !== 'function' ||
    typeof options.auth.subscribe !== 'function'
  ) {
    throw new TypeError(`${title} mount requires PlaysOut Game Auth Bridge v1.0.`);
  }
}

export function createGameShell(container, { gameId, slug, title, hint }) {
  const gameNumber = String(gameId).padStart(2, '0');
  container.innerHTML = `
    <div class="playsout-game playsout-game--${slug}">
      <div class="playsout-game__ambient" aria-hidden="true">
        <div class="playsout-game__glow"></div>
        <div class="playsout-game__grid"></div>
        <div class="playsout-game__scanlines"></div>
      </div>
      <header class="playsout-game__nav">
        <button class="playsout-game__exit" data-exit-nav type="button">
          <span aria-hidden="true">←</span>
          <span>ARCADE</span>
        </button>
        <div class="playsout-game__title">
          <span class="playsout-game__kicker">PLAYSOUT / GAME ${gameNumber}</span>
          <strong>${title}</strong>
        </div>
        <span class="playsout-game__auth" data-auth-indicator>Guest mode</span>
      </header>
      <div class="playsout-game__viewport">
        <main class="playsout-game__stage" data-game-stage tabindex="-1" aria-label="${title} playfield"></main>
        <section class="playsout-score" data-score-choice hidden aria-live="polite">
          <div class="playsout-score__panel">
            <p class="playsout-score__eyebrow">RUN COMPLETE</p>
            <h1 class="playsout-score__title"><span data-final-score>0</span> POINTS</h1>
            <p class="playsout-score__copy">Join the activity with this score?</p>
            <p class="playsout-score__status" data-upload-status></p>
            <div class="playsout-score__actions">
              <button type="button" data-upload-score>JOIN WITH SCORE</button>
              <button type="button" data-play-again>PLAY AGAIN</button>
              <button type="button" data-exit-game>EXIT</button>
            </div>
          </div>
        </section>
      </div>
      <footer class="playsout-game__bar">
        <button class="playsout-game__sound" data-sound type="button" aria-pressed="true">
          <span aria-hidden="true">♪</span>
          <span class="toggle-text">Sound on</span>
        </button>
        <span class="playsout-game__hint">${hint}</span>
      </footer>
    </div>`;

  return {
    root: container.querySelector('.playsout-game'),
    stage: container.querySelector('[data-game-stage]'),
    soundButton: container.querySelector('[data-sound]'),
    scoreChoice: container.querySelector('[data-score-choice]'),
    finalScore: container.querySelector('[data-final-score]'),
    uploadStatus: container.querySelector('[data-upload-status]'),
    uploadButton: container.querySelector('[data-upload-score]'),
    playAgainButton: container.querySelector('[data-play-again]'),
    exitButton: container.querySelector('[data-exit-game]'),
    exitNavButton: container.querySelector('[data-exit-nav]'),
    authIndicator: container.querySelector('[data-auth-indicator]'),
  };
}

export function createScoreFlow({ gameId, auth, elements, onExit, onPlayAgain }) {
  const activityEnabled = auth.activityEnabled !== false;
  let authStatus = 'guest';
  let pendingResult = null;
  let panelOpen = false;
  let uploadInProgress = false;
  let uploadController = null;
  let destroyed = false;

  function setStatus(message, tone = '') {
    elements.uploadStatus.textContent = message;
    elements.uploadStatus.dataset.tone = tone;
  }

  function setActionsDisabled(disabled) {
    elements.uploadButton.disabled = disabled;
    elements.playAgainButton.disabled = disabled;
    elements.exitButton.disabled = disabled;
  }

  function renderAuthState(state) {
    authStatus = isAuthenticated(state) ? 'authenticated' : 'guest';
    elements.authIndicator.textContent =
      authStatus === 'authenticated' ? 'Signed in' : 'Guest mode';
    elements.authIndicator.dataset.auth = authStatus;
  }

  function resetPanel() {
    panelOpen = false;
    pendingResult = null;
    uploadController?.abort();
    uploadController = null;
    uploadInProgress = false;
    elements.scoreChoice.hidden = true;
    elements.uploadButton.textContent = 'JOIN WITH SCORE';
    setStatus('');
    setActionsDisabled(false);
  }

  function maybeAutoSubmit() {
    if (destroyed || authStatus !== 'authenticated' || pendingResult === null || uploadInProgress) {
      return;
    }
    gameDebug('ScoreFlow', 'auto-submit.started', { gameId, score: pendingResult.score });
    setStatus('Signed in — submitting this score automatically…');
    void processPendingResult({ allowLogin: false });
  }

  async function processPendingResult({ allowLogin }) {
    if (destroyed || uploadInProgress || pendingResult === null) return;
    const resultToSubmit = pendingResult;
    uploadInProgress = true;
    gameDebug('ScoreFlow', 'submission.started', {
      allowLogin,
      gameId,
      score: resultToSubmit.score,
    });
    setActionsDisabled(true);
    setStatus('Checking your PlaysOut session…');

    try {
      let tokenResult = await auth.getAccessToken({ minValiditySeconds: 300 });
      gameDebug('ScoreFlow', 'token.checked', {
        hasUserId: isAuthenticated(tokenResult),
        status: tokenResult.status,
      });

      if (tokenResult.status === 'guest') {
        renderAuthState(tokenResult);
        if (!allowLogin) {
          setStatus('Your session ended. Sign in to join with this score.', 'warning');
          return;
        }

        setStatus('Sign in with your wallet to continue.');
        gameDebug('ScoreFlow', 'login.requested', { gameId, reason: 'score_upload' });
        const loginResult = await auth.requestLogin({
          gameId,
          reason: 'score_upload',
        });

        if (destroyed) return;
        gameDebug('ScoreFlow', 'login.settled', {
          code: loginResult.status === 'failed' ? loginResult.code : null,
          status: loginResult.status,
        });
        if (loginResult.status === 'cancelled') {
          setStatus('Login cancelled. Your score is still here.', 'warning');
          return;
        }
        if (loginResult.status === 'failed') {
          setStatus(`Login failed (${loginResult.code}). Your score is still here.`, 'error');
          return;
        }

        tokenResult = await auth.getAccessToken({ minValiditySeconds: 300 });
        gameDebug('ScoreFlow', 'token.checked-after-login', {
          hasUserId: isAuthenticated(tokenResult),
          status: tokenResult.status,
        });
      }

      if (destroyed) return;
      if (!isAuthenticated(tokenResult)) {
        const code = tokenResult.status === 'failed' ? tokenResult.code : 'LOGIN_REQUIRED';
        setStatus(`Cannot submit score (${code}). Your score is still here.`, 'error');
        return;
      }
      renderAuthState(tokenResult);

      uploadController = new AbortController();
      setStatus('Submitting score to PlaysOut…');
      gameDebug('ScoreFlow', 'upload.requested', { gameId, score: resultToSubmit.score });

      let submitted;
      try {
        submitted = await uploadGameScore({
          userId: tokenResult.userId,
          gameId,
          score: resultToSubmit.score,
          accessToken: tokenResult.accessToken,
          signal: uploadController.signal,
        });
      } catch (error) {
        if (!(error instanceof ScoreUploadError) || !error.isAuthenticationError) throw error;

        const refreshed = await auth.getAccessToken({
          forceRefresh: true,
          minValiditySeconds: 300,
        });
        if (destroyed || !uploadController) return;

        if (!isAuthenticated(refreshed) || refreshed.userId !== tokenResult.userId) {
          if (refreshed.status === 'guest') renderAuthState(refreshed);
          setStatus('Your session ended. Sign in to retry this score.', 'warning');
          return;
        }

        submitted = await uploadGameScore({
          userId: refreshed.userId,
          gameId,
          score: resultToSubmit.score,
          accessToken: refreshed.accessToken,
          signal: uploadController.signal,
        });
      }

      if (destroyed || pendingResult?.runId !== resultToSubmit.runId) return;
      pendingResult = null;
      elements.uploadButton.textContent = 'SCORE CONFIRMED';
      setStatus('Score submitted successfully.', 'success');
      gameDebug('ScoreFlow', 'upload.succeeded', { gameId });
    } catch (error) {
      if (destroyed || (error instanceof Error && error.name === 'AbortError')) return;
      const errorDetails = describeGameError(error);
      gameDebug('ScoreFlow', 'submission.failed', errorDetails);
      if (error instanceof ScoreUploadError && error.code === 'SCORE_OUT_OF_RANGE') {
        setStatus('This score is outside the accepted range.', 'error');
      } else if (error instanceof ScoreUploadError && error.code === 'SCORE_NETWORK_ERROR') {
        setStatus('Network error. Your score is still here — retry when ready.', 'warning');
      } else {
        const debugCode =
          isGameDebugEnabled() && errorDetails.code ? ` (${errorDetails.code})` : '';
        setStatus(`Score upload failed${debugCode}. Your score is still here.`, 'error');
      }
    } finally {
      uploadController = null;
      if (!destroyed) {
        uploadInProgress = false;
        setActionsDisabled(false);
        if (pendingResult === null) elements.uploadButton.disabled = true;
        else elements.uploadButton.textContent = 'RETRY SCORE';
      }
    }
  }

  function completeRun(score, startedAt) {
    if (destroyed || panelOpen) return;
    if (!activityEnabled) {
      gameDebug('ScoreFlow', 'run.completed-after-activity-end', { gameId, score });
      return;
    }
    pendingResult = {
      gameId,
      score,
      runId: createRunId(),
      startedAt,
      endedAt: Date.now(),
    };
    gameDebug('ScoreFlow', 'run.completed', { gameId, score });
    panelOpen = true;
    elements.finalScore.textContent = String(score);
    elements.scoreChoice.hidden = false;
    elements.uploadButton.textContent = 'JOIN WITH SCORE';
    setActionsDisabled(false);
    setStatus(
      authStatus === 'authenticated'
        ? 'Signed in — submitting this score automatically…'
        : 'Choose whether to join the activity with this score.',
    );
    maybeAutoSubmit();

    const runId = pendingResult.runId;
    void auth.getAuthState().then((state) => {
      if (destroyed || pendingResult?.runId !== runId) return;
      renderAuthState(state);
      maybeAutoSubmit();
    });
  }

  function onUploadClick() {
    gameDebug('ScoreFlow', 'join-with-score.clicked', {
      gameId,
      score: pendingResult?.score ?? null,
    });
    void processPendingResult({ allowLogin: true });
  }

  function onPlayAgainClick() {
    if (uploadInProgress) return;
    resetPanel();
    onPlayAgain();
  }

  function onExitClick() {
    if (uploadInProgress) uploadController?.abort();
    resetPanel();
    onExit?.();
  }

  elements.uploadButton.addEventListener('click', onUploadClick);
  elements.playAgainButton.addEventListener('click', onPlayAgainClick);
  elements.exitButton.addEventListener('click', onExitClick);
  elements.exitNavButton.addEventListener('click', onExitClick);

  const unsubscribeAuth = auth.subscribe((state) => {
    if (destroyed) return;
    renderAuthState(state);
    gameDebug('ScoreFlow', 'auth.state-changed', { status: state.status });
    maybeAutoSubmit();
  });

  void auth.getAuthState().then((state) => {
    if (destroyed) return;
    renderAuthState(state);
    maybeAutoSubmit();
  });

  return {
    completeRun,
    isBlocking() {
      return panelOpen;
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      uploadController?.abort();
      uploadController = null;
      pendingResult = null;
      unsubscribeAuth();
      elements.uploadButton.removeEventListener('click', onUploadClick);
      elements.playAgainButton.removeEventListener('click', onPlayAgainClick);
      elements.exitButton.removeEventListener('click', onExitClick);
      elements.exitNavButton.removeEventListener('click', onExitClick);
    },
  };
}
