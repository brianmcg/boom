import { GAME_ASSETS, SCENE_TYPES } from '@constants/assets';
import { DEBUG } from '@constants/config';
import { Application } from './core/graphics';
import { InputController } from './core/input';
import { SCREEN, LEVEL } from '@constants/config';
import TitleScene from './scenes/TitleScene';
import WorldScene from './scenes/WorldScene';
import CreditsScene from './scenes/CreditsScene';
import Loader from './util/Loader';
import LocalStorage from './util/LocalStorage';
import GameView from './GameView';
import './Game.css';

const SCENES = {
  [SCENE_TYPES.TITLE]: TitleScene,
  [SCENE_TYPES.WORLD]: WorldScene,
  [SCENE_TYPES.CREDITS]: CreditsScene,
};

export default class Game {
  constructor({ stats, onLoading, onReady, onExit }) {
    this.app = new Application();
    this.onLoading = onLoading;
    this.onReady = onReady;
    this.onExit = onExit;
    this.stats = stats;

    if (DEBUG) window.app = this.app;
  }

  async init() {
    await this.app.init({
      autoStart: false,
      hello: Boolean(DEBUG),
      width: SCREEN.WIDTH,
      height: SCREEN.HEIGHT,
    });

    this.view = new GameView({ canvas: this.app.canvas });
    this.input = new InputController(this.app.canvas);
    this.app.stage.eventMode = 'none';
    this.app.stage.cullableChildren = false;
    this.app.stage.interactiveChildren = false;

    this.app.ticker.add(time =>
      this.stats ? this.updateWithStats(time) : this.update(time)
    );

    this.app.canvas.addEventListener('click', () => this.lockPointer());

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.unpause();
      }
    });
  }

  async start() {
    this.onLoading();
    this.lockPointer();

    try {
      this.assets = await Loader.load(GAME_ASSETS);
    } catch (e) {
      console.error('ERROR', e.message);
    }

    if (DEBUG) {
      this.showWorldScene();
    } else {
      this.showTitleScene();
    }

    this.app.start();
  }

  update(ticker) {
    this.app.stage.children.forEach(child => child.update(ticker));
  }

  updateWithStats(ticker) {
    this.stats.begin();
    this.app.stage.children.forEach(child => child.update(ticker));
    this.stats.end();
  }

  showTitleScene() {
    this.showScene(SCENE_TYPES.TITLE, { data: LocalStorage.data() });
  }

  showWorldScene({ index = LEVEL, ...other } = {}) {
    const id = this.assets.data.world.levels[index];

    LocalStorage.set(index, { ...other, id, index });

    this.showScene(SCENE_TYPES.WORLD, {
      id,
      index,
      showLoader: true,
      ...other,
    });
  }

  showCreditsScene() {
    this.showScene(SCENE_TYPES.CREDITS);
  }

  async showScene(type, { startProps = {}, showLoader, ...other } = {}) {
    const Scene = SCENES[type];

    if (showLoader) this.onLoading();

    if (this.scene) {
      const { graphics, sound } = this.scene.assets;

      this.app.canvas.style.display = 'none';

      await (() => new Promise(resolve => setTimeout(() => resolve(), 0)))();

      this.removeScene();

      this.app.canvas.style.display = 'flex';

      await Loader.unload({ graphics, sound: sound.src });
    }

    if (Scene) {
      this.scene = new Scene({ game: this, ...other });
      this.app.stage.addChild(this.scene);

      try {
        this.sceneAssets = await Loader.load(this.scene.assets);
      } catch (e) {
        console.error('ERROR', e.message);
      }

      const { graphics, sound, data } = this.sceneAssets;

      const sceneProps = this.assets.data[type].props || {};
      const sounds = this.assets.data[type].sounds || {};

      const props = {
        ...sceneProps,
        player: { ...sceneProps.player, ...startProps.player },
      };

      if (!sound.loop()) {
        sound.once('end', sound.unload);
      }

      sound.once('fade', sound.stop);

      this.scene.create({ sounds, graphics, data: { ...data, props } });

      this.onReady();
    }
  }

  pause() {
    if (!this.scene?.isPaused()) this.music?.pause();
    if (this.app.ticker.started) this.app.ticker.stop();
  }

  unpause() {
    if (!this.scene?.isPaused()) this.music?.play();
    if (!this.app.ticker.started) this.app.ticker.start();
  }

  removeScene() {
    this.app.stage.removeChildren();
    this.scene.destroy({ texture: true, children: true, context: true });
    this.scene = null;
    this.sceneAssets = null;
  }

  resize(scale) {
    this.app.renderer.resize(SCREEN.WIDTH, SCREEN.HEIGHT, scale);
  }

  lockPointer() {
    if (!document.pointerLockElement) {
      this.input.mouse.lockPointer();
    }
  }

  getLevels() {
    return this.assets.data.world.levels;
  }

  getMusic() {
    return this.sceneAssets.sound;
  }

  async exit() {
    this.assets = null;
    this.removeScene();
    this.app.stop();
    await Loader.unload();

    this.onExit();
  }
}
