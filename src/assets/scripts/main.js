import '../styles/sass.scss';
import Game from './components/Game';

let resizeTimer = null;

const game = new Game();

document.addEventListener('DOMContentLoaded', () => {
  document.body.append(game.view);
  game.start();
});

window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(game.resize(), 20);
});
