import './styles/index.scss';
import GameManual from './components/GameManual';
import Game from './components/Game';

const manual = new GameManual();

const game = new Game();

window.game = game;

manual.on(GameManual.EVENTS.CLICK_START, () => {
  document.body.removeChild(manual.view);
  document.body.appendChild(game.view);
  game.start();
  game.load();
});

game.on(Game.EVENTS.QUIT, () => {
  document.body.removeChild(game.view);
  document.body.appendChild(manual.view);
  game.stop();
  game.unload();
});

document.addEventListener('DOMContentLoaded', () => {
  document.body.appendChild(game.view);
  game.start();
  game.load();
});
