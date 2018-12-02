import { createSprites } from './helpers';
import Scene from '../Scene';
import BackgroundContainer from './containers/BackgroundContainer';

/**
 * Class representing a TitleScene.
 * @extends {Scene}
 */
class TitleScene extends Scene {
  /**
   * Creates a TitleScene.
   * @param  {Number} options.index The index of the scene.
   * @param  {Number} options.scale The scale of the scene.
   */
  constructor(options) {
    super({ type: Scene.TYPES.TITLE, ...options });
  }

  /**
   * Create the TitleScene assets.
   * @param  {Object} resources The loaded scene resources.
   */
  create(resources) {
    const sprites = createSprites(resources);
    const { backgroundSprites, promptSprites } = sprites;
    const background = new BackgroundContainer(backgroundSprites);

    this.prompt.add(promptSprites);
    this.main.addChild(background, { play: true });

    super.create();
  }

  onRunning() {
    this.setState(Scene.STATES.PROMPTING);
  }
}

export default TitleScene;
