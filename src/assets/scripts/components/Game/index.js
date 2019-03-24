import { Application } from './core/graphics';
import { Keyboard } from './core/input';
import { BLACK } from './constants/colors';
import { NUM_LEVELS, SCREEN, MAX_FPS } from './constants/config';
import { GAME_PATH } from './constants/paths';
import { SOUND_SPRITE } from './constants/sounds';
import { SOUND_EFFECTS, MAIN_FONT } from './constants/files';
import { SOUND_TYPES, FONT_TYPES } from './constants/assets';
import Scene from './scenes/Scene';
import TitleScene from './scenes/TitleScene';
import WorldScene from './scenes/WorldScene';
import CreditsScene from './scenes/CreditsScene';
import Loader from './util/Loader';

/**
 * A class representing a game.
 */
export default class Game extends Application {
  /**
   * [description]
   * @param  {Function} options.onQuit  on quit callback.
   */
  constructor({ onQuit = () => {} }) {
    super(SCREEN.WIDTH, SCREEN.HEIGHT, {
      backgroundColor: BLACK,
      autoStart: false,
    });

    this.scenes = {
      [Scene.TYPES.TITLE]: TitleScene,
      [Scene.TYPES.WORLD]: WorldScene,
      [Scene.TYPES.CREDITS]: CreditsScene,
    };

    this.ticker.maxFPS = MAX_FPS;
    this.ticker.add(this.update.bind(this));

    this.resize(SCREEN.WIDTH, SCREEN.HEIGHT);
    this.onQuit = onQuit;
  }

  /**
   * Start the game.
   */
  run() {
    this.start();
    this.load();
  }

  /**
   * Load the game font and sound effects.
   */
  load() {
    const options = {
      sound: {
        name: SOUND_TYPES.EFFECTS,
        src: `${GAME_PATH}/${SOUND_EFFECTS}`,
        sprite: SOUND_SPRITE,
      },
      data: [{
        name: FONT_TYPES.MAIN,
        src: `${GAME_PATH}/${MAIN_FONT}`,
      }],
    };

    Loader.load(options).then(() => this.show(Scene.TYPES.TITLE));
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
        this.onQuit();
        Loader.reset();
        break;
      default:
        this.show(Scene.TYPES.TITLE);
        break;
    }
  }

  /**
   * Show a scene.
   * @param  {String} sceneType  The scene type.
   * @param  {Number} sceneIndex The scene index.
   */
  show(sceneType, sceneIndex = 0) {
    const SceneType = this.scenes[sceneType];
    const scaleFactor = Application.getMaxScaleFactor(SCREEN.WIDTH, SCREEN.HEIGHT);

    if (this.scene) {
      this.scene.destroy();
      Loader.reset({ exclude: FONT_TYPES.MAIN });
    }

    if (SceneType) {
      this.scene = new SceneType({
        index: sceneIndex,
        scale: { x: scaleFactor, y: scaleFactor },
      });

      this.scene.once(Scene.EVENTS.COMPLETE, this.onSceneComplete.bind(this));
      this.scene.once(Scene.EVENTS.RESTART, this.onSceneRestart.bind(this));
      this.scene.once(Scene.EVENTS.QUIT, this.onSceneQuit.bind(this));

      this.stage.addChild(this.scene);

      this.scene.load();
    }
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
}
