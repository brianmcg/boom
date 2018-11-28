import { Keyboard } from '~/core/input';
import { SCREEN } from '~/constants/config';
import { createSprites } from './helpers';
import Scene from '../Scene';

const PADDING = 10;

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
    const {
      smoke,
      sparks,
      logo,
      text,
    } = sprites;
    const ratio = logo.height / (SCREEN.HEIGHT / 1.75);

    logo.height /= ratio;
    logo.width /= ratio;
    logo.x = (SCREEN.WIDTH / 2) - (logo.width / 2);
    logo.y = (SCREEN.HEIGHT / 2) - (logo.height / 2);

    smoke.width = SCREEN.WIDTH;
    smoke.height = SCREEN.HEIGHT;

    sparks.width = SCREEN.WIDTH;
    sparks.height = SCREEN.HEIGHT;

    text.x = (SCREEN.WIDTH / 2) - (text.width / 2);
    text.y = SCREEN.HEIGHT - text.height - PADDING;

    this.main.addChild(smoke, { update: true });
    this.main.addChild(sparks, { update: true });
    this.main.addChild(logo, { hide: true });
    this.prompt.addChild(text);

    super.create();
  }

  handleStateChangeRunning() {
    super.handleStateChangeRunning();
    this.setState(Scene.STATES.PROMPTING);
  }
}

export default TitleScene;
