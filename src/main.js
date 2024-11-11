import './styles/index.scss';
import Game from '@game';

(async () => {
  window.game = await new Game();
})();
