import '../styles/sass.scss';
import Game from './components/Game';

const game = new Game();

document.addEventListener('DOMContentLoaded', document.body.append(game.view));

window.addEventListener('resize', game.resize());
