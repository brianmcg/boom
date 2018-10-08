import * as PIXI from 'pixi.js';
import TitleScene from './components/scenes/TitleScene';
import WorldScene from './components/scenes/WorldScene';
import CreditsScene from './components/scenes/CreditsScene';
import Input from './components/utilities/Input';
import { BLACK } from './constants/colors';
import { TITLE, WORLD, CREDITS } from './constants/scene-types';
import { SCREEN_WIDTH, SCREEN_HEIGHT, NUM_LEVELS } from './constants/config';
import { SCENE_COMPLETE, SCENE_RESTART, SCENE_QUIT } from './constants/scene-events';

class Game extends PIXI.Application {
  constructor() {
    super(SCREEN_WIDTH, SCREEN_HEIGHT, {
      backgroundColor: BLACK,
      autoStart: false,
    });

    this.scenes = {
      [TITLE]: TitleScene,
      [WORLD]: WorldScene,
      [CREDITS]: CreditsScene,
    };

    this.input = new Input();

    this.ticker.add(this.loop.bind(this));

    this.resize();
    this.show(TITLE);
  }

  onSceneComplete(type, index) {
    switch (type) {
      case TITLE:
        this.show(WORLD, 0);
        break;
      case WORLD:
        if (index < NUM_LEVELS) {
          this.show(WORLD, index + 1);
        } else {
          this.show(CREDITS);
        }
        break;
      default: {
        this.show(TITLE);
      }
    }
  }

  onSceneRestart(type, index) {
    this.show(type, index);
  }

  onSceneQuit(type) {
    switch (type) {
      case TITLE:
        this.show(null);
        break;
      default: {
        this.show(TITLE);
      }
    }
  }

  show(type, index = 0) {
    const Scene = this.scenes[type];
    const scaleFactor = Game.getScaleFactor();

    if (this.scene) {
      this.scene.destroy(true);
      this.loader.reset();
      Game.clearCache();
    }

    if (Scene) {
      this.scene = new Scene({
        index,
        loader: this.loader,
        input: this.input,
        ticker: this.ticker,
        scale: {
          x: scaleFactor,
          y: scaleFactor,
        },
      });

      this.scene.on(SCENE_COMPLETE, this.onSceneComplete.bind(this));
      this.scene.on(SCENE_RESTART, this.onSceneRestart.bind(this));
      this.scene.on(SCENE_QUIT, this.onSceneQuit.bind(this));

      this.scene.load().then(() => {
        this.stage.addChild(this.scene);
      });
    }
  }

  loop(delta) {
    if (this.scene) {
      this.scene.update(delta);
      this.scene.render();
    }

    this.input.update();
  }

  resize() {
    const scaleFactor = Game.getScaleFactor();
    const scaledWidth = SCREEN_WIDTH * scaleFactor;
    const scaledHeight = SCREEN_HEIGHT * scaleFactor;

    this.renderer.view.style.width = `${scaledWidth}px`;
    this.renderer.view.style.height = `${scaledHeight}px`;
    this.renderer.view.style.position = 'absolute';
    this.renderer.view.style.left = '50%';
    this.renderer.view.style.top = '50%';
    this.renderer.view.style.margin = `-${scaledHeight / 2}px 0 0 -${scaledWidth / 2}px`;
    this.renderer.resize(scaledWidth, scaledHeight);

    if (this.scene) {
      this.scene.resize({ x: scaleFactor, y: scaleFactor });
    }
  }

  static clearCache() {
    const { TextureCache } = PIXI.utils;

    Object.keys(TextureCache).forEach((key) => {
      if (TextureCache[key]) {
        TextureCache[key].destroy(true);
      }
    });
  }

  static getScaleFactor() {
    const widthRatio = window.innerWidth / SCREEN_WIDTH;
    const heightRatio = window.innerHeight / SCREEN_HEIGHT;
    return Math.floor(Math.min(widthRatio, heightRatio)) || 1;
  }
}

export default Game;
