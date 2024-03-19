import './styles/index.scss';
import Game from '@game';

window.game = new Game();

(async () => {
  await window.game.init({
    // application options
  });

  // do pixi things
})();
