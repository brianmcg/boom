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
   * @param  {Number} options.scale   The scale of the scene.
   * @param  {String} options.type    The type of scene.
   * @param  {String} options.game    The game running the scene.
   */
  constructor(options) {
    super({ type: Scene.TYPES.TITLE, ...options });

    this.menuItems = [{
      label: translate('scene.menu.continue'),
      onSelect: () => {
        this.setRunning();
      },
    }, {
      label: translate('scene.menu.quit'),
      onSelect: () => {
        this.setStatus(Scene.EVENTS.QUIT);
        this.setFadingOut();
      },
    }];

    this.promptOption = translate('title.prompt.start');
  }

  /**
   * Create the TitleScene assets.
   * @param  {Object} assets The loaded scene assets.
   */
  create(assets) {
    const { sprites } = parse(assets);

    this.mainContainer.addChild(new BackgroundContainer(sprites.background));
    this.mainContainer.addChild(new ForegroundContainer(sprites.foreground));

    super.create(assets);
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
    this.game.show(Scene.TYPES.WORLD, 1);
  }

  /**
   * Restart the scene.
   */
  restart() {
    this.game.show(Scene.TYPES.TITLE);
  }

  /**
   * Quit the scene.
   */
  quit() {
    this.game.stop();
  }
}

export default TitleScene;
