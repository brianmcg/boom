import { Application, TextureCache, DataLoader } from '~/core/graphics';
import { Keyboard } from '~/core/input';
import { SoundPlayer } from '~/core/audio';
import { BLACK } from './constants/colors';
import { NUM_LEVELS, SCREEN } from './constants/config';
import { GAME_PATH, SCENE_PATH } from './constants/paths';
import { FONT_TYPES } from './constants/font';
import { SOUND_SPRITE } from './constants/sounds';
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
    this.ticker.add(this.update.bind(this));
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
   */
  load(scene) {
    if (scene) {
      return Promise.all([
        SoundPlayer.loadMusic(`${SCENE_PATH}/${scene.path}/scene.mp3`),
        DataLoader.load([['scene', `${SCENE_PATH}/${scene.path}/scene.json`]]),
      ]).then(responses => scene.create(responses[1]));
    }

    return Promise.all([
      SoundPlayer.loadEffects({ src: `${GAME_PATH}/sounds.mp3`, sprite: SOUND_SPRITE }),
      DataLoader.load([[FONT_TYPES.MAIN, `${GAME_PATH}/${FONT_TYPES.MAIN}.xml`]]),
    ]).then(this.show.bind(this, Scene.TYPES.TITLE));
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
        this.show(null);
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
    const scaleFactor = Game.getMaxScaleFactor();

    if (this.scene) {
      this.scene.destroy(true);
      Game.clearCache({ exclude: FONT_TYPES.MAIN });
    }

    if (SceneType) {
      this.scene = new SceneType({
        loader: this.dataLoader,
        index: sceneIndex,
        scale: {
          x: scaleFactor,
          y: scaleFactor,
        },
      });

      this.scene.once(Scene.EVENTS.COMPLETE, this.onSceneComplete.bind(this));
      this.scene.once(Scene.EVENTS.RESTART, this.onSceneRestart.bind(this));
      this.scene.once(Scene.EVENTS.QUIT, this.onSceneQuit.bind(this));

      this.stage.addChild(this.scene);

      this.load(this.scene);
    }
  }

  /**
   * Execute a game update.
   * @param  {Number} delta The delta value.
   */
  update(delta) {
    if (this.scene) {
      this.scene.update(delta, this.ticker.elapsedMS);
    }

    Keyboard.resetPressed();
  }

  /**
   * Resize the game.
   */
  resize() {
    const scaleFactor = Game.getMaxScaleFactor();
    const scaledWidth = SCREEN.WIDTH * scaleFactor;
    const scaledHeight = SCREEN.HEIGHT * scaleFactor;

    this.renderer.view.style.margin = `-${scaledHeight / 2}px 0 0 -${scaledWidth / 2}px`;
    this.renderer.resize(scaledWidth, scaledHeight);

    if (this.scene) {
      this.scene.resize({ x: scaleFactor, y: scaleFactor });
    }
  }

  /**
   * Get the max scale of the canvas that fits window.
   * @return {Number} The maximum scale factor.
   */
  static getMaxScaleFactor() {
    const windowWidth = window.innerWidth
      || document.documentElement.clientWidth
      || document.body.clientWidth;

    const windowHeight = window.innerHeight
      || document.documentElement.clientHeight
      || document.body.clientHeight;

    const widthRatio = windowWidth / SCREEN.WIDTH;
    const heightRatio = windowHeight / SCREEN.HEIGHT;

    return Math.floor(Math.min(widthRatio, heightRatio)) || 1;
  }

  /**
   * Clear the texture cache
   * @param  {String} options.exclude Key name to exclude from operation.
   */
  static clearCache({ exclude }) {
    Object.keys(TextureCache).forEach((key) => {
      if (TextureCache[key] && !key.includes(exclude)) {
        TextureCache[key].destroy(true);
      }
    });
  }
}

export default Game;
