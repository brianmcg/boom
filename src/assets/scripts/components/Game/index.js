import { Application } from './core/graphics';
import { SoundPlayer } from './core/audio';
import { Keyboard } from './core/input';
import { BLACK } from './constants/colors';
import { SCREEN, MAX_FPS } from './constants/config';
import {
  GAME_PATH,
  GAME_SOUNDS,
  GAME_DATA,
  GAME_FONT,
  SCENE_MUSIC,
} from './constants/assets';
import Scene from './scenes/Scene';
import TitleScene from './scenes/TitleScene';
import WorldScene from './scenes/WorldScene';
import CreditsScene from './scenes/CreditsScene';
import Loader from './utilities/Loader';

const EVENTS = {
  STOPPED: 'game:stopped',
  STARTED: 'game:started',
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

    this.loader = new Loader();
    this.sound = new SoundPlayer();
    this.keyboard = new Keyboard();

    this.ticker.maxFPS = MAX_FPS;
    this.ticker.add(this.loop, this);

    this.frameCount = 0;
    this.timer = 0;
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

    this.scene = null;
    this.data = data;

    this.ticker.start();
    this.sound.add(GAME_SOUNDS.NAME, sound);

    this.show(Scene.TYPES.WORLD, 1);
    this.emit(EVENTS.STARTED);
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
      this.scene.animate();
      this.keyboard.update();
    }
  }

  /**
   * Show a scene.
   * @param  {String} sceneType   The scene type.
   * @param  {Number} sceneIndex  The scene index.
   * @param  {Player} player      The player.
   */
  async show(sceneType, sceneIndex = 0, player) {
    const SceneType = this.scenes[sceneType];

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

    if (SceneType) {
      this.scene = new SceneType({
        index: sceneIndex,
        game: this,
      });

      this.resize();

      this.stage.addChild(this.scene);

      const { graphics, sound, data } = await this.loader.load(this.scene.assets);

      this.sound.add(SCENE_MUSIC, sound);

      this.scene.create({
        graphics,
        data,
        player,
      });
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
   * Play a game sound.
   * @param  {String} name The name of the sound to play.
   */
  playSound(name) {
    this.sound.play(GAME_SOUNDS.NAME, name);
  }

  /**
   * Play the scene music.
   */
  playMusic() {
    this.sound.play(SCENE_MUSIC);
  }

  /**
   * Fade out the scene music.
   */
  fadeMusic() {
    this.sound.fade(SCENE_MUSIC);
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
   * Is a key pressed on the keyboard.
   * @param  {String}  key The key.
   * @return {Boolean}
   */
  isKeyPressed(key) {
    return this.keyboard.pressed[key];
  }

  /**
   * Is a key held on the keyboard.
   * @param  {String}  key The key.
   * @return {Boolean}
   */
  isKeyHeld(key) {
    return this.keyboard.held[key];
  }

  /**
   * The events class property.
   */
  static get EVENTS() {
    return EVENTS;
  }
}

export default Game;
