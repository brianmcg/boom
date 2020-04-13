import './styles/index.scss';
import Manual from './components/Manual';
import Game from './components/Game';

const app = document.getElementById('app');

const manual = new Manual();

const game = new Game();

manual.onClickStart(() => {
  app.removeChild(manual.view);
  app.appendChild(game.view);
  // game.lockPointer();
  // game.start();
});

// game.onLoadingStarted(() => {
//   console.log('loading:started');
// });

// game.onLoadingComplete(() => {
//   console.log('loading:complete');
// });

game.onStopped(() => {
  app.removeChild(game.view);
  app.appendChild(manual.view);
});

document.addEventListener('DOMContentLoaded', () => {
  app.appendChild(game.view);
  game.start();
});

window.game = game;
