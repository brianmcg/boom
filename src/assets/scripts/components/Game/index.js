import { Application } from './core/graphics';
import { InputController } from './core/input';
import { BLACK } from './constants/colors';
import { SCREEN } from './constants/config';
import {
  GAME_PATH,
  GAME_SOUNDS,
  GAME_DATA,
  GAME_FONT,
  SCENE_TYPES,
} from './constants/assets';
import TitleScene from './scenes/TitleScene';
import WorldScene from './scenes/WorldScene';
import CreditsScene from './scenes/CreditsScene';
import Loader from './utilities/Loader';
import Spinner from './components/Spinner';
import Manual from './components/Manual';

const SCENES = {
  [SCENE_TYPES.TITLE]: TitleScene,
  [SCENE_TYPES.WORLD]: WorldScene,
  [SCENE_TYPES.CREDITS]: CreditsScene,
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
    });

    this.style = {
      position: 'absolute',
      left: '50%',
      top: '50%',
    };

    // this.ticker.maxFPS = MAX_FPS;
    this.ticker.add(this.loop, this);
    this.frameCount = 0;
    this.timer = 0;

    this.loader = new Loader();
    this.input = new InputController(this.view);
    this.spinner = new Spinner();
    this.manual = new Manual();
    this.manual.onClickStart(this.start.bind(this));
    this.addManual();
    // this.addCanvas();
    // this.start();
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

    this.removeManual();
    this.addCanvas();

    this.soundSprite = sound;
    this.scene = null;
    this.data = data;

    this.ticker.start();

    this.showTitleScene();
  }

  /**
   * Stop game and unload assets.
   */
  stop() {
    this.removeCanvas();
    this.addManual();
    this.ticker.stop();
    this.scene.destroy();
    this.loader.unload();
  }

  /**
   * Execute a game loop.
   * @param  {Number} delta The delta value.
   */
  loop(delta) {
    // NOTE: Uncomment below code to log frame rate in console.
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
    this.show(SCENE_TYPES.TITLE);
  }

  /**
   * Show the world scene.
   * @param  {Number} options.index The index of the scene.
   */
  showWorldScene({ index = 1, ...other } = {}) {
    this.show(SCENE_TYPES.WORLD, { index, showLoader: true, ...other });
  }

  /**
   * Show the credits scene.
   */
  showCreditsScene() {
    this.show(SCENE_TYPES.CREDITS);
  }

  /**
    * Show the scene.
    * @param  {String} options.type  The scene type.
    * @param  {Number} options.index The scene index.
    * @param  {Object} options.props Optional extra props.
    */
  async show(type, { index, startingProps = {}, showLoader } = {}) {
    const Scene = SCENES[type];

    if (showLoader) {
      this.addSpinner();
    }

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

      this.music = sound;
      this.music.volume(0.2);

      this.scene.create({
        sounds,
        graphics,
        data: {
          ...data,
          props,
        },
      });

      this.removeSpinner();
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

    this.spinner.resize(scale);

    if (this.scene) {
      this.scene.resize(scale);
    }

    super.resize(scaledWidth, scaledHeight);
  }

  /**
   * Lock the mouse pointer.
   */
  lockPointer() {
    this.input.mouse.lockPointer();
  }

  /**
   * Is the mouse pointer locked.
   * @return {Boolean}
   */
  isPointerLocked() {
    return this.input.mouse.isPointerLocked();
  }

  /**
   * Add the spinner.
   */
  addSpinner() {
    document.body.appendChild(this.spinner.view);
  }

  /**
   * Remove the spinner.
   */
  removeSpinner() {
    if (document.contains(this.spinner.view)) {
      document.body.removeChild(this.spinner.view);
    }
  }

  /**
   * Add the game canvas.
   */
  addCanvas() {
    document.body.appendChild(this.view);
    this.lockPointer();
  }

  /**
   * Remove the game canvas.
   */
  removeCanvas() {
    if (document.contains(this.view)) {
      document.body.removeChild(this.view);
    }
  }

  /**
   * Add the game manual.
   */
  addManual() {
    document.body.appendChild(this.manual.view);
  }

  /**
   * Remove the game manual.
   */
  removeManual() {
    if (document.contains(this.manual.view)) {
      document.body.removeChild(this.manual.view);
    }
  }
}

export default Game;
