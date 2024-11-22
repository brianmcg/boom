import { GAME_ASSETS, SCENE_TYPES } from '@constants/assets';
import { SHOW_STATS, DEBUG } from '@constants/config';
import { add } from '@util/dom';
import { Application } from './core/graphics';
import { InputController } from './core/input';
import { SCREEN, LEVEL } from '@constants/config';
import TitleScene from './scenes/TitleScene';
import WorldScene from './scenes/WorldScene';
import CreditsScene from './scenes/CreditsScene';
import Loader from './util/Loader';
import Stats from './util/Stats';
import GameView from './GameView';
import './Game.css';

const SCENES = {
  [SCENE_TYPES.TITLE]: TitleScene,
  [SCENE_TYPES.WORLD]: WorldScene,
  [SCENE_TYPES.CREDITS]: CreditsScene,
};

export default class Game {
  constructor({ onLoading, onReady, onExit }) {
    this.app = new Application();
    this.onLoading = onLoading;
    this.onReady = onReady;
    this.onExit = onExit;

    if (SHOW_STATS) this.stats = new Stats();
    if (DEBUG) window.stage = this.app.stage;
  }

  async init() {
    await this.app.init({
      autoStart: false,
      width: SCREEN.WIDTH,
      height: SCREEN.HEIGHT,
    });

    this.view = new GameView({ canvas: this.app.canvas });
    this.input = new InputController(this.app.canvas);
    this.app.stage.eventMode = 'static';

    this.app.stage.on('click', () => this.lockPointer());

    this.app.ticker.add(time =>
      SHOW_STATS ? this.updateWithStats(time) : this.update(time)
    );

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.unpause();
      }
    });
  }

  async start() {
    if (SHOW_STATS) add(document.body, this.stats.view);

    this.onLoading();
    this.lockPointer();

    const { sound, data } = await Loader.load(GAME_ASSETS);

    this.soundSprite = sound;
    this.data = data;

    if (DEBUG) {
      this.showWorldScene();
    } else {
      this.showTitleScene();
    }

    this.app.start();
  }

  stop() {
    if (SHOW_STATS) this.stats.view.remove();
    this.removeScene();
    this.app.stop();
  }

  pause() {
    if (!this.scene?.isPaused()) this.music?.pause();
    if (this.app.ticker.started) this.app.ticker.stop();
  }

  unpause() {
    if (!this.scene?.isPaused()) this.music?.play();
    if (!this.app.ticker.started) this.app.ticker.start();
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
    this.showScene(SCENE_TYPES.TITLE);
  }

  showWorldScene({ index = LEVEL, ...other } = {}) {
    this.showScene(SCENE_TYPES.WORLD, {
      index,
      showLoader: true,
      id: this.data.world.levels[index],
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

      this.removeScene();

      await Loader.unload({ graphics, sound: sound.src });
    }

    if (Scene) {
      this.scene = new Scene({ game: this, ...other });
      this.app.stage.addChild(this.scene);

      const { graphics, sound, data } = await Loader.load(this.scene.assets);
      const sceneProps = this.data[type].props || {};
      const sounds = this.data[type].sounds || {};

      const props = {
        ...sceneProps,
        player: { ...sceneProps.player, ...startProps.player },
      };

      if (!sound.loop()) {
        sound.once('end', sound.unload);
      }

      sound.once('fade', sound.stop);

      this.music = sound;

      this.scene.create({ sounds, graphics, data: { ...data, props } });

      this.onReady();
    }
  }

  removeScene() {
    this.app.stage.removeChild(this.scene);
    this.scene.destroy();
    this.scene = null;
  }

  resize(scale) {
    this.app.stage.scale.set(scale);
    this.app.renderer.resize(SCREEN.WIDTH * scale, SCREEN.HEIGHT * scale);
  }

  lockPointer() {
    this.input.mouse.lockPointer();
  }

  async exit() {
    this.stop();
    await Loader.unload();
    this.onExit();
  }
}
