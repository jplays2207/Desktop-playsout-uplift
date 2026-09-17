import {
  RULES,
  createWorld,
  startGame,
  queueTurn,
  updateWorld,
  tapDirection,
  viewSize,
} from './world.js';
import { readBest, submitBest } from './score.js';
import { attachInput, createDisplay, startLoop } from './runtime.js';
import { createArt } from './art.js';
import {
  isMuted,
  playBust,
  playCollar,
  playStart,
  playTurn,
  resume as resumeAudio,
  toggleMuted,
} from './audio.js';
import {
  assertGameMountOptions,
  createGameShell,
  createScoreFlow,
} from '../../shared/game-integration.js?v=20260911-debug';

const GAME = Object.freeze({
  gameId: 2,
  slug: 'rio-rush',
  title: 'RIO RUSH',
  hint: 'tap or arrows to steer · M mute · R restart',
});
const KEY_DIR = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  w: [0, -1],
  s: [0, 1],
  a: [-1, 0],
  d: [1, 0],
  W: [0, -1],
  S: [0, 1],
  A: [-1, 0],
  D: [1, 0],
};

export function mountRioRush(options) {
  assertGameMountOptions(options, GAME);

  const { container, auth, onExit } = options;
  const elements = createGameShell(container, GAME);
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  const { width, height } = viewSize();
  const display = createDisplay(elements.stage, {
    width,
    height,
    background: '#0d1017',
    backgroundGradient: ['#1e3a5f', '#0d1017', '#4a202c'],
  });
  const input = attachInput(elements.stage);
  const art = createArt();
  const ctx = display.ctx;

  let world = createWorld({ seed: (Date.now() / 1000) | 0 });
  let time = 0;
  let shake = 0;
  let newBest = false;
  let best = readBest();
  let runStartedAt = Date.now();
  let destroyed = false;
  let scoreFlow;

  function syncMuteButton() {
    const muted = isMuted();
    elements.soundButton.setAttribute('aria-pressed', String(!muted));
    const label = elements.soundButton.querySelector('.toggle-text');
    if (label) label.textContent = muted ? 'Sound off' : 'Sound on';
  }

  function reset() {
    if (destroyed) return;
    world = createWorld({ seed: (Date.now() / 1000) | 0 });
    art.clearParticles();
    shake = 0;
    newBest = false;
    runStartedAt = Date.now();
    elements.stage.focus();
  }

  scoreFlow = createScoreFlow({
    gameId: GAME.gameId,
    auth,
    elements,
    onExit,
    onPlayAgain: reset,
  });

  function tryStart() {
    if (destroyed || scoreFlow.isBlocking()) return;
    resumeAudio();
    if (world.phase === 'dead' || world.phase === 'cleared') {
      if (world.t >= RULES.restartDelay) reset();
      return;
    }
    if (startGame(world)) playStart();
  }

  function tryTurn(dx, dy) {
    if (destroyed || scoreFlow.isBlocking()) return;
    resumeAudio();
    if (world.phase === 'dead' || world.phase === 'cleared') {
      if (world.t >= RULES.restartDelay) reset();
      return;
    }
    const fromReady = world.phase === 'ready';
    if (queueTurn(world, dx, dy) && fromReady) playStart();
  }

  function handlePointer(pos) {
    if (destroyed || scoreFlow.isBlocking()) return;
    resumeAudio();
    if (world.phase === 'dead' || world.phase === 'cleared') {
      if (world.t >= RULES.restartDelay) reset();
      return;
    }
    if (world.phase === 'ready') {
      tryStart();
      return;
    }
    const dir = tapDirection(world, pos.x, pos.y);
    if (dir) queueTurn(world, dir.x, dir.y);
  }

  function onKey(event) {
    const key = event.key;
    if (key === 'm' || key === 'M') {
      toggleMuted();
      syncMuteButton();
      resumeAudio();
      return;
    }
    if (key === 'r' || key === 'R') {
      if (!scoreFlow.isBlocking()) reset();
      return;
    }
    const dir = KEY_DIR[key];
    if (dir) {
      event.preventDefault();
      if (!event.repeat) tryTurn(dir[0], dir[1]);
      return;
    }
    if (key === ' ' || key === 'Enter') {
      event.preventDefault();
      if (!event.repeat) tryStart();
    }
  }

  function onSoundClick() {
    resumeAudio();
    toggleMuted();
    syncMuteButton();
  }

  elements.soundButton.addEventListener('click', onSoundClick);
  document.addEventListener('keydown', onKey);
  syncMuteButton();

  const loop = startLoop({
    update(dt) {
      time += dt;
      if (scoreFlow.isBlocking()) {
        input.takeClicks();
        return;
      }
      for (const click of input.takeClicks()) {
        const pos = display.toGame(click.clientX, click.clientY);
        handlePointer(pos);
      }
      updateWorld(world, dt);
      for (const event of world.events) {
        if (event.type === 'turn') {
          playTurn();
        } else if (event.type === 'collar') {
          playCollar();
          art.pulse(1);
          const at = art.cellCenter(event.x, event.y);
          art.burst(at.x, at.y, event.shirt);
          art.spawnFloat(at.x, at.y - 8, `+${event.gained}`, '#f5c542');
          if (submitBest(undefined, event.score)) {
            newBest = true;
            best = event.score;
          }
        } else if (event.type === 'bust') {
          playBust();
          const at = art.cellCenter(event.x, event.y);
          art.burst(at.x, at.y, 'green');
          if (!reducedMotion) shake = 4.5;
          scoreFlow.completeRun(event.score, runStartedAt);
        } else if (event.type === 'cleared') {
          playCollar();
          scoreFlow.completeRun(event.score, runStartedAt);
        }
      }
      world.events.length = 0;
      art.updateParticles(dt);
      shake *= Math.max(0, 1 - 9 * dt);
      if (shake < 0.05) shake = 0;
    },
    render() {
      art.draw(ctx, { world, time, best, newBest, reducedMotion });
      const ox = shake > 0 ? (Math.random() - 0.5) * 2 * shake : 0;
      const oy = shake > 0 ? (Math.random() - 0.5) * 2 * shake : 0;
      display.present(ox, oy);
    },
  });

  return {
    pause() {
      if (!destroyed) loop.pause();
    },
    resume() {
      if (!destroyed) loop.resume();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      loop.stop();
      scoreFlow.destroy();
      input.dispose();
      display.destroy();
      document.removeEventListener('keydown', onKey);
      elements.soundButton.removeEventListener('click', onSoundClick);
      container.replaceChildren();
    },
  };
}
