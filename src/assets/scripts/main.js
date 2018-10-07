import '../styles/sass.scss';
import Game from './components/Game';

const game = new Game();

let resizeTimer;

document.addEventListener('DOMContentLoaded', () => {
  document.body.append(game.view);
  game.start();
});

window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    game.resize();
  }, 20);
});
