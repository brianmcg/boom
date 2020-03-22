import translate from 'root/translate';
import { SCENE_TYPES } from 'game/constants/assets';
import { parse } from './parsers';
import BackgroundContainer from './containers/BackgroundContainer';
import ForegroundContainer from './containers/ForegroundContainer';
import Scene from '../Scene';

/**
 * Class representing a TitleScene.
 * @extends {Scene}
 */
class TitleScene extends Scene {
  /**
   * Creates a TitleScene.
   * @param  {Number} options.index   The index of the scene.
   * @param  {String} options.game    The game running the scene.
   */
  constructor(options) {
    super({
      ...options,
      type: SCENE_TYPES.TITLE,
    });

    this.menuItems = [{
      label: translate('scene.menu.continue'),
      onSelect: this.hideMenu.bind(this),
    }, {
      label: translate('scene.menu.quit'),
      onSelect: this.triggerQuit.bind(this),
    }];

    this.promptOption = translate('title.prompt.start');
  }

  /**
   * Create the TitleScene options.
   * @param  {Object} options.graphics The scene graphics.
   */
  create(options) {
    const { sprites } = parse(options);

    this.mainContainer.addChild(new BackgroundContainer(sprites.background));
    this.mainContainer.addChild(new ForegroundContainer(sprites.foreground));

    super.create(options);
  }

  /**
   * Update the container in the prompting state.
   * @param  {delta} delta The delta time.
   */
  updatePrompting(delta) {
    this.updateRunning(delta);
    super.updatePrompting(delta);
  }

  /**
   * Set the container state to running.
   */
  setRunning() {
    super.setRunning();
    this.setPrompting();
  }

  /**
   * Complete the scene.
   */
  complete() {
    this.game.showWorldScene({ index: 1 });
  }

  /**
   * Restart the scene.
   */
  restart() {
    this.game.showTitleScene();
  }

  /**
   * Quit the scene.
   */
  quit() {
    this.game.stop();
  }
}

export default TitleScene;
