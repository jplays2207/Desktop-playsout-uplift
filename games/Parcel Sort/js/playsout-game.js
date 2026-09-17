import { mountParcelSort } from './main.js';

let activeInstance = null;

export const playsOutGame = Object.freeze({
  version: '1.0',
  mount(options) {
    activeInstance?.destroy();
    activeInstance = mountParcelSort(options);
    return activeInstance;
  },
});

window.PlaysOutGame = playsOutGame;
