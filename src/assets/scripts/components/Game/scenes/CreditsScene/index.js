import { parse } from './helpers';
import Scene from '../Scene';
import ScrollContainer from './containers/ScrollContainer';
import BackgroundContainer from './containers/BackgroundContainer';

/**
 * Class representing a CreditsScene.
 */
export default class CreditsScene extends Scene {
  /**
   * Creates a CreditsScene.
   * @param  {Number} options.index The index of the scene.
   * @param  {Number} options.scale The scale of the scene.
   */
  constructor(options) {
    super({ type: Scene.TYPES.CREDITS, ...options });
  }

  /**
   * Create the TitleScene assets.
   * @param  {Object} assets The loaded scene assets.
   */
  create(assets) {
    super.create(assets);

    const { sprites } = parse(assets);

    const background = new BackgroundContainer(sprites.background);
    const scroll = new ScrollContainer(sprites.scroll);

    scroll.on(ScrollContainer.EVENTS.SCROLL_COMPLETE, () => {
      this.setState(Scene.STATES.PROMPTING);
    });

    this.menuItems = [{
      label: Scene.TEXT.CONTINUE,
      onSelect: () => {
        this.setState(Scene.STATES.RUNNING);
      },
    }, {
      label: Scene.TEXT.QUIT,
      onSelect: () => {
        this.setStatus(Scene.EVENTS.QUIT);
        this.setState(Scene.STATES.FADING_OUT);
      },
    }];

    this.prompt.addChild(sprites.prompt);
    this.main.addChild(background);
    this.main.addChild(scroll);
  }
}
