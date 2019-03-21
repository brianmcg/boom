import '../styles/sass.scss';
import Game from './components/Game';

let resizeTimer = null;

const container = document.getElementById('container');

const button = document.getElementById('button');

const game = new Game();

const onClick = () => {
  document.body.removeChild(container);
  document.body.append(game.view);
  game.run();
};

const onResize = () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(game.center.bind(game), 20);
};

window.addEventListener('resize', onResize);

button.addEventListener('click', onClick, { once: true });

window.game = game;
