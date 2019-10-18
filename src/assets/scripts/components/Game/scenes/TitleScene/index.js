import { parse } from './parsers';
import { TEXT } from './text';
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
      label: Scene.TEXT.CONTINUE,
      onSelect: () => {
        this.setRunning();
      },
    }, {
      label: Scene.TEXT.QUIT,
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
    const { sprites } = parse({ assets, text: TEXT });

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
