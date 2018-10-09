import { Application, Scene, util } from 'game/components/graphics';
import { Keyboard } from 'game/components/input';
import TitleScene from './scenes/TitleScene';
import WorldScene from './scenes/WorldScene';
import CreditsScene from './scenes/CreditsScene';
import { SCREEN, NUM_LEVELS } from './config';

/**
 * A class representing a game.
 */
class Game extends Application {
  /**
   * Create a game.
   */
  constructor() {
    super(SCREEN.WIDTH, SCREEN.HEIGHT);

    this.scenes = {
      [Scene.TYPES.TITLE]: TitleScene,
      [Scene.TYPES.WORLD]: WorldScene,
      [Scene.TYPES.CREDITS]: CreditsScene,
    };

    this.keyboard = new Keyboard();

    this.resize();

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
        this.showScene(Scene.TYPES.WORLD, 0);
        break;
      case Scene.TYPES.WORLD:
        if (sceneIndex < NUM_LEVELS - 1) {
          this.showScene(Scene.TYPES.WORLD, sceneIndex + 1);
        } else {
          this.showScene(Scene.TYPES.CREDITS);
        }
        break;
      default: {
        this.showScene(Scene.TYPES.TITLE);
      }
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
      default: {
        this.showScene(Scene.TYPES.TITLE);
      }
    }
  }

  /**
   * Show a scene.
   * @param  {String} sceneType  The scene type.
   * @param  {Number} sceneIndex The scene index.
   */
  showScene(sceneType, sceneIndex) {
    const SceneType = this.scenes[sceneType];
    const scale = util.getScale(SCREEN);

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
        scale: {
          x: scale.factor,
          y: scale.factor,
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
