import '../styles/sass.scss';
import Game from './components/Game';

let resizeTimer = null;

const container = document.getElementById('container');

const button = document.getElementById('button');

const game = new Game({
  onQuit: () => {
    document.body.removeChild(game.view);
    document.body.append(container);
  },
});

const onClick = () => {
  document.body.removeChild(container);
  document.body.append(game.view);
  game.run();
};

const onResize = () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    game.onResize();
  }, 20);
};

window.addEventListener('resize', onResize);

button.addEventListener('click', onClick);

window.game = game;
