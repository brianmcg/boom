import { Application, settings, SCALE_MODES } from './core/graphics';
import { InputController } from './core/input';
import { BLACK } from './constants/colors';

import {
  SCREEN,
  MUSIC_VOLUME,
  DISPLAY_FPS,
  DEBUG,
  LEVEL,
} from './constants/config';

import {
  GAME_SOUNDS,
  GAME_FONT,
  SCENE_PATHS,
  GAME_ASSETS,
} from './constants/assets';

import Spinner from './components/Spinner';
import Manual from './components/Manual';
import Stats, { PANELS } from './components/Stats';

import Loader from './utilities/Loader';
import FontLoader from './utilities/FontLoader';

import TitleScene from './scenes/TitleScene';
import WorldScene from './scenes/WorldScene';
import CreditsScene from './scenes/CreditsScene';

const SCENES = {
  [SCENE_PATHS.TITLE]: TitleScene,
  [SCENE_PATHS.WORLD]: WorldScene,
  [SCENE_PATHS.CREDITS]: CreditsScene,
};

settings.SCALE_MODE = SCALE_MODES.NEAREST;

settings.SPRITE_BATCH_SIZE = SCREEN.WIDTH * SCREEN.HEIGHT;

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

    this.stage.interactive = true;
    this.style = { position: 'absolute', left: '50%', top: '50%' };

    if (DISPLAY_FPS) {
      this.stats = new Stats();
      this.stats.showPanel(PANELS.FPS);
      document.body.appendChild(this.stats.dom);
      this.ticker.add(this.fpsLoop, this);
    } else {
      this.ticker.add(this.loop, this);
    }

    this.loader = new Loader();
    this.input = new InputController(this.view);
    this.spinner = new Spinner();
    this.manual = new Manual();

    this.manual.onClickStart(() => this.start());

    this.stage.on('click', () => this.lockPointer());

    FontLoader.load(GAME_FONT.NAME).then(() => this.addManual());
  }

  /**
   * Start game and load assets.
   */
  async start() {
    const { sound, data } = await this.loader.load(GAME_ASSETS);

    this.removeManual();
    this.addCanvas();

    this.soundSprite = sound;
    this.data = data;
    this.scene = null;

    this.ticker.start();

    if (DEBUG) {
      this.showWorldScene();
    } else {
      this.showCreditsScene();
    }
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
    if (this.scene) {
      this.scene.update(delta, this.ticker.elapsedMS);
    }
  }

  /**
   * Execute a game loop and display fps.
   * @param  {Number} delta The delta value.
   */
  fpsLoop(delta) {
    this.stats.begin();

    if (this.scene) {
      this.scene.update(delta, this.ticker.elapsedMS);
    }

    this.stats.end();
  }

  /**
   * Show the title scene.
   */
  showTitleScene() {
    this.show(SCENE_PATHS.TITLE);
  }

  /**
   * Show the world scene.
   * @param  {Number} options.index The index of the scene.
   */
  showWorldScene({ index = LEVEL, ...other } = {}) {
    this.show(SCENE_PATHS.WORLD, {
      index,
      showLoader: true,
      id: this.data.world.levels[index - 1],
      ...other,
    });
  }

  /**
   * Show the credits scene.
   */
  showCreditsScene() {
    this.show(SCENE_PATHS.CREDITS);
  }

  /**
    * Show the scene.
    * @param  {String} options.type  The scene type.
    * @param  {Number} options.index The scene index.
    * @param  {Object} options.props Optional extra props.
    */
  async show(type, { startProps = {}, showLoader, ...other } = {}) {
    const Scene = SCENES[type];

    if (showLoader) {
      this.addSpinner();
    }

    if (this.scene) {
      const { sound, graphics } = this.loader.cache;

      this.scene.destroy();

      this.loader.unload({
        graphics: Object.keys(graphics).filter(key => !key.includes(GAME_FONT.NAME)),
        sound: Object.keys(sound).filter(key => !key.includes(GAME_SOUNDS.NAME)),
        data: [],
      });
    }

    if (Scene) {
      this.scene = new Scene({ game: this, ...other });

      this.resize();
      this.stage.addChild(this.scene);

      const { graphics, sound, data } = await this.loader.load(this.scene.assets);
      const sceneProps = this.data[type].props || {};
      const sounds = this.data[type].sounds || {};
      const props = { ...sceneProps, player: { ...sceneProps.player, ...startProps.player } };

      this.music = sound;
      this.music.volume(MUSIC_VOLUME);

      if (!this.music.isLoop) {
        this.music.on('end', () => {
          this.music.ended = true;
        });
      }

      this.scene.create({ sounds, graphics, data: { ...data, props } });

      this.removeSpinner();
    }
  }

  /**
   * Resize the game
   */
  resize() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const widthRatio = windowWidth / SCREEN.WIDTH;
    const heightRatio = windowHeight / SCREEN.HEIGHT;
    const scale = Math.floor((Math.min(widthRatio, heightRatio))) || 1;
    const width = SCREEN.WIDTH * scale;
    const height = SCREEN.HEIGHT * scale;

    this.style = { margin: `-${height / 2}px 0 0 -${width / 2}px` };

    this.spinner.resize(scale);

    if (this.scene) {
      this.scene.resize(scale);
    }

    super.resize(width, height);
  }

  /**
   * Lock the mouse pointer.
   */
  lockPointer() {
    this.input.mouse.lockPointer();
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
