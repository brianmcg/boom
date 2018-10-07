import * as PIXI from 'pixi.js';
import TitleScene from '../../scenes/TitleScene';
import WorldScene from '../../scenes/WorldScene';
import CreditsScene from '../../scenes/CreditsScene';
import Player from '../../entities/Player';
import Input from '../Input';
import { TITLE, WORLD, CREDITS } from '../../../constants/scene-types';
import { NUM_LEVELS } from '../../../constants/config';
import { SCENE_PASS, SCENE_FAIL, SCENE_QUIT } from '../../../constants/event-types';

class SceneManager {
  constructor(props) {
    this.player = new Player();
    this.scenes = {
      [TITLE]: TitleScene,
      [WORLD]: WorldScene,
      [CREDITS]: CreditsScene,
    };
    this.input = new Input();
    this.events = new PIXI.utils.EventEmitter();
    this.events.on(SCENE_PASS, this.onScenePass.bind(this));
    this.events.on(SCENE_FAIL, this.onSceneFail.bind(this));
    this.events.on(SCENE_QUIT, this.onSceneQuit.bind(this));

    Object.assign(this, props);
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
    this.stop();

    this.scene = new this.scenes[sceneType]({
      index,
      player: this.player,
      loader: this.loader,
      events: this.events,
      input: this.input,
    });

    this.scene.load().then(() => {
      this.stage.addChild(this.scene);
      this.scene.start();
    });
  }

  loop(delta) {
    if (this.scene) {
      this.scene.update(delta);
      this.scene.render();
    }
  }

  resize(scale) {
    if (this.scene) {
      this.scene.resize(scale);
    }
  }

  start() {
    if (this.scene) {
      this.scene.start();
    }
  }

  stop() {
    if (this.scene) {
      this.scene.pause();
      this.scene.destroy(true);
      this.loader.reset();
      SceneManager.clearCache();
    }
  }

  pause() {
    if (this.scene) {
      this.scene.pause();
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
}

export default SceneManager;
