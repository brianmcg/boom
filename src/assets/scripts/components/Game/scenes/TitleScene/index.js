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
   * @param  {Number} props.index The index of the scene.
   * @param  {Number} props.scale The scale of the scene.
   */
  constructor(props) {
    super(props);
    this.type = Scene.TYPES.TITLE;
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

  handleStateChangeRunning() {
    super.handleStateChangeRunning();
    this.setState(Scene.STATES.PROMPTING);
  }
}

export default TitleScene;
