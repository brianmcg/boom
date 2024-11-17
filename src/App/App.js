import Home from './components/Home';
import Game from './components/Game';
import Spinner from './components/Spinner';
import AppView from './AppView';
import { scale, add } from '@util/dom';
import './App.css';

export default class App {
  constructor() {
    this.view = new AppView();

    this.spinner = new Spinner();

    this.home = new Home({
      onClickStart: this.onGameStart,
    });

    this.game = new Game({
      onLoading: this.onGameLoading,
      onReady: this.onGameReady,
      onExit: this.onGameExit,
    });

    add(this.view, this.home.view);
  }

  async init() {
    await this.game.init();
    this.home.showButton();
    this.onAppResize();
    window.addEventListener('resize', this.onAppResize);
  }

  onAppResize = () => {
    const newScale = scale();

    if (newScale !== this.scale) {
      this.game.resize(newScale);
      this.spinner.resize(newScale);
      this.scale = newScale;
    }
  };

  onGameStart = () => {
    this.home.view.remove();
    add(this.view, this.game.view);
    this.game.start();
  };

  onGameLoading = () => {
    add(this.view, this.spinner.view);
  };

  onGameReady = () => {
    this.spinner.view.remove();
  };

  onGameExit = () => {
    this.game.view.remove();
    add(this.view, this.home.view);
  };
}
