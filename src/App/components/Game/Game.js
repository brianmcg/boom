import { GAME_ASSETS, SCENE_TYPES } from '@constants/assets';
import { DEBUG } from '@constants/config';
import { Application } from './core/graphics';
import { InputController } from './core/input';
import { SCREEN, LEVEL, MAX_FPS } from '@constants/config';
import TitleScene from './scenes/TitleScene';
import WorldScene from './scenes/WorldScene';
import CreditsScene from './scenes/CreditsScene';
import Loader from './utils/Loader';
import LocalStorage from './utils/LocalStorage';
import GameView from './GameView';
import './Game.css';

const SCENES = {
  [SCENE_TYPES.TITLE]: TitleScene,
  [SCENE_TYPES.WORLD]: WorldScene,
  [SCENE_TYPES.CREDITS]: CreditsScene,
};

const FRAME_MS = 1000 / MAX_FPS;

// Fixed frame handed to every scene update, so the simulation advances at
// MAX_FPS regardless of how fast the display delivers vsyncs. deltaTime is 1.0
// at MAX_FPS, matching what Pixi's ticker reports at that rate.
const FRAME = Object.freeze({
  deltaTime: 1,
  deltaMS: FRAME_MS,
  elapsedMS: FRAME_MS,
});

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

    // Drive rendering from the fixed step below rather than from every vsync.
    this.app.ticker.remove(this.app.render, this.app);
    this.accumulator = 0;

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
    // deltaMS rather than elapsedMS: only deltaMS is clamped by the ticker's
    // minFPS guard, which bounds catch-up after a stall.
    this.accumulator += ticker.deltaMS;

    if (this.accumulator < FRAME_MS) return;

    this.step();
  }

  updateWithStats(ticker) {
    this.accumulator += ticker.deltaMS;

    if (this.accumulator < FRAME_MS) return;

    this.stats.begin();
    this.step();
    this.stats.end();
  }

  step() {
    while (this.accumulator >= FRAME_MS) {
      this.accumulator -= FRAME_MS;
      this.app.stage.children.forEach(child => child.update(FRAME));
    }

    this.app.render();
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

      this.removeScene();

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

      this.app.start();

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
    this.app.stop();
    this.app.stage.removeChildren();
    this.scene.destroy();
    this.scene = null;
    this.sceneAssets = null;

    // Pixi keeps the previous frame's instruction set on the persistent stage;
    // truncate it so stale slots stop retaining the destroyed scene's
    // containers. Safe because the stage is empty and Pixi only reads
    // `instructions` up to `instructionSize`, which resets on the next render.
    const { renderGroup } = this.app.stage;

    if (renderGroup) {
      renderGroup.instructionSet.instructions.length = 0;
    }
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
    this.removeScene();
    this.assets = null;

    await Loader.unload();

    this.onExit();
  }
}
