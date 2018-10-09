import { Application, Scene, util } from 'game/components/graphics';
import { Keyboard } from 'game/components/input';
import TitleScene from './scenes/TitleScene';
import WorldScene from './scenes/WorldScene';
import CreditsScene from './scenes/CreditsScene';
import { SCREEN, NUM_LEVELS } from './config';

class Game extends Application {
  constructor() {
    super(SCREEN.WIDTH, SCREEN.HEIGHT);

    this.scenes = {
      [Scene.TYPES.TITLE]: TitleScene,
      [Scene.TYPES.WORLD]: WorldScene,
      [Scene.TYPES.CREDITS]: CreditsScene,
    };

    this.keyboard = new Keyboard();

    this.resize();

    this.show(Scene.TYPES.TITLE);
  }

  onSceneComplete(type, index) {
    switch (type) {
      case Scene.TYPES.TITLE:
        this.show(Scene.TYPES.WORLD, 0);
        break;
      case Scene.TYPES.WORLD:
        if (index < NUM_LEVELS) {
          this.show(Scene.TYPES.WORLD, index + 1);
        } else {
          this.show(Scene.TYPES.CREDITS);
        }
        break;
      default: {
        this.show(Scene.TYPES.TITLE);
      }
    }
  }

  onSceneRestart(type, index) {
    this.show(type, index);
  }

  onSceneQuit(type) {
    switch (type) {
      case Scene.TYPES.TITLE:
        this.show(null);
        break;
      default: {
        this.show(Scene.TYPES.TITLE);
      }
    }
  }

  show(type, index = 0) {
    const SceneType = this.scenes[type];
    const scaleFactor = Game.getScaleFactor();

    if (this.scene) {
      this.scene.destroy(true);
      this.loader.reset();
      util.clearCache();
    }

    if (SceneType) {
      this.scene = new SceneType({
        index,
        loader: this.loader,
        keyboard: this.keyboard,
        ticker: this.ticker,
        scale: {
          x: scaleFactor,
          y: scaleFactor,
        },
      });

      this.scene.on(Scene.EVENTS.SCENE_COMPLETE, this.onSceneComplete.bind(this));
      this.scene.on(Scene.EVENTS.SCENE_RESTART, this.onSceneRestart.bind(this));
      this.scene.on(Scene.EVENTS.SCENE_QUIT, this.onSceneQuit.bind(this));

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

    this.keyboard.update();
  }

  resize() {
    const scaleFactor = Game.getScaleFactor();
    const scaledWidth = SCREEN.WIDTH * scaleFactor;
    const scaledHeight = SCREEN.HEIGHT * scaleFactor;

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

  static getScaleFactor() {
    const widthRatio = window.innerWidth / SCREEN.WIDTH;
    const heightRatio = window.innerHeight / SCREEN.HEIGHT;
    return Math.floor(Math.min(widthRatio, heightRatio)) || 1;
  }
}

export default Game;
