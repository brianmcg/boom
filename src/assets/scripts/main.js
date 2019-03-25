import '../styles/sass.scss';
import Game from './components/Game';
import Instructions from './components/Instructions';

let resizeTimer = null;

// const container = document.getElementById('container');

// const button = document.getElementById('button');

const game = new Game({
  onQuit: () => {
    // document.body.removeChild(game.view);
    // document.body.append(instructions.view);
  },
});

const instructions = new Instructions({
  onClick: () => {
    document.body.removeChild(instructions.view);
    document.body.append(game.view);
  },
});

document.body.append(instructions.view);

const onResize = () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    game.onResize();
  }, 20);
};

window.addEventListener('resize', onResize);

// button.addEventListener('click', onClick);

window.game = game;
