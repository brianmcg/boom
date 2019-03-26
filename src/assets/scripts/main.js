import '../styles/sass.scss';
import GameManual from './components/GameManual';
import Game from './components/Game';

const manual = new GameManual();

const game = new Game();

manual.on(GameManual.EVENTS.CLICK_START, () => {
  document.body.removeChild(manual.view);
  document.body.appendChild(game.view);
  game.run();
});

game.on(Game.EVENTS.QUIT, () => {
  document.body.removeChild(game.view);
  document.body.appendChild(manual.view);
  game.stop();
});

document.addEventListener('DOMContentLoaded', () => {
  document.body.appendChild(manual.view)
});
