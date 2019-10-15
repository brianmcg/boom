import { parse } from './helpers';
import { TEXT } from './text';
import ScrollContainer from './containers/ScrollContainer';
import BackgroundContainer from './containers/BackgroundContainer';
import Scene from '../Scene';

/**
 * Class representing a CreditsScene.
 */
class CreditsScene extends Scene {
  /**
   * Creates a CreditsScene.
   * @param  {Number} options.index The index of the scene.
   * @param  {Number} options.scale The scale of the scene.
   */
  constructor(options) {
    super({ type: Scene.TYPES.CREDITS, ...options });

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
    super.create(assets);

    const { sprites } = parse({ assets, text: TEXT });
    const background = new BackgroundContainer(sprites.background);
    const scroll = new ScrollContainer(sprites.scroll);

    scroll.on(ScrollContainer.EVENTS.SCROLL_COMPLETE, () => {
      this.setPrompting();
    });

    this.prompt.addChild(sprites.prompt);
    this.main.addChild(background);
    this.main.addChild(scroll);
  }
}

export default CreditsScene;
