import { Application } from './core/graphics';
import { Keyboard } from './core/input';
import { SoundPlayer } from './core/audio';
import { BLACK } from './constants/colors';
import { NUM_LEVELS, SCREEN, MAX_FPS } from './constants/config';
import { GAME_PATH } from './constants/paths';
import { SOUND_SPRITE } from './constants/sounds';
import { GAME_SOUND, GAME_DATA } from './constants/files';
import { SOUND_TYPES, DATA_TYPES } from './constants/assets';
import { getMaxScale } from './helpers';
import Scene from './scenes/Scene';
import TitleScene from './scenes/TitleScene';
import WorldScene from './scenes/WorldScene';
import CreditsScene from './scenes/CreditsScene';
import Loader from './util/Loader';

const EVENTS = { QUIT: 'game:quit' };

/**
 * A class representing a game.
 */
export default class Game extends Application {
  /**
   * The events class property.
   */
  static get EVENTS() { return EVENTS; }

  /**
   * Creates a game.
   */
  constructor() {
    super(SCREEN.WIDTH, SCREEN.HEIGHT, {
      backgroundColor: BLACK,
      autoStart: false,
    });

    this.scenes = {
      [Scene.TYPES.TITLE]: TitleScene,
      [Scene.TYPES.WORLD]: WorldScene,
      [Scene.TYPES.CREDITS]: CreditsScene,
    };

    this.assets = {
      sound: {
        src: `${GAME_PATH}/${GAME_SOUND}`,
        sprite: SOUND_SPRITE,
      },
      data: [{
        name: DATA_TYPES.FONT,
        src: `${GAME_PATH}/${GAME_DATA}`,
      }],
    };

    this.style = {
      position: 'absolute',
      left: '50%',
      top: '50%',
    };

    this.loader = Loader;
    this.sound = SoundPlayer;

    this.ticker.maxFPS = MAX_FPS;
    this.ticker.add(this.update.bind(this));

    this.resize();
  }

  /**
   * Load the game assets.
   */
  load() {
    this.loader.load(this.assets).then(({ sound }) => {
      this.sound.add('effects', sound);
      this.show(Scene.TYPES.TITLE);
    });
  }

  /**
   * Unload the game assets.
   */
  unload() {
    this.loader.unload();
  }

  /**
   * Execute a game update.
   * @param  {Number} delta The delta value.
   */
  update(delta) {
    if (this.scene) {
      this.scene.update(delta);
    }

    Keyboard.resetPressed();
  }

  /**
   * Handle the scene complete event.
   * @param  {String} sceneType  The scene type.
   * @param  {Number} sceneIndex The scene index.
   */
  onSceneComplete(sceneType, sceneIndex) {
    switch (sceneType) {
      case Scene.TYPES.TITLE:
        this.show(Scene.TYPES.WORLD, 1);
        break;
      case Scene.TYPES.WORLD:
        if (sceneIndex < NUM_LEVELS) {
          this.show(Scene.TYPES.WORLD, sceneIndex + 1);
        } else {
          this.show(Scene.TYPES.CREDITS);
        }
        break;
      default:
        this.show(Scene.TYPES.TITLE);
        break;
    }
  }

  /**
   * Handle the scene restart event.
   * @param  {String} sceneType  The scene type.
   * @param  {Number} sceneIndex The scene index.
   */
  onSceneRestart(sceneType, sceneIndex) {
    this.show(sceneType, sceneIndex);
  }

  /**
   * Handle the scene quit event.
   * @param  {String} sceneType  The scene type.
   * @param  {Number} sceneIndex The scene index.
   */
  onSceneQuit(sceneType) {
    switch (sceneType) {
      case Scene.TYPES.TITLE:
        this.scene.destroy();
        this.scene = null;
        this.emit(EVENTS.QUIT);
        break;
      default:
        this.show(Scene.TYPES.TITLE);
        break;
    }
  }

  /**
   * Resize the game
   * @param  {Number} width  The given width.
   * @param  {Number} height The given height.
   */
  resize() {
    const scale = getMaxScale(SCREEN.WIDTH, SCREEN.HEIGHT);
    const scaledWidth = SCREEN.WIDTH * scale;
    const scaledHeight = SCREEN.HEIGHT * scale;

    this.style = {
      margin: `-${scaledHeight / 2}px 0 0 -${scaledWidth / 2}px`,
    };

    if (this.scene) {
      this.scene.resize(scale);
    }

    super.resize(scaledWidth, scaledHeight);
  }

  /**
   * Show a scene.
   * @param  {String} sceneType  The scene type.
   * @param  {Number} sceneIndex The scene index.
   */
  show(sceneType, sceneIndex = 0) {
    const SceneType = this.scenes[sceneType];
    const scale = getMaxScale(SCREEN.WIDTH, SCREEN.HEIGHT);

    if (this.scene) {
      this.scene.destroy();
      this.loader.unload({ exclude: DATA_TYPES.FONT });
    }

    if (SceneType) {
      this.scene = new SceneType({
        index: sceneIndex,
        scale: { x: scale, y: scale },
      });

      this.scene.once(Scene.EVENTS.COMPLETE, this.onSceneComplete.bind(this));
      this.scene.once(Scene.EVENTS.RESTART, this.onSceneRestart.bind(this));
      this.scene.once(Scene.EVENTS.QUIT, this.onSceneQuit.bind(this));

      this.scene.on(Scene.EVENTS.PLAY_SOUND, (...options) => {
        this.sound.play(...options);
      });

      this.scene.on(Scene.EVENTS.FADE_OUT_SOUND, (...options) => {
        this.sound.fadeOut(...options);
      });

      this.scene.on(Scene.EVENTS.UNLOAD_SOUND, (options) => {
        this.sound.unload(options);
      });

      this.scene.on(Scene.EVENTS.PAUSE_SOUND, () => {
        this.sound.pause();
      });

      this.scene.on(Scene.EVENTS.RESUME_SOUND, () => {
        this.sound.resume();
      });

      this.stage.addChild(this.scene);

      this.loader.load(this.scene.assets).then(({ data, sound }) => {
        this.sound.add('music', sound);
        this.scene.create(data);
      });
    }
  }
}
