import { createSprites } from './helpers';
import Scene from '../Scene';
import ScrollContainer from './containers/ScrollContainer';
import BackgroundContainer from './containers/BackgroundContainer';

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
  }

  /**
   * Create the TitleScene assets.
   * @param  {Object} resources The loaded scene resources.
   */
  create(resources) {
    const sprites = createSprites(resources);
    const { backgroundSprites, promptSprites, scrollSprites } = sprites;
    const background = new BackgroundContainer(backgroundSprites);
    const scroll = new ScrollContainer(scrollSprites);

    scroll.on(ScrollContainer.EVENTS.SCROLL_COMPLETE, () => {
      this.setState(Scene.STATES.PROMPTING);
    });

    this.prompt.add(promptSprites);
    this.main.addChild(background);
    this.main.addChild(scroll);

    super.create();
  }
}

export default CreditsScene;
