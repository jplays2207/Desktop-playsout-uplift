import { createWorld, flap, updateWorld, PHYSICS, scrollSpeed } from './world.js';
import { readBest, submitBest } from './score.js';
import { attachInput, createDisplay, startLoop } from './runtime.js';
import { createArt } from './art.js';
import {
  isMuted,
  playCrash,
  playFlap,
  playLand,
  playScore,
  resume as resumeAudio,
  toggleMuted,
} from './audio.js';
import {
  assertGameMountOptions,
  createGameShell,
  createScoreFlow,
} from '../../shared/game-integration.js?v=20260911-debug';

const GAME = Object.freeze({
  gameId: 1,
  slug: 'flappy-parrot',
  title: 'FLAPPY PARROT',
  hint: 'click or space to flap · M mute · R restart',
});
const RESTART_DELAY = 0.7;
const FLAP_POSE = 0.26;

export function mountFlappyParrot(options) {
  assertGameMountOptions(options, GAME);

  const { container, auth, onExit } = options;
  const elements = createGameShell(container, GAME);
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  const display = createDisplay(elements.stage, {
    width: PHYSICS.viewW,
    height: PHYSICS.viewH,
    background: '#080a10',
    backgroundGradient: ['#1a1040', '#05060f', '#2a0a2e'],
  });
  const input = attachInput(elements.stage);
  const art = createArt();
  const ctx = display.ctx;

  let world = createWorld({ seed: (Date.now() / 1000) | 0 });
  let time = 0;
  let scrollX = 0;
  let flapTimer = 0;
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
    flapTimer = 0;
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

  function tryFlap() {
    if (destroyed || scoreFlow.isBlocking()) return;
    resumeAudio();
    if (world.phase === 'dead') {
      if (world.t >= RESTART_DELAY) reset();
      return;
    }
    flap(world);
  }

  function onKey(event) {
    if (event.key === 'm' || event.key === 'M') {
      toggleMuted();
      syncMuteButton();
      resumeAudio();
      return;
    }
    if (event.key === 'r' || event.key === 'R') {
      if (!scoreFlow.isBlocking()) reset();
      return;
    }
    if (event.key === ' ' || event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W') {
      event.preventDefault();
      if (!event.repeat) tryFlap();
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
      for (let i = 0; i < input.takeClicks().length; i += 1) tryFlap();
      updateWorld(world, dt, { width: PHYSICS.viewW, height: PHYSICS.viewH });
      for (const event of world.events) {
        if (event.type === 'flap') {
          flapTimer = FLAP_POSE;
          playFlap();
        } else if (event.type === 'score') {
          playScore();
          art.spawnFloat(PHYSICS.birdX + PHYSICS.birdW / 2, world.y, `+${event.gained}`, '#ffe680');
          if (submitBest(undefined, event.score)) {
            newBest = true;
            best = event.score;
          }
        } else if (event.type === 'crash') {
          playCrash();
          art.burst(event.x, event.y);
          if (!reducedMotion) shake = Math.max(shake, 3.4);
        } else if (event.type === 'land') {
          playLand();
          art.splat(event.x, event.y);
          if (!reducedMotion) shake = Math.max(shake, 2);
          scoreFlow.completeRun(world.score, runStartedAt);
        }
      }
      world.events.length = 0;
      if (world.phase === 'ready' || world.phase === 'playing') {
        scrollX += scrollSpeed(world.clears) * dt;
      }
      art.updateParticles(dt);
      flapTimer = Math.max(0, flapTimer - dt);
      shake *= Math.max(0, 1 - 9 * dt);
      if (shake < 0.05) shake = 0;
    },
    render() {
      art.draw(ctx, {
        world,
        scrollX,
        time,
        flapTimer,
        best,
        newBest,
        reducedMotion,
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
      document.removeEventListener('keydown', onKey);
      elements.soundButton.removeEventListener('click', onSoundClick);
      container.replaceChildren();
    },
  };
}
