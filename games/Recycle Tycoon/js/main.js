import {
  createWorld,
  updateWorld,
  swing,
  continueRound,
  setAim,
  nudgeAim,
  viewSize,
} from './world.js';
import { readBest, submitBest } from './score.js';
import { attachInput, createDisplay, startLoop } from './runtime.js';
import { createArt } from './art.js';
import {
  isMuted,
  playCatch,
  playBonus,
  playRound,
  playSplat,
  playSwing,
  resume as resumeAudio,
  startMusic,
  stopMusic,
  toggleMuted,
} from './audio.js';
import {
  assertGameMountOptions,
  createGameShell,
  createScoreFlow,
} from '../../shared/game-integration.js?v=20260911-debug';

const GAME = Object.freeze({
  gameId: 4,
  slug: 'recycle-tycoon',
  title: 'RECYCLE TYCOON',
  hint: 'click to catch · M mute · R restart',
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

export function mountRecycleTycoon(options) {
  assertGameMountOptions(options, GAME);

  const { container, auth, onExit } = options;
  const elements = createGameShell(container, GAME);
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  const { width, height } = viewSize();
  const display = createDisplay(elements.stage, {
    width,
    height,
    background: '#080a10',
    backgroundGradient: ['#263b5b', '#080a10', '#4a2b38'],
  });
  const input = attachInput(elements.stage);
  const art = createArt();
  const ctx = display.ctx;
  const held = new Set();

  let world = createWorld({ seed: (Date.now() / 1000) | 0 });
  let cover = true;
  let time = 0;
  let shake = 0;
  let swingPulse = 0;
  let displayed = 0;
  let newBest = false;
  let best = readBest();
  let musicStarted = false;
  let runStartedAt = Date.now();
  let destroyed = false;
  let scoreFlow;

  function syncMuteButton() {
    const muted = isMuted();
    elements.soundButton.setAttribute('aria-pressed', String(!muted));
    const label = elements.soundButton.querySelector('.toggle-text');
    if (label) label.textContent = muted ? 'Sound off' : 'Sound on';
  }

  function startMusicOnce() {
    if (musicStarted) return;
    musicStarted = true;
    startMusic();
  }

  function chase(current, target, dt) {
    if (current === target) return target;
    const diff = target - current;
    const abs = Math.abs(diff);
    const step = Math.max(abs * 9 * dt, 40 * dt * Math.max(1, abs / 400));
    return abs <= step ? target : current + Math.sign(diff) * step;
  }

  function resetToCover() {
    if (destroyed) return;
    world = createWorld({ seed: (Date.now() / 1000) | 0 });
    art.clearParticles();
    held.clear();
    cover = true;
    shake = 0;
    swingPulse = 0;
    displayed = 0;
    newBest = false;
    runStartedAt = Date.now();
    elements.stage.focus();
  }

  function restartPlaying() {
    if (destroyed) return;
    world = createWorld({ seed: (Date.now() / 1000) | 0 });
    art.clearParticles();
    held.clear();
    cover = false;
    shake = 0;
    swingPulse = 0;
    displayed = 0;
    newBest = false;
    runStartedAt = Date.now();
    elements.stage.focus();
  }

  function noteScore() {
    if (submitBest(undefined, world.saved)) {
      newBest = true;
      best = world.saved;
    }
  }

  scoreFlow = createScoreFlow({
    gameId: GAME.gameId,
    auth,
    elements,
    onExit,
    onPlayAgain: restartPlaying,
  });

  function handleEvents() {
    for (const event of world.events) {
      if (event.type === 'hit') {
        playCatch(event.itemType);
        const power = event.value >= 100 ? 2 : event.value >= 20 ? 1.5 : 1;
        art.burst(event.x + 8, event.y + 6, '#f5d97a', power);
        art.spawnFloat(event.x, event.y, `+${event.value}`);
        if (!reducedMotion) shake = Math.max(shake, 1.4 * power);
        noteScore();
      } else if (event.type === 'bonus') {
        playBonus();
        art.burst(event.x + 7, event.y, '#ffe680', 2.4);
        art.spawnFloat(event.x, event.y, `+${event.value}`);
        if (!reducedMotion) shake = Math.max(shake, 3.2);
        noteScore();
      } else if (event.type === 'escaped' && event.splat && world.impact) {
        playSplat();
        art.splat(world.impact.x, world.impact.y, '#4aa564');
        if (!reducedMotion) shake = Math.max(shake, 1.1);
      } else if (event.type === 'roundOver') {
        playRound();
        noteScore();
      } else if (event.type === 'gameOver') {
        noteScore();
        scoreFlow.completeRun(world.saved, runStartedAt);
      }
    }
    world.events.length = 0;
    for (const gone of world.bonusExpired) {
      art.burst(gone.x, gone.y, '#f5d97a', 1.1);
    }
    world.bonusExpired.length = 0;
    world.impact = null;
    world.bonusHit = null;
  }

  function tapAt(x, y) {
    if (destroyed || scoreFlow.isBlocking()) return;
    resumeAudio();
    startMusicOnce();
    setAim(world, x, y);
    if (cover) {
      cover = false;
      runStartedAt = Date.now();
      return;
    }
    if (world.phase === 'roundOver') {
      continueRound(world);
      return;
    }
    if (world.phase === 'gameOver') {
      restartPlaying();
      return;
    }
    const result = swing(world, x, y);
    if (result.result !== 'ignored') {
      playSwing();
      swingPulse = 1;
    }
  }

  function onKey(event) {
    const key = event.key;
    if (key === 'm' || key === 'M') {
      toggleMuted();
      syncMuteButton();
      resumeAudio();
      startMusicOnce();
      return;
    }
    if (key === 'r' || key === 'R') {
      if (!scoreFlow.isBlocking()) resetToCover();
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
      startMusicOnce();
      if (cover) {
        cover = false;
        runStartedAt = Date.now();
        return;
      }
      if (world.phase === 'roundOver') continueRound(world);
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
    startMusicOnce();
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
        setAim(world, pos.x, pos.y);
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
      if (ax || ay) nudgeAim(world, dt, Math.sign(ax), Math.sign(ay));
      for (const click of input.takeClicks()) {
        const pos = display.toGame(click.clientX, click.clientY);
        tapAt(pos.x, pos.y);
      }
      if (!cover) updateWorld(world, dt);
      handleEvents();
      art.updateParticles(dt);
      displayed = chase(displayed, world.saved, dt);
      swingPulse = Math.max(0, swingPulse - dt * 6);
      if (!reducedMotion) {
        shake *= Math.max(0, 1 - 9 * dt);
        if (shake < 0.05) shake = 0;
      } else {
        shake = 0;
      }
    },
    render() {
      art.draw(ctx, {
        world,
        time,
        best,
        displayed,
        cover,
        newBest,
        reducedMotion,
        swingPulse,
      });
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
      held.clear();
      stopMusic();
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('keydown', onKey);
      elements.soundButton.removeEventListener('click', onSoundClick);
      container.replaceChildren();
    },
  };
}
