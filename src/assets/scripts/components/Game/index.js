import { Application } from './core/graphics';
import { SoundPlayer } from './core/audio';
import { BLACK } from './constants/colors';
import { NUM_LEVELS, SCREEN, MAX_FPS } from './constants/config';
import { GAME_PATH } from './constants/paths';
import { SOUND_SPRITE } from './constants/sounds';
import { GAME_SOUND, GAME_DATA } from './constants/files';
import { SOUND, DATA } from './constants/assets';
import Scene from './scenes/Scene';
import TitleScene from './scenes/TitleScene';
import WorldScene from './scenes/WorldScene';
import CreditsScene from './scenes/CreditsScene';
import Loader from './utilities/Loader';

const EVENTS = {
  STOPPED: 'game:stopped',
};

/**
 * A class representing a game.
 */
class Game extends Application {
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

    this.style = {
      position: 'absolute',
      left: '50%',
      top: '50%',
    };

    this.frameCount = 0;
    this.timer = 0;
    this.loader = new Loader();
    this.sound = new SoundPlayer();
    this.ticker.maxFPS = MAX_FPS;
    this.ticker.add(this.loop, this);
    this.numbLevels = NUM_LEVELS;
    this.resize();
  }

  /**
   * Start game and load assets.
   */
  start() {
    const assets = {
      sound: {
        name: SOUND.EFFECTS,
        src: `${GAME_PATH}/${GAME_SOUND}`,
        sprite: SOUND_SPRITE,
      },
      data: [{
        name: DATA.FONT,
        src: `${GAME_PATH}/${GAME_DATA}`,
      }],
    };

    this.scene = null;
    this.ticker.start();

    this.loader.load(assets).then(({ sound }) => {
      this.sound.add(SOUND.EFFECTS, sound);
      this.show(Scene.TYPES.TITLE);
    });
  }

  /**
   * Stop game and unload assets.
   */
  stop() {
    this.ticker.stop();
    this.scene.destroy();
    this.loader.unload();
    this.emit(EVENTS.STOPPED);
  }

  /**
   * Execute a game loop.
   * @param  {Number} delta The delta value.
   */
  loop(delta) {
    // NOTE: Uncomment below to log frame rate.

    /*
    this.timer += this.ticker.elapsedMS;
    this.frameCount += 1;

    if (this.timer >= 1000) {
      console.log(this.frameCount);
      this.timer = this.timer - 1000;
      this.frameCount = 0;
    }
    */

    if (this.scene) {
      this.scene.update(delta);
      this.scene.animate();
    }
  }

  /**
   * Show a scene.
   * @param  {String} sceneType  The scene type.
   * @param  {Number} sceneIndex The scene index.
   */
  show(sceneType, sceneIndex = 0, player) {
    const SceneType = this.scenes[sceneType];
    const scale = Game.maxScale;

    if (this.scene) {
      const { sound, data } = this.loader.cache;
      const dataKeys = Object.keys(data).filter(key => !key.includes(DATA.FONT));
      const soundKeys = Object.keys(sound).filter(key => !key.includes(SOUND.EFFECTS));

      this.scene.destroy();
      this.loader.unload({ data: dataKeys, sound: soundKeys });
    }

    if (SceneType) {
      this.scene = new SceneType({
        index: sceneIndex,
        scale: { x: scale, y: scale },
        game: this,
      });

      this.stage.addChild(this.scene);

      this.loader.load(this.scene.assets).then(({ data, sound }) => {
        this.sound.add(SOUND.MUSIC, sound);
        this.scene.create(data, player);
      });
    }
  }

  /**
   * Resize the game
   * @param  {Number} width  The given width.
   * @param  {Number} height The given height.
   */
  resize() {
    const scale = Game.maxScale;
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
   * The maximum scale factor given window size.
   */
  static get maxScale() {
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
   * The events class property.
   */
  static get EVENTS() {
    return EVENTS;
  }
}

export default Game;
