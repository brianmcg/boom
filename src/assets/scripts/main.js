import './styles/index.scss';
import Manual from './components/Manual';
import Game from './components/Game';

const manual = new Manual();
const game = new Game();

manual.on(Manual.EVENTS.CLICK_START, () => {
  document.body.removeChild(manual.view);
  document.body.appendChild(game.view);
  game.start();
});

game.on(Game.EVENTS.STOPPED, () => {
  document.body.removeChild(game.view);
  document.body.appendChild(manual.view);
});

document.addEventListener('DOMContentLoaded', () => {
  document.body.appendChild(manual.view);
});

window.game = game;
