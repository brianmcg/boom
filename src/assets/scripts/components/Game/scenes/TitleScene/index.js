import translate from 'root/translate';
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
    super({ ...options, loopMusic: false });

    this.menuItems = [{
      label: translate('scene.menu.continue'),
      action: () => this.setRunning(),
    }, {
      label: translate('scene.menu.quit'),
      action: () => this.triggerQuit(),
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
   * Update scene in the running state.
   * @param  {Number} delta The delta time.
   */
  updateRunning(delta) {
    super.updateRunning(delta);
    this.setPrompting();
  }

  /**
   * Update the container in the prompting state.
   * @param  {delta} delta The delta time.
   */
  updatePrompting(delta) {
    super.updateRunning(delta);
    super.updatePrompting(delta);
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
