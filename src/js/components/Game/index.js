import { Application } from './core/graphics';
import { InputController } from './core/input';

import { BLACK } from './constants/colors';
import { SCREEN, SHOW_STATS, LEVEL, DEBUG } from './constants/config';
import { GAME_ASSETS } from './constants/assets';

import Spinner from './components/Spinner';
import Manual from './components/Manual';
import Stats from './components/Stats';

import Loader from './utilities/Loader';

import TitleScene, { TITLE_PATH } from './scenes/TitleScene';
import WorldScene, { WORLD_PATH } from './scenes/WorldScene';
import CreditsScene, { CREDITS_PATH } from './scenes/CreditsScene';

const SCENES = {
  [TITLE_PATH]: TitleScene,
  [WORLD_PATH]: WorldScene,
  [CREDITS_PATH]: CreditsScene,
};

/**
 * A class representing a game.
 */
class Game extends Application {
  /**
   * Creates a game.
   */
  constructor() {
    super(SCREEN.WIDTH, SCREEN.HEIGHT, { backgroundColor: BLACK });

    this.style = { position: 'absolute', left: '50%', top: '50%' };

    if (SHOW_STATS) {
      this.stats = new Stats();
      document.body.appendChild(this.stats.dom);
      this.ticker.add(this.statsLoop, this);
    } else {
      this.ticker.add(this.loop, this);
    }

    this.input = new InputController(this.view);
    this.spinner = new Spinner();
    this.manual = new Manual();

    this.manual.onClickStart(() => this.onStart());

    this.stage.on('click', () => this.lockPointer());

    this.addManual();

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.unpause();
      } else {
        this.pause();
      }
    });
  }

  /**
   * Start game and load assets.
   */
  async onStart() {
    const { sound, data } = await Loader.load(GAME_ASSETS);

    this.removeManual();
    this.addCanvas();

    this.soundSprite = sound;
    this.data = data;

    this.start();
    this.onResize();

    if (DEBUG) {
      this.showWorldScene();
    } else {
      this.showWorldScene();
    }
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
  statsLoop(delta) {
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
    this.showScene(TITLE_PATH);
  }

  /**
   * Show the world scene.
   * @param  {Number} options.index The index of the scene.
   */
  showWorldScene({ index = LEVEL, ...other } = {}) {
    this.showScene(WORLD_PATH, {
      index,
      showLoader: true,
      id: this.data.world.levels[index],
      ...other,
    });
  }

  /**
   * Show the credits scene.
   */
  showCreditsScene() {
    this.showScene(CREDITS_PATH);
  }

  /**
   * Show the scene.
   * @param  {String} options.type  The scene type.
   * @param  {Number} options.index The scene index.
   * @param  {Object} options.props Optional extra props.
   */
  async showScene(type, { startProps = {}, showLoader, ...other } = {}) {
    const Scene = SCENES[type];

    if (showLoader) {
      this.addSpinner();
    }

    if (this.scene) {
      const { graphics, sound } = this.scene.assets;

      this.removeScene();

      await Loader.unload({ graphics, sound: sound.src });
    }

    if (Scene) {
      this.scene = new Scene({ game: this, ...other });
      this.stage.addChild(this.scene);

      const { graphics, sound, data } = await Loader.load(this.scene.assets);
      const sceneProps = this.data[type].props || {};
      const sounds = this.data[type].sounds || {};
      const props = { ...sceneProps, player: { ...sceneProps.player, ...startProps.player } };

      if (!sound.loop()) {
        sound.once('end', () => sound.unload());
      }

      sound.once('fade', () => sound.stop());

      this.music = sound;

      this.scene.create({ sounds, graphics, data: { ...data, props } });

      this.removeSpinner();
    }
  }

  pause() {
    if (this.music) this.music.pause();
    if (this.ticker.started) this.stop();
  }

  unpause() {
    if (this.music) this.music.play();
    if (!this.ticker.started) this.start();
  }

  /**
   * Remove the current scene.
   */
  removeScene() {
    this.stage.removeChild(this.scene);
    this.scene.destroy();
    delete this.scene;
  }

  /**
   * Stop game and unload assets.
   */
  quit() {
    this.removeCanvas();
    this.addManual();
    this.stop();
    this.removeScene();
    Loader.unload();
  }

  /**
   * Resize the game
   */
  onResize() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const widthRatio = windowWidth / SCREEN.WIDTH;
    const heightRatio = windowHeight / SCREEN.HEIGHT;
    const scale = Math.floor(Math.min(widthRatio, heightRatio)) || 1;
    const width = SCREEN.WIDTH * scale;
    const height = SCREEN.HEIGHT * scale;

    this.style = { margin: `-${height / 2}px 0 0 -${width / 2}px` };

    this.spinner.resize(scale);

    this.stage.scale.set(scale);

    super.onResize(width, height);
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
