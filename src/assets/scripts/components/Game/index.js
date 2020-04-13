import { Application } from './core/graphics';
import { SoundPlayer } from './core/audio';
import { Keyboard, Mouse } from './core/input';
import { BLACK } from './constants/colors';
import { SCREEN, MAX_FPS } from './constants/config';
import {
  GAME_PATH,
  GAME_SOUNDS,
  GAME_DATA,
  GAME_FONT,
  SCENE_MUSIC,
} from './constants/assets';
import TitleScene from './scenes/TitleScene';
import WorldScene from './scenes/WorldScene';
import CreditsScene from './scenes/CreditsScene';
import Loader from './utilities/Loader';

const EVENTS = {
  STOPPED: 'game:stopped',
  STARTED: 'game:started',
  LOADING_STARTED: 'game:loading:started',
  LOADING_COMPLETE: 'game:loading:complete',
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

    this.style = {
      position: 'absolute',
      left: '50%',
      top: '50%',
    };

    this.loader = new Loader();
    this.sound = new SoundPlayer();
    this.keyboard = new Keyboard();
    this.mouse = new Mouse({ el: this.view });

    this.ticker.maxFPS = MAX_FPS;
    this.ticker.add(this.loop, this);

    this.frameCount = 0;
    this.timer = 0;
  }

  /**
   * Add a callback to the stopped event.
   * @param  {Function} callback The callback function.
   */
  onStopped(callback) {
    this.on(EVENTS.STOPPED, callback);
  }

  /**
   * Add a callback to the loading complete event.
   * @param  {Function} callback The callback function.
   */
  onLoadingComplete(callback) {
    this.on(EVENTS.LOADING_COMPLETE, callback);
  }

  /**
   * Add a callback to the loading started event.
   * @param  {Function} callback The callback function.
   */
  onLoadingStarted(callback) {
    this.on(EVENTS.LOADING_STARTED, callback);
  }

  /**
   * Start game and load assets.
   */
  async start() {
    const { sound, data } = await this.loader.load({
      sound: {
        name: GAME_SOUNDS.NAME,
        src: `${GAME_PATH}/${GAME_SOUNDS.FILE}`,
        spriteSrc: `${GAME_PATH}/${GAME_SOUNDS.SPRITE}`,
      },
      graphics: {
        name: GAME_FONT.NAME,
        src: `${GAME_PATH}/${GAME_FONT.FILE}`,
      },
      data: {
        name: GAME_DATA,
        src: `${GAME_PATH}/${GAME_DATA}`,
      },
    });

    this.soundSprite = sound;
    this.scene = null;
    this.data = data;

    this.ticker.start();
    this.sound.add(GAME_SOUNDS.NAME, sound);

    this.showWorldScene();
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
    // NOTE: Uncomment below code to log frame rate.

    // this.timer += this.ticker.elapsedMS;
    // this.frameCount += 1;
    // if (this.timer >= 1000) {
    //   console.log(this.frameCount);
    //   this.timer = this.timer - 1000;
    //   this.frameCount = 0;
    // }

    if (this.scene) {
      this.scene.update(delta);
    }
  }

  /**
   * Show the title scene.
   */
  showTitleScene() {
    this.show(TitleScene);
  }

  /**
   * Show the world scene.
   * @param  {Number} options.index The index of the scene.
   */
  showWorldScene({ index = 1, ...other } = {}) {
    this.show(WorldScene, { index, ...other });
  }

  /**
   * Show the credits scene.
   */
  showCreditsScene() {
    this.show(CreditsScene);
  }

  /**
    * Show the scene.
    * @param  {String} options.type  The scene type.
    * @param  {Number} options.index The scene index.
    * @param  {Object} options.props Optional extra props.
    */
  async show(Scene, { index, startingProps = {} } = {}) {
    const type = Scene.name.toLowerCase().split('scene')[0];

    this.emit(EVENTS.LOADING_STARTED);

    if (this.scene) {
      const { sound, graphics } = this.loader.cache;
      const graphicsKeys = Object.keys(graphics).filter(key => !key.includes(GAME_FONT.NAME));
      const soundKeys = Object.keys(sound).filter(key => !key.includes(GAME_SOUNDS.NAME));
      const dataKeys = [];

      this.scene.destroy();

      this.loader.unload({
        graphics: graphicsKeys,
        sound: soundKeys,
        data: dataKeys,
      });
    }

    if (Scene) {
      this.scene = new Scene({
        type,
        index,
        game: this,
      });

      this.resize();

      this.stage.addChild(this.scene);

      this.stage.interactive = true;

      this.stage.on('click', () => this.lockPointer());

      const { graphics, sound, data } = await this.loader.load(this.scene.assets);

      const sceneProps = this.data[type].props || {};

      const sounds = this.data[type].sounds || {};

      const props = {
        ...sceneProps,
        player: {
          ...sceneProps.player,
          ...startingProps.player,
        },
      };

      this.sound.add(SCENE_MUSIC.NAME, sound);

      this.scene.create({
        sounds,
        graphics,
        data: {
          ...data,
          props,
        },
      });

      this.emit(EVENTS.LOADING_COMPLETE);
    }
  }

  /**
   * Resize the game
   */
  resize() {
    const windowWidth = window.innerWidth
      || document.documentElement.clientWidth
      || document.body.clientWidth;

    const windowHeight = window.innerHeight
      || document.documentElement.clientHeight
      || document.body.clientHeight;

    const widthRatio = windowWidth / SCREEN.WIDTH;
    const heightRatio = windowHeight / SCREEN.HEIGHT;
    const scale = Math.floor(Math.min(widthRatio, heightRatio)) || 1;
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
   * Lock the mouse pointer.
   */
  lockPointer() {
    this.mouse.lockPointer();
  }

  /**
   * Is the mouse pointer locked.
   * @return {Boolean}
   */
  isPointerLocked() {
    return this.mouse.isPointerLocked();
  }

  /**
   * Play a sound.
   * @param  {String} type             The type of sound.
   * @param  {String} name             The name of the sound.
   * @param  {Number} options.distance The distance from the player.
   */
  playSound(...options) {
    return this.sound.play(GAME_SOUNDS.NAME, ...options);
  }

  /**
   * Play the scene music.
   */
  playMusic() {
    this.sound.play(SCENE_MUSIC.NAME);
  }

  /**
   * Fade out the scene music.
   */
  fadeMusic() {
    this.sound.fade(SCENE_MUSIC.NAME);
  }

  /**
   * Pause all the playing sounds.
   */
  pauseSounds() {
    this.sound.pause();
  }

  /**
   * Resume all the paused sounds.
   */
  resumeSounds() {
    this.sound.resume();
  }

  /**
   * Stop all sounds.
   */
  stopSounds() {
    this.sound.stop();
  }
}

export default Game;
