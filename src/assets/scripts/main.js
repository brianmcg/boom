import './styles/index.scss';
import Manual from './components/Manual';
import Game from './components/Game';

const manual = new Manual();

const game = new Game();

manual.onClickStartEvent(() => {
  document.body.removeChild(manual.view);
  document.body.appendChild(game.view);
  // game.lockMousePointer();
  // game.start();
});

game.onStoppedEvent(() => {
  document.body.removeChild(game.view);
  document.body.appendChild(manual.view);
});

document.addEventListener('DOMContentLoaded', () => {
  document.body.appendChild(game.view);
  game.start();
});

window.game = game;
