import { playsOutGame } from './playsout-game.js';

const guestAuth = Object.freeze({
  version: '1.0',
  async getAuthState() {
    return { status: 'guest' };
  },
  async getAccessToken() {
    return { status: 'guest' };
  },
  async requestLogin() {
    return { status: 'cancelled' };
  },
  subscribe(listener) {
    listener({ status: 'guest' });
    return () => {};
  },
});

if (new URLSearchParams(window.location.search).get('embed') === '1') {
  document.body.classList.add('embed');
}

playsOutGame.mount({
  container: document.getElementById('game-root'),
  gameId: 4,
  auth: guestAuth,
  onExit() {
    window.location.assign('/');
  },
});
