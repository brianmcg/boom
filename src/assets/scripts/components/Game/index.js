import { getMaxScaleFactor, clearCache } from './helpers';
import { BLACK } from './constants/colors';
import { NUM_LEVELS, SCREEN } from './constants/config';
import { FONT_FILE_PATH, SOUND_FILE_PATH } from './constants/paths';
import { FONT_TYPES } from './constants/font';
import { SOUND_SPRITE } from './constants/sounds';
import { Application } from './core/graphics';
import { Keyboard } from './core/input';
import { SoundPlayer } from './core/audio';
import Scene from './scenes/Scene';
import TitleScene from './scenes/TitleScene';
import WorldScene from './scenes/WorldScene';
import CreditsScene from './scenes/CreditsScene';

/**
 * A class representing a game.
 */
class Game extends Application {
  /**
   * Create a game.
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

    this.renderer.view.style.position = 'absolute';
    this.renderer.view.style.left = '50%';
    this.renderer.view.style.top = '50%';

    this.resize();
    this.ticker.add(this.executeLoop.bind(this));
  }

  /**
   * Start the game.
   */
  start() {
    super.start();
    this.load();
  }

  /**
   * Load the game font and sound effects.
   * @return {Object} A promise that is resloved when the assets are loaded.
   */
  load() {
    this.loader.add(FONT_TYPES.MAIN, `${FONT_FILE_PATH}/${FONT_TYPES.MAIN}.xml`);

    SoundPlayer.loadEffects({ src: `${SOUND_FILE_PATH}/effects.mp3`, sprite: SOUND_SPRITE })
      .then(() => {
        this.loader.load(this.handleLoad.bind(this));
      });
  }

  handleLoad() {
    this.showScene(Scene.TYPES.TITLE);
  }

  /**
   * Handle the scene complete event.
   * @param  {String} sceneType  The scene type.
   * @param  {Number} sceneIndex The scene index.
   */
  handleSceneComplete(sceneType, sceneIndex) {
    switch (sceneType) {
      case Scene.TYPES.TITLE:
        this.showScene(Scene.TYPES.WORLD, 1);
        break;
      case Scene.TYPES.WORLD:
        if (sceneIndex < NUM_LEVELS) {
          this.showScene(Scene.TYPES.WORLD, sceneIndex + 1);
        } else {
          this.showScene(Scene.TYPES.CREDITS);
        }
        break;
      default:
        this.showScene(Scene.TYPES.TITLE);
        break;
    }
  }

  /**
   * Handle the scene restart event.
   * @param  {String} sceneType  The scene type.
   * @param  {Number} sceneIndex The scene index.
   */
  handleSceneRestart(sceneType, sceneIndex) {
    this.showScene(sceneType, sceneIndex);
  }

  /**
   * Handle the scene quit event.
   * @param  {String} sceneType  The scene type.
   * @param  {Number} sceneIndex The scene index.
   */
  handleSceneQuit(sceneType) {
    switch (sceneType) {
      case Scene.TYPES.TITLE:
        this.showScene(null);
        break;
      default:
        this.showScene(Scene.TYPES.TITLE);
        break;
    }
  }

  /**
   * Show a scene.
   * @param  {String} sceneType  The scene type.
   * @param  {Number} sceneIndex The scene index.
   */
  showScene(sceneType, sceneIndex = 0) {
    const SceneType = this.scenes[sceneType];
    const scaleFactor = getMaxScaleFactor();

    if (this.scene) {
      this.scene.destroy(true);
      clearCache();
    }

    if (SceneType) {
      this.scene = new SceneType({
        index: sceneIndex,
        scale: {
          x: scaleFactor,
          y: scaleFactor,
        },
      });

      this.scene.on(Scene.EVENTS.SCENE_COMPLETE, this.handleSceneComplete.bind(this));
      this.scene.on(Scene.EVENTS.SCENE_RESTART, this.handleSceneRestart.bind(this));
      this.scene.on(Scene.EVENTS.SCENE_QUIT, this.handleSceneQuit.bind(this));

      this.stage.addChild(this.scene);

      this.scene.load();
    }
  }

  /**
   * Execute a game loop.
   * @param  {Number} delta The delta value.
   */
  executeLoop(delta) {
    if (this.scene) {
      this.scene.update(delta);
      this.scene.render();
    }

    Keyboard.resetPressed();
  }

  /**
   * Resize the game.
   */
  resize() {
    const scaleFactor = getMaxScaleFactor();
    const scaledWidth = SCREEN.WIDTH * scaleFactor;
    const scaledHeight = SCREEN.HEIGHT * scaleFactor;

    this.renderer.view.style.margin = `-${scaledHeight / 2}px 0 0 -${scaledWidth / 2}px`;
    this.renderer.resize(scaledWidth, scaledHeight);

    if (this.scene) {
      this.scene.resize({ x: scaleFactor, y: scaleFactor });
    }
  }
}

export default Game;
