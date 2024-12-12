import translate from '@util/translate';
import { KEYS } from '@game/core/input';
import { Container, GraphicsCreator } from '@game/core/graphics';
import { SoundSpriteController } from '@game/core/audio';
import { MUSIC_VOLUME } from '@constants/config';
import { parse } from './parsers';
import MainContainer from './containers/MainContainer';
import MenuContainer from './containers/MenuContainer';
import PromptContainer from './containers/PromptContainer';
import Menu from './Menu';

import {
  STATES,
  PAUSE_INCREMENT,
  FADE_INCREMENT,
  FADE_PIXEL_SIZE,
  PAUSE_PIXEL_SIZE,
} from './constants';

export default class Scene extends Container {
  constructor({ game }) {
    super();

    this.game = game;

    this.mainContainer = new MainContainer();

    this.menu = new Menu([
      {
        label: translate('scene.menu.quit'),
        zOrder: 1,
        action: () => this.onSelectQuit(),
      },
    ]);

    this.game.input.add(STATES.PAUSED, {
      onKeyDown: {
        [KEYS.UP_ARROW]: () => this.onMenuHighlightPrevious(),
        [KEYS.DOWN_ARROW]: () => this.onMenuHighlightNext(),
        [KEYS.SPACE]: () => this.onHideMenu(),
        [KEYS.Q]: () => this.onHideMenu(),
        [KEYS.W]: () => this.onMenuHighlightPrevious(),
        [KEYS.S]: () => this.onMenuHighlightNext(),
        [KEYS.ENTER]: () => this.onMenuSelect(),
        [KEYS.E]: () => this.onMenuSelect(),
      },
    });

    this.game.input.add(STATES.RUNNING, {
      onKeyDown: {
        [KEYS.Q]: () => this.onShowMenu(),
        [KEYS.ENTER]: () => this.onShowMenu(),
      },
    });

    this.game.input.add(STATES.PROMPTING, {
      onKeyDown: {
        [KEYS.ENTER]: () => this.onPromptInput(),
        [KEYS.E]: () => this.onPromptInput(),
        [KEYS.Q]: () => this.onPromptInput(),
      },
    });

    this.stopMusicOnPause = true;

    this.setLoading();
  }

  onPromptInput() {
    this.soundController.emitSound(this.sounds.complete);
    this.setFadingOut();
  }

  onSelectQuit() {
    this.onStop = () => this.game.exit();
    this.setFadingOut();
  }

  onMenuHighlightNext() {
    this.soundController.emitSound(this.sounds.highlight);
    this.menu.highlightNext();
  }

  onMenuHighlightPrevious() {
    this.soundController.emitSound(this.sounds.highlight);
    this.menu.highlightPrevious();
  }

  onMenuSelect() {
    const action = this.menu.select();
    this.soundController.emitSound(this.sounds.pause);

    if (action) {
      this.menuContainer.once('removed', action);
      this.setUnpausing();
    }
  }

  onShowMenu() {
    this.menu.reset();
    this.addChild(this.menuContainer);
    this.setPausing();
  }

  onHideMenu() {
    this.soundController.emitSound(this.sounds.pause);

    this.menuContainer.once('removed', () => this.setRunning());
    this.setUnpausing();
  }

  create({ graphics, sounds }) {
    const text = {
      menu: this.menu.options.reduce(
        (memo, { id, label }) => ({ ...memo, [id]: label }),
        {}
      ),
      prompt: this.promptOption,
    };

    const { sprites } = parse({ graphics, text });

    this.sounds = sounds;

    this.menuContainer = new MenuContainer({
      menu: this.menu,
      sprites: sprites.menu,
    });

    this.promptContainer = new PromptContainer(
      sprites.prompt,
      this.sounds.complete
    );

    this.soundController = new SoundSpriteController({
      sounds: Object.values(this.sounds),
      soundSprite: this.game.assets.sound,
    });

    this.setFadingIn();
  }

  update(ticker) {
    switch (this.state) {
      case STATES.FADING_IN:
        this.updateFadingIn(ticker);
        break;
      case STATES.RUNNING:
        this.updateRunning(ticker);
        break;
      case STATES.PAUSING:
        this.updatePausing(ticker);
        break;
      case STATES.PAUSED:
        this.updatePaused(ticker);
        break;
      case STATES.UNPAUSING:
        this.updateUnpausing(ticker);
        break;
      case STATES.FADING_OUT:
        this.updateFadingOut(ticker);
        break;
      default:
        break;
    }

    super.update(ticker);
  }

  updateFadingIn(ticker) {
    this.fadeAmount -= FADE_INCREMENT * ticker.deltaTime;

    if (this.fadeAmount <= 0) {
      this.fadeAmount = 0;
      this.setRunning();
    }

    this.fade(this.fadeAmount, {
      pixelSize: FADE_PIXEL_SIZE,
    });
  }

  updateRunning() {
    this.setPrompting();
  }

  updatePausing(ticker) {
    this.fadeAmount += PAUSE_INCREMENT * ticker.deltaTime;

    if (this.fadeAmount >= 1) {
      this.fadeAmount = 1;
      this.setPaused();
    }

    this.fade(this.fadeAmount, {
      pixelSize: PAUSE_PIXEL_SIZE,
    });
  }

  updatePaused() {
    this.fade(this.fadeAmount, {
      pixelSize: PAUSE_PIXEL_SIZE,
    });
  }

  updateUnpausing(ticker) {
    this.fadeAmount -= PAUSE_INCREMENT * ticker.deltaTime;

    if (this.fadeAmount <= 0) {
      this.fadeAmount = 0;
      this.removeChild(this.menuContainer);
    }

    this.fade(this.fadeAmount, {
      pixelSize: PAUSE_PIXEL_SIZE,
    });
  }

  updateFadingOut(ticker) {
    this.fadeAmount += FADE_INCREMENT * ticker.deltaTime;

    if (this.fadeAmount >= 1) {
      this.fadeAmount = 1;
      return this.setStopped();
    }

    this.fade(this.fadeAmount, {
      pixelSize: FADE_PIXEL_SIZE,
    });
  }

  setLoading() {
    return this.setState(STATES.LOADING);
  }

  setFadingIn() {
    const isStateChanged = this.setState(STATES.FADING_IN);

    if (isStateChanged) {
      this.addChild(this.mainContainer);
      this.fadeAmount = 1;
    }

    return isStateChanged;
  }

  setRunning() {
    const isStateChanged = this.setState(STATES.RUNNING);

    if (isStateChanged) {
      const music = this.game.getMusic();

      this.play();

      if (music.isLoaded() && !music.playing()) {
        music.play();
      }
    }

    return isStateChanged;
  }

  setPausing() {
    const isStateChanged = this.setState(STATES.PAUSING);

    if (isStateChanged) {
      this.pause();
      this.soundController.emitSound(this.sounds.pause);
      this.fadeAmount = 0;

      if (this.stopMusicOnPause) {
        this.game.getMusic().pause();
      }
    }

    return isStateChanged;
  }

  setPaused() {
    return this.setState(STATES.PAUSED);
  }

  setUnpausing() {
    return this.setState(STATES.UNPAUSING);
  }

  setPrompting() {
    const isStateChanged = this.setState(STATES.PROMPTING);

    if (isStateChanged) {
      this.addChild(this.promptContainer);
    }

    return isStateChanged;
  }

  setFadingOut() {
    const isStateChanged = this.setState(STATES.FADING_OUT);

    if (isStateChanged) {
      this.game.getMusic().fade(MUSIC_VOLUME, 0, 750);
      this.stop();
    }

    return isStateChanged;
  }

  setStopped() {
    const isStateChanged = this.setState(STATES.STOPPED);

    if (isStateChanged) {
      this.onStop();
    }

    return isStateChanged;
  }

  isRunning() {
    return this.state === STATES.RUNNING;
  }

  isPaused() {
    return this.state === STATES.PAUSED;
  }

  isPrompting() {
    return this.state === STATES.PROMPTING;
  }

  resize(scale) {
    if (this.state !== STATES.STOPPED) {
      this.scale.set(scale);
    }
  }

  setState(state) {
    const isStateChanged = super.setState(state);

    if (isStateChanged) {
      this.game.input.set(state);
    }

    return isStateChanged;
  }

  moveX(x) {
    this.x = x * this.scale.x;
  }

  moveY(y) {
    this.y = y * this.scale.y;
  }

  getStageScale() {
    return this.parent.scale.x;
  }

  destroy(options) {
    super.destroy(options);

    GraphicsCreator.clear();

    this.game.input.reset();
    this.soundController.stopSound(name);
    this.soundController.stop();

    this.removeChild(this.mainContainer);
    this.removeChild(this.menuContainer);
    this.removeChild(this.promptContainer);

    this.mainContainer.destroy(options);
    this.menuContainer.destroy(options);
    this.promptContainer.destroy(options);

    this.menu.destroy();

    this.menu = null;
    this.mainContainer = null;
    this.menuContainer = null;
    this.promptContainer = null;
    this.soundController = null;
    this.sounds = null;
    this.menu = null;
    this.game = null;
    this.onSelectQuit = null;
    this.onMenuHighlightPrevious = null;
    this.onMenuHighlightNext = null;
    this.onHideMenu = null;
    this.onMenuHighlightPrevious = null;
    this.onMenuSelect = null;
    this.onShowMenu = null;
    this.onPromptInput = null;
  }
}
