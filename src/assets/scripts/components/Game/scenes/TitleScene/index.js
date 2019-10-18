import translate from '~/translate';
import { parse } from './parsers';
import BackgroundContainer from './containers/BackgroundContainer';
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
  }

  /**
   * Create the TitleScene assets.
   * @param  {Object} assets The loaded scene assets.
   */
  create(assets) {
    const text = {
      prompt: translate('title.prompt.start'),
    };

    const { sprites } = parse(assets, text);

    this.promptContainer.addChild(sprites.prompt);
    this.mainContainer.addChild(new BackgroundContainer(sprites.background));

    super.create(assets);
  }

  setRunning() {
    super.setRunning();
    this.setPrompting();
  }

  updatePrompting(delta) {
    this.updateRunning(delta);
    super.updatePrompting(delta);
  }
}

export default TitleScene;
