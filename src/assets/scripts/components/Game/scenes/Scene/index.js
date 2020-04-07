import { KEYS } from 'game/core/input';
import { Container } from 'game/core/graphics';
import { SCENE_MUSIC, SCENE_GRAPHICS, SCENE_PATH } from 'game/constants/assets';
import { parse } from './parsers';
import LoadingContainer from './containers/LoadingContainer';
import MainContainer from './containers/MainContainer';
import MenuContainer from './containers/MenuContainer';
import PromptContainer from './containers/PromptContainer';

const STATES = {
  LOADING: 'loading',
  FADING_IN: 'fading:in',
  FADING_OUT: 'fading:out',
  PAUSING: 'scene:pausing',
  PAUSED: 'paused',
  UNPAUSING: 'scene:unpausing',
  RUNNING: 'running',
  PROMPTING: 'prompting',
  STOPPED: 'stopped',
};

const EVENTS = {
  COMPLETE: 'scene:complete',
  RESTART: 'scene:restart',
  QUIT: 'scene:quit',
};

const PAUSE_INCREMENT = 0.1;

const FADE_INCREMENT = 0.05;

const FADE_PIXEL_SIZE = 80;

const PAUSE_PIXEL_SIZE = 8;

/**
 * Class representing a scene.
 * @class
 */
class Scene extends Container {
  /**
   * Create a Scene.
   * @param  {Number} options.index   The index of the scene.
   * @param  {String} options.type    The type of scene.
   * @param  {String} options.game    The game running the scene.
   */
  constructor({
    index,
    type,
    game,
    loopMusic = true,
  }) {
    super();

    this.index = index;
    this.type = type;
    this.game = game;

    this.loadingContainer = new LoadingContainer();
    this.mainContainer = new MainContainer();

    this.path = `${type}${index ? `/${index}` : ''}`;

    this.assets = {
      sound: {
        name: SCENE_MUSIC.NAME,
        src: `${SCENE_PATH}/${this.path}/${SCENE_MUSIC.FILE}`,
        loop: loopMusic,
      },
      graphics: {
        name: SCENE_GRAPHICS,
        src: `${SCENE_PATH}/${this.path}/${SCENE_GRAPHICS}`,
      },
    };

    this.setLoading();
  }

  /**
   * Create the scene.
   * @param  {Object} options.graphics The scene graphics.
   * @param  {Object} options.sounds   The scene sounds.
   */
  create({ graphics, sounds }) {
    const text = {
      menu: this.menuItems.map(item => item.label),
      prompt: this.promptOption,
    };

    const { sprites } = parse({ graphics, text });

    this.sounds = sounds;

    this.menuContainer = new MenuContainer({
      sprites: sprites.menu,
      items: this.menuItems,
    });

    this.promptContainer = new PromptContainer(sprites.prompt);

    this.setFadingIn();
  }

  /**
   * Update the scene.
   * @param  {Number} delta The delta value.
   */
  update(delta) {
    switch (this.state) {
      case STATES.FADING_IN:
        this.updateFadingIn(delta);
        break;
      case STATES.RUNNING:
        this.updateRunning(delta);
        break;
      case STATES.PAUSING:
        this.updatePausing(delta);
        break;
      case STATES.PAUSED:
        this.updatePaused(delta);
        break;
      case STATES.UNPAUSING:
        this.updateUnpausing(delta);
        break;
      case STATES.PROMPTING:
        this.updatePrompting(delta);
        break;
      case STATES.FADING_OUT:
        this.updateFadingOut(delta);
        break;
      default:
        break;
    }

    super.update(delta);
  }

  /**
   * Update the scene when in a fade in state.
   * @param  {Number} delta The delta value.
   */
  updateFadingIn(delta) {
    this.fadeEffect -= FADE_INCREMENT * delta;

    if (this.fadeEffect <= 0) {
      this.fadeEffect = 0;
      this.setRunning();
    }

    this.updateFadeEffect(this.fadeEffect, {
      pixelSize: FADE_PIXEL_SIZE,
    });
  }

  /**
   * Update the scene when in a running state.
   * @param  {Number} delta The delta value.
   */
  updateRunning() {
    if (this.game.isKeyPressed(KEYS.ESC)) {
      this.showMenu();
    }

    if (this.selectedOption) {
      this.selectedOption();
    }
  }

  /**
   * Update the scene when in a pausing state.
   * @param  {Number} delta The delta value.
   */
  updatePausing(delta) {
    this.fadeEffect += PAUSE_INCREMENT * delta;

    if (this.fadeEffect >= 1) {
      this.fadeEffect = 1;
      this.setPaused();
    }

    this.updateFadeEffect(this.fadeEffect, {
      pixelSize: PAUSE_PIXEL_SIZE,
    });
  }

  /**
   * Update the scene when in a paused state.
   * @param  {Number} delta The delta value.
   */
  updatePaused() {
    if (this.game.isKeyPressed(KEYS.DOWN_ARROW)) {
      this.menuHighlightNext();
    } else if (this.game.isKeyPressed(KEYS.UP_ARROW)) {
      this.menuHighlightPrevious();
    } else if (this.game.isKeyPressed(KEYS.ENTER)) {
      this.menuSelect();
    } else if (this.game.isKeyPressed(KEYS.ESC)) {
      this.hideMenu();
    }

    this.updateFadeEffect(this.fadeEffect, {
      pixelSize: PAUSE_PIXEL_SIZE,
    });
  }

  /**
   * Update the scene when in a unpausing state.
   * @param  {Number} delta The delta value.
   */
  updateUnpausing(delta) {
    this.fadeEffect -= PAUSE_INCREMENT * delta;

    if (this.fadeEffect <= 0) {
      this.fadeEffect = 0;
      this.removeChild(this.menuContainer);
      this.setRunning();
    }

    this.updateFadeEffect(this.fadeEffect, {
      pixelSize: PAUSE_PIXEL_SIZE,
    });
  }


  /**
   * Highlight the next menu item.
   */
  menuHighlightNext() {
    this.playSound(this.sounds.highlight);
    this.menuContainer.highlightNext();
  }

  /**
   * Highlight the previous menu item.
   */
  menuHighlightPrevious() {
    this.playSound(this.sounds.highlight);
    this.menuContainer.highlightPrevious();
  }

  /**
   * Select the next menu item.
   */
  menuSelect() {
    this.selectedOption = this.menuContainer.getHighlightedOption();
    this.hideMenu();
  }

  /**
   * Show the menu.
   */
  showMenu() {
    this.addChild(this.menuContainer);
    this.setPausing();
    this.playSound(this.sounds.pause);
  }

  /**
   * Hide the menu.
   */
  hideMenu() {
    this.setUnpausing();
    this.playSound(this.sounds.pause);
  }

  /**
   * Update the scene when in a prompting state.
   * @param  {Number} delta The delta value.
   */
  updatePrompting() {
    if (this.game.isKeyPressed(KEYS.SPACE)) {
      this.triggerComplete();
    }
  }

  /**
   * Update the scene when in a fade out state.
   * @param  {Number} delta The delta value.
   */
  updateFadingOut(delta) {
    this.fadeEffect += FADE_INCREMENT * delta;

    if (this.fadeEffect >= 1) {
      this.fadeEffect = 1;
      this.setStopped();
    }

    this.updateFadeEffect(this.fadeEffect, {
      pixelSize: FADE_PIXEL_SIZE,
    });
  }

  /**
   * Handle a state change to loading.
   */
  setLoading() {
    if (this.setState(STATES.LOADING)) {
      this.addChild(this.loadingContainer);
    }
  }

  /**
   * Handle a state change to fading in.
   */
  setFadingIn() {
    if (this.setState(STATES.FADING_IN)) {
      this.removeChild(this.loadingContainer);
      this.addChild(this.mainContainer);
      this.fadeEffect = 1;
      this.loadingContainer.destroy();
      // TODO: Enabled music
      // this.game.playMusic();
    }
  }

  /**
   * Handle a state change to running.
   */
  setRunning() {
    if (this.setState(STATES.RUNNING)) {
      this.game.resumeSounds();
      this.play();
    }
  }

  /**
   * Set the state to the pausing state.
   */
  setPausing() {
    const isStateChanged = this.setState(STATES.PAUSING);

    if (isStateChanged) {
      this.fadeEffect = 0;
      this.stop();
      this.selectedOption = null;
    }

    return isStateChanged;
  }

  /**
   * Set the state to the paused state.
   */
  setPaused() {
    if (this.setState(STATES.PAUSED)) {
      this.game.pauseSounds();
    }
  }

  /**
   * Set the state to the unpausing state.
   */
  setUnpausing() {
    return this.setState(STATES.UNPAUSING);
  }

  /**
   * Handle a state change to prompting.
   */
  setPrompting() {
    if (this.setState(STATES.PROMPTING)) {
      this.addChild(this.promptContainer);
    }
  }

  /**
   * Handle a state change to fading out.
   */
  setFadingOut() {
    if (this.setState(STATES.FADING_OUT)) {
      this.stop();
      this.stopSounds();
      this.playSound(this.sounds.complete);
      this.game.fadeMusic();
    }
  }

  /**
   * Handle a state change to stopped.
   */
  setStopped() {
    this.removeChild(this.promptContainer);

    if (this.setState(STATES.STOPPED)) {
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
  }

  /**
   * Play a sound.
   * @param  {String} type             The type of sound.
   * @param  {String} name             The name of the sound.
   * @param  {Number} options.distance The distance from the player.
   */
  playSound(...options) {
    this.game.playSound(...options);
  }

  /**
   * Stop all sounds.
   */
  stopSounds() {
    this.game.stopSounds();
  }

  /**
   * Trigger the complete event.
   */
  triggerComplete() {
    this.setStopEvent(EVENTS.COMPLETE);
    this.setFadingOut();
  }

  /**
   * Trigger the restart event.
   */
  triggerRestart() {
    this.setStopEvent(EVENTS.RESTART);
    this.setFadingOut();
  }

  /**
   * Trigger the quit event.
   */
  triggerQuit() {
    this.setStopEvent(EVENTS.QUIT);
    this.setFadingOut();
  }

  /**
   * Resize the scene.
   * @param  {Object} scale The new scale dimensions.
   */
  resize(scale) {
    if (this.state !== STATES.STOPPED) {
      this.setScale(scale);
    }
  }

  /**
   * Set the event to emit when stopped.
   * @param {String} stopEvent The new stopEvent.
   */
  setStopEvent(stopEvent) {
    this.stopEvent = stopEvent;
  }

  /**
   * Destroy the scene.
   */
  destroy() {
    this.mainContainer.destroy();
    this.menuContainer.destroy();
    this.promptContainer.destroy();
    super.destroy();
  }
}

export default Scene;
