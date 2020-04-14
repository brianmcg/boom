import './styles/index.scss';

import Manual from './components/Manual';
import Game from './components/Game';
import Spinner from './components/Spinner';

const spinner = new Spinner();
const manual = new Manual();
const game = new Game();

manual.onClickStart(() => {
  document.body.removeChild(manual.view);
  document.body.appendChild(game.view);
  // game.lockPointer();
  // game.start();
});

game.onLoadingStarted(() => {
  document.body.appendChild(spinner.view);
});

game.onLoadingComplete(() => {
  document.body.removeChild(spinner.view);
});

game.onStopped(() => {
  document.body.removeChild(game.view);
  document.body.appendChild(manual.view);
});

document.addEventListener('DOMContentLoaded', () => {
  document.body.appendChild(game.view);
  game.start();
});

window.game = game;
