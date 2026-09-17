import {
  RULES,
  createWorld,
  startPlaying,
  resetToIntro,
  grab,
  setClaw,
  nudgeClaw,
  updateWorld,
  viewSize,
} from './world.js';
import { readBest, submitBest } from './score.js';
import { attachInput, createDisplay, startLoop } from './runtime.js';
import { createArt } from './art.js';
import {
  isMuted,
  playCombo,
  playEarly,
  playImpact,
  playOver,
  playPull,
  playShift,
  playShip,
  playThud,
  playWrong,
  resume as resumeAudio,
  toggleMuted,
} from './audio.js';
import {
  assertGameMountOptions,
  createGameShell,
  createScoreFlow,
} from '../../shared/game-integration.js?v=20260911-debug';

const GAME = Object.freeze({
  gameId: 3,
  slug: 'parcel-sort',
  title: 'PARCEL SORT',
  hint: 'Tap to grab items · M mute · R restart',
});
const KEY_AXIS = {
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

export function mountParcelSort(options) {
  assertGameMountOptions(options, GAME);

  const { container, auth, onExit } = options;
  const elements = createGameShell(container, GAME);
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  const { width, height } = viewSize();
  const display = createDisplay(elements.stage, {
    width,
    height,
    background: '#0b0e11',
    backgroundGradient: ['#32204f', '#0b0e11', '#123847'],
  });
  const input = attachInput(elements.stage);
  const art = createArt();
  const ctx = display.ctx;
  const held = new Set();

  let world = createWorld({ seed: (Date.now() / 1000) | 0, intro: true });
  let time = 0;
  let shake = 0;
  let flash = 0;
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

  function startRun() {
    startPlaying(world);
    art.clearParticles();
    shake = 0;
    flash = 0;
    newBest = false;
    runStartedAt = Date.now();
  }

  function reset() {
    if (destroyed) return;
    resetToIntro(world);
    art.clearParticles();
    held.clear();
    shake = 0;
    flash = 0;
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

  function handleEvents() {
    for (const event of world.events) {
      if (event.type === 'pull') {
        playPull();
        art.burst(event.x + 8, event.y + 8, '#c39a4a');
        art.spawnFloat(event.x, event.y, `+${event.score}`, '#8fe08a');
      } else if (event.type === 'early') {
        playEarly();
        art.spawnFloat(event.x, event.y - 7, 'EARLY', '#e8cf7a');
      } else if (event.type === 'ship') {
        playShip();
        art.spawnFloat(event.x, event.y, `+${event.score}`, '#8fe08a');
        if (submitBest(undefined, world.score)) {
          newBest = true;
          best = world.score;
        }
      } else if (event.type === 'wrong') {
        playWrong();
        art.spawnFloat(event.x, event.y, '-150', '#ff7a6e');
        if (!reducedMotion) flash = 0.5;
      } else if (event.type === 'thud') {
        playThud();
        if (!reducedMotion) {
          flash = 0.7;
          shake = 5;
        }
        art.burst(RULES.robotX + 20, RULES.robotY + 22, '#ff7a6e');
        art.spawnFloat(width / 2 - 8, 104, 'LET ONE THROUGH', '#ff7a6e');
      } else if (event.type === 'impact') {
        playImpact();
        if (!reducedMotion) shake = 8;
      } else if (event.type === 'shift') {
        playShift();
      } else if (event.type === 'combo') {
        playCombo(event.mult);
      } else if (event.type === 'over') {
        playOver();
        if (submitBest(undefined, world.score)) {
          newBest = true;
          best = world.score;
        }
        scoreFlow.completeRun(world.score, runStartedAt);
      }
    }
    world.events.length = 0;
  }

  function tapAt(x, y) {
    if (destroyed || scoreFlow.isBlocking()) return;
    resumeAudio();
    setClaw(world, x, y);
    if (world.phase !== 'playing') {
      startRun();
      return;
    }
    grab(world, x, y);
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
    if (scoreFlow.isBlocking()) return;
    const axis = KEY_AXIS[key];
    if (axis) {
      event.preventDefault();
      held.add(key);
      resumeAudio();
      return;
    }
    if (key === ' ' || key === 'Enter') {
      event.preventDefault();
      if (event.repeat) return;
      resumeAudio();
      if (world.phase !== 'playing') {
        startRun();
        return;
      }
      if (world.px > -50) grab(world, world.px, world.py);
    }
  }

  function onKeyUp(event) {
    held.delete(event.key);
  }

  function onBlur() {
    held.clear();
  }

  function onSoundClick() {
    resumeAudio();
    toggleMuted();
    syncMuteButton();
  }

  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', onBlur);
  document.addEventListener('keydown', onKey);
  elements.soundButton.addEventListener('click', onSoundClick);
  syncMuteButton();

  const loop = startLoop({
    update(dt) {
      time += dt;
      if (scoreFlow.isBlocking()) {
        held.clear();
        input.takeClicks();
        return;
      }
      const ptr = input.getPointer();
      if (ptr) {
        const pos = display.toGame(ptr.clientX, ptr.clientY);
        setClaw(world, pos.x, pos.y);
      }
      let ax = 0;
      let ay = 0;
      for (const key of held) {
        const axis = KEY_AXIS[key];
        if (axis) {
          ax += axis[0];
          ay += axis[1];
        }
      }
      if (ax || ay) nudgeClaw(world, dt, Math.sign(ax), Math.sign(ay));
      for (const click of input.takeClicks()) {
        const pos = display.toGame(click.clientX, click.clientY);
        tapAt(pos.x, pos.y);
      }
      updateWorld(world, dt);
      handleEvents();
      art.updateParticles(dt);
      if (!reducedMotion) {
        shake = Math.max(0, shake - dt * 4.5);
        flash = Math.max(0, flash - dt * 3.2);
      } else {
        shake = 0;
        flash = 0;
      }
    },
    render() {
      art.draw(ctx, { world, time, best, newBest, reducedMotion, flash });
      const ox = shake > 0 ? (Math.random() - 0.5) * 6 * Math.min(1, shake) : 0;
      const oy = shake > 0 ? (Math.random() - 0.5) * 6 * Math.min(1, shake) : 0;
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
      held.clear();
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('keydown', onKey);
      elements.soundButton.removeEventListener('click', onSoundClick);
      container.replaceChildren();
    },
  };
}
