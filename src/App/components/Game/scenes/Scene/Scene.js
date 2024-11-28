import { KEYS } from '@game/core/input';
import { Container, GraphicsCreator } from '@game/core/graphics';
import { SoundSpriteController } from '@game/core/audio';
import { MUSIC_VOLUME } from '@constants/config';
import { parse } from './parsers';
import MainContainer from './containers/MainContainer';
import MenuContainer from './containers/MenuContainer';
import PromptContainer from './containers/PromptContainer';

import {
  STATES,
  EVENTS,
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

    this.game.input.add(STATES.PAUSED, {
      onKeyDown: {
        [KEYS.Q]: () => this.hideMenu(),
        [KEYS.UP_ARROW]: () => this.menuHighlightPrevious(),
        [KEYS.DOWN_ARROW]: () => this.menuHighlightNext(),
        [KEYS.ENTER]: () => this.menuSelect(),
      },
    });

    this.game.input.add(STATES.RUNNING, {
      onKeyDown: {
        [KEYS.Q]: () => this.showMenu(),
      },
    });

    this.game.input.add(STATES.PROMPTING, {
      onKeyDown: {
        [KEYS.SPACE]: () => this.onPromptInput(),
      },
    });

    this.setLoading();
  }

  create({ graphics, sounds }) {
    const text = {
      menu: this.menu.map(item => item.label),
      prompt: this.promptOption,
    };

    const { sprites } = parse({ graphics, text });

    this.sounds = sounds;

    this.menuContainer = new MenuContainer(sprites.menu);

    this.menuContainer.onSelect(index => this.menu[index].action());

    this.menuContainer.onClose(() => this.setRunning());

    this.promptContainer = new PromptContainer(
      sprites.prompt,
      this.sounds.complete
    );

    this.soundController = new SoundSpriteController({
      sounds: Object.values(this.sounds),
      soundSprite: this.game.soundSprite,
    });

    this.setFadingIn();
  }

  onPromptInput() {
    this.soundController.emitSound(this.sounds.complete);
    this.triggerComplete();
  }

  update(ticker) {
    switch (this.state) {
      case STATES.FADING_IN:
        this.updateFadingIn(ticker.deltaTime);
        break;
      case STATES.RUNNING:
        this.updateRunning(ticker);
        break;
      case STATES.PAUSING:
        this.updatePausing(ticker.deltaTime);
        break;
      case STATES.PAUSED:
        this.updatePaused();
        break;
      case STATES.UNPAUSING:
        this.updateUnpausing(ticker.deltaTime);
        break;
      case STATES.FADING_OUT:
        this.updateFadingOut(ticker.deltaTime);
        break;
      default:
        break;
    }

    super.update(ticker);
  }

  updateFadingIn(deltaTime) {
    this.fadeAmount -= FADE_INCREMENT * deltaTime;

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

  updatePausing(deltaTime) {
    this.fadeAmount += PAUSE_INCREMENT * deltaTime;

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

  updateUnpausing(deltaTime) {
    this.fadeAmount -= PAUSE_INCREMENT * deltaTime;

    if (this.fadeAmount <= 0) {
      this.fadeAmount = 0;
      this.removeChild(this.menuContainer);
    }

    this.fade(this.fadeAmount, {
      pixelSize: PAUSE_PIXEL_SIZE,
    });
  }

  updateFadingOut(deltaTime) {
    this.fadeAmount += FADE_INCREMENT * deltaTime;

    if (this.fadeAmount >= 1) {
      this.fadeAmount = 1;
      this.setStopped();
    }

    this.fade(this.fadeAmount, {
      pixelSize: FADE_PIXEL_SIZE,
    });
  }

  menuHighlightNext() {
    this.soundController.emitSound(this.sounds.highlight);
    this.menuContainer.highlightNext();
  }

  menuHighlightPrevious() {
    this.soundController.emitSound(this.sounds.highlight);
    this.menuContainer.highlightPrevious();
  }

  menuSelect() {
    this.menuContainer.select();
    this.hideMenu();
  }

  showMenu() {
    this.addChild(this.menuContainer);
    this.setPausing();
  }

  hideMenu() {
    this.setUnpausing();
  }

  getStageScale() {
    return this.parent.scale.x;
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
      this.play();

      if (this.game.music.isLoaded()) {
        this.game.music.play();
      }
    }

    return isStateChanged;
  }

  setPausing() {
    const isStateChanged = this.setState(STATES.PAUSING);

    if (isStateChanged) {
      this.pause();
      this.game.music.pause();
      this.soundController.emitSound(this.sounds.pause);
      this.fadeAmount = 0;
    }

    return isStateChanged;
  }

  setPaused() {
    return this.setState(STATES.PAUSED);
  }

  setUnpausing() {
    const isStateChanged = this.setState(STATES.UNPAUSING);

    if (isStateChanged) {
      this.soundController.emitSound(this.sounds.pause);
    }

    return isStateChanged;
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
      this.stop();
      this.game.music.fade(MUSIC_VOLUME, 0, 750);
    }

    return isStateChanged;
  }

  setStopped() {
    const isStateChanged = this.setState(STATES.STOPPED);

    if (isStateChanged) {
      this.game.app.renderer.clear();

      switch (this.stopEvent) {
        case EVENTS.COMPLETE:
          this.complete();
          break;
        case EVENTS.RESTART:
          this.restart();
          break;
        case EVENTS.QUIT:
          this.quit();
          break;
        default:
          break;
      }
    }

    return isStateChanged;
  }

  moveX(x) {
    this.x = x * this.scale.x;
  }

  moveY(y) {
    this.y = y * this.scale.y;
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

  triggerComplete() {
    this.setStopEvent(EVENTS.COMPLETE);
    this.setFadingOut();
  }

  triggerRestart() {
    this.setStopEvent(EVENTS.RESTART);
    this.setFadingOut();
  }

  triggerQuit() {
    this.setStopEvent(EVENTS.QUIT);
    this.setFadingOut();
  }

  resize(scale) {
    if (this.state !== STATES.STOPPED) {
      this.scale.set(scale);
    }
  }

  setStopEvent(stopEvent) {
    this.stopEvent = stopEvent;
  }

  setState(state) {
    const isStateChanged = super.setState(state);

    if (isStateChanged) {
      this.game.input.set(state);
    }

    return isStateChanged;
  }

  destroy(options) {
    this.game.input.reset();

    this.removeChild(this.mainContainer);
    this.removeChild(this.menuContainer);
    this.removeChild(this.promptContainer);

    this.mainContainer.destroy(options);
    this.menuContainer.destroy(options);
    this.promptContainer.destroy(options);

    GraphicsCreator.clear();

    super.destroy(options);
  }
}
