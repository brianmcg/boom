import { Application, Scene, util } from './components/graphics';
import { Keyboard } from './components/input';
import { SoundPlayer } from './components/audio';
import TitleScene from './scenes/TitleScene';
import WorldScene from './scenes/WorldScene';
import CreditsScene from './scenes/CreditsScene';
import { NUM_LEVELS } from './config';
import { FONT_SRC, FONT_NAME } from './constants';

/**
 * A class representing a game.
 */
class Game extends Application {
  /**
   * Create a game.
   */
  constructor() {
    super();

    this.scenes = {
      [Scene.TYPES.TITLE]: TitleScene,
      [Scene.TYPES.WORLD]: WorldScene,
      [Scene.TYPES.CREDITS]: CreditsScene,
    };

    this.keyboard = new Keyboard();
    this.sound = new SoundPlayer();
  }

  /**
   * Start the game.
   */
  start() {
    super.start();
    this.load().then(() => this.showScene(Scene.TYPES.TITLE));
  }

  /**
   * Load the game font and sound effects.
   * @return {Object} A promise that is resloved when the assets are loaded.
   */
  load() {
    this.loader.add(FONT_NAME, FONT_SRC);

    return new Promise((resolve) => {
      this.sound.loadEffects()
        .then(() => {
          this.loader.load(resolve);
        });
    });
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
          this.showScene(Scene.TYPES.CREDITS, sceneIndex + 1);
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
  showScene(sceneType, sceneIndex) {
    const SceneType = this.scenes[sceneType];
    const scaleFactor = util.getMaxScaleFactor();

    if (this.scene) {
      this.scene.destroy(true);
      this.loader.reset();
      util.clearCache();
    }

    if (SceneType) {
      this.scene = new SceneType({
        index: sceneIndex,
        loader: this.loader,
        keyboard: this.keyboard,
        ticker: this.ticker,
        sound: this.sound,
        scale: {
          x: scaleFactor,
          y: scaleFactor,
        },
      });

      this.scene.on(Scene.EVENTS.SCENE_COMPLETE, this.handleSceneComplete.bind(this));
      this.scene.on(Scene.EVENTS.SCENE_RESTART, this.handleSceneRestart.bind(this));
      this.scene.on(Scene.EVENTS.SCENE_QUIT, this.handleSceneQuit.bind(this));

      this.scene.load().then(() => {
        this.stage.addChild(this.scene);
      });
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

    this.keyboard.resetPressed();
  }
}

export default Game;
