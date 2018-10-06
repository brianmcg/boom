import * as PIXI from 'pixi.js';
import { SCREEN_WIDTH, SCREEN_HEIGHT, NUM_LEVELS } from './constants/config';
import { TITLE, WORLD, CREDITS } from './constants/scene-types';
import { BLACK } from './constants/colors';
import TitleScene from './components/scenes/TitleScene';
import WorldScene from './components/scenes/WorldScene';
import CreditsScene from './components/scenes/CreditsScene';
import SceneManager from './components/utilities/SceneManager';

class Game extends PIXI.Application {
  constructor() {
    super(SCREEN_WIDTH, SCREEN_HEIGHT, {
      backgroundColor: BLACK,
      autoStart: false,
    });

    this.manager = new SceneManager();

    this.scenes = {
      [TITLE]: TitleScene,
      [WORLD]: WorldScene,
      [CREDITS]: CreditsScene,
    };

    this.events = new PIXI.utils.EventEmitter();
    this.events.on('scene:pass', this.onScenePass.bind(this));
    this.events.on('scene:fail', this.onSceneFail.bind(this));
    this.events.on('scene:quit', this.onSceneQuit.bind(this));

    this.ticker.add(this.loop.bind(this));

    this.resize();

    this.show(TITLE);

    this.start();
  }

  onScenePass(type, index) {
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

  onSceneFail(type, index) {
    switch (type) {
      case WORLD:
        this.show(WORLD, index);
        break;
      default: {
        this.show(TITLE);
      }
    }
  }

  onSceneQuit(type) {
    switch (type) {
      case TITLE:
        this.stop();
        break;
      default: {
        this.show(TITLE);
      }
    }
  }

  show(sceneType, index = 0) {
    const Scene = this.scenes[sceneType];

    if (this.scene) {
      this.scene.destroy(true);
      this.loader.reset();
      Game.clearCache();
    }

    this.scene = new Scene({
      index,
      loader: this.loader,
      events: this.events,
    });

    this.scene.load().then(() => {
      this.stage.addChild(this.scene);
    });
  }

  loop(delta) {
    this.update(delta);
    this.render();
  }

  update(delta) {
    // console.log('update', delta);
  }

  render() {
    // console.log('render');
  }

  resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const scale = Math.floor(Math.min(width / SCREEN_WIDTH, height / SCREEN_HEIGHT)) || 1;
    const scaledWidth = SCREEN_WIDTH * scale;
    const scaledHeight = SCREEN_HEIGHT * scale;

    this.renderer.view.style.width = `${scaledWidth}px`;
    this.renderer.view.style.height = `${scaledHeight}px`;
    this.renderer.view.style.position = 'absolute';
    this.renderer.view.style.left = '50%';
    this.renderer.view.style.top = '50%';
    this.renderer.view.style.margin = `-${scaledHeight / 2}px 0 0 -${scaledWidth / 2}px`;
    this.renderer.resize(scaledWidth, scaledHeight);

    if (this.scene) {
      this.scene.resize(scale);
    }
  }

  static clearCache() {
    Object.keys(PIXI.utils.TextureCache).forEach((key) => {
      if (PIXI.utils.TextureCache[key]) {
        PIXI.utils.TextureCache[key].destroy(true);
      }
    });
  }
}

export default Game;
