import * as PIXI from 'pixi.js';
import SceneManager from './components/utilities/SceneManager';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from './constants/config';
import { TITLE } from './constants/scene-types';
import { BLACK } from './constants/colors';

class Game extends PIXI.Application {
  constructor() {
    super(SCREEN_WIDTH, SCREEN_HEIGHT, {
      backgroundColor: BLACK,
      autoStart: false,
    });

    this.manager = new SceneManager({
      loader: this.loader,
      stage: this.stage,
    });

    this.resize();
    this.manager.show(TITLE);
    this.ticker.add(this.manager.loop.bind(this));
  }

  resize() {
    const widthRatio = window.innerWidth / SCREEN_WIDTH;
    const heightRatio = window.innerHeight / SCREEN_HEIGHT;
    const scale = Math.floor(Math.min(widthRatio, heightRatio)) || 1;
    const scaledWidth = SCREEN_WIDTH * scale;
    const scaledHeight = SCREEN_HEIGHT * scale;

    this.renderer.view.style.width = `${scaledWidth}px`;
    this.renderer.view.style.height = `${scaledHeight}px`;
    this.renderer.view.style.position = 'absolute';
    this.renderer.view.style.left = '50%';
    this.renderer.view.style.top = '50%';
    this.renderer.view.style.margin = `-${scaledHeight / 2}px 0 0 -${scaledWidth / 2}px`;
    this.renderer.resize(scaledWidth, scaledHeight);

    this.manager.resize(scale);
  }
}

export default Game;
