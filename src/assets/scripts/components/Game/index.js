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
  QUIT: 'game:quit',
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
    this.ticker.maxFPS = MAX_FPS;
    this.ticker.add(this.loop.bind(this));
    this.resize();
  }

  /**
   * Load the game assets.
   */
  load() {
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

    this.loader.load(assets).then(({ sound }) => {
      this.sound.add(SOUND.EFFECTS, sound);
      this.show(Scene.TYPES.WORLD, 1);
    });
  }

  /**
   * Unload the game assets.
   */
  unload() {
    this.loader.unload();
  }

  /**
   * Execute a game loop.
   * @param  {Number} delta The delta value.
   */
  loop(delta) {
    if (this.scene) {
      this.scene.update(delta);
      this.scene.animate();
    }
  }

  /**
   * Handle the scene complete event.
   * @param  {String} type  The scene type.
   * @param  {Number} index The scene index.
   */
  onSceneComplete(type, index) {
    switch (type) {
      case Scene.TYPES.TITLE: this.onTitleSceneComplete(index); break;
      case Scene.TYPES.WORLD: this.onWorldSceneComplete(index); break;
      default: this.show(Scene.TYPES.TITLE); break;
    }
  }

  /**
   * Handle the scene restart event.
   * @param  {String} type  The scene type.
   * @param  {Number} index The scene index.
   */
  onSceneRestart(type, index) {
    this.show(type, index);
  }

  /**
   * Handle the scene quit event.
   * @param  {String} type  The scene type.
   */
  onSceneQuit(type) {
    switch (type) {
      case Scene.TYPES.TITLE: this.onTitleSceneQuit(); break;
      default: this.show(Scene.TYPES.TITLE, 0); break;
    }
  }

  /**
   * Handle the title scene complete event.
   * @param  {String} type  The scene type.
   * @param  {Number} index The scene index.
   */
  onTitleSceneComplete(type, index) {
    this.show(Scene.TYPES.WORLD, index + 1);
  }

  /**
   * Handle the world scene complete event.
   * @param  {String} type  The scene type.
   * @param  {Number} index The scene index.
   */
  onWorldSceneComplete(type, index) {
    if (index < NUM_LEVELS) {
      this.show(Scene.TYPES.WORLD, index + 1);
    } else {
      this.show(Scene.TYPES.CREDITS, index + 1);
    }
  }

  /**
   * Handle the title scene quit event.
   * @param  {String} type  The scene type.
   * @param  {Number} index The scene index.
   */
  onTitleSceneQuit() {
    this.scene.destroy();
    this.emit(EVENTS.QUIT);
  }

  /**
   * Show a scene.
   * @param  {String} sceneType  The scene type.
   * @param  {Number} sceneIndex The scene index.
   */
  show(sceneType, sceneIndex = 0) {
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
        sound: this.sound,
      });

      this.scene.once(Scene.EVENTS.COMPLETE, this.onSceneComplete.bind(this));
      this.scene.once(Scene.EVENTS.RESTART, this.onSceneRestart.bind(this));
      this.scene.once(Scene.EVENTS.QUIT, this.onSceneQuit.bind(this));

      this.stage.addChild(this.scene);

      this.loader.load(this.scene.assets).then(({ data, sound }) => {
        this.sound.add(SOUND.MUSIC, sound);
        this.scene.create(data);
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
