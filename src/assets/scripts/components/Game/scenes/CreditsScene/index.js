
import { SCREEN } from '~/constants/config';
import { createSprites } from './helpers';
import Scene from '../Scene';
import ScrollContainer from './containers/ScrollContainer';
import BackgroundContainer from './containers/BackgroundContainer';

const SCROLL_SPEED = 0.4;

/**
 * Class representing a CreditsScene.
 */
class CreditsScene extends Scene {
  /**
   * Creates a CreditsScene.
   * @param  {Number} props.index The index of the scene.
   * @param  {Number} props.scale The scale of the scene.
   */
  constructor(props) {
    super(props);
    this.type = Scene.TYPES.CREDITS;
  }

  /**
   * Create the TitleScene assets.
   * @param  {Object} resources The loaded scene resources.
   */
  create(resources) {
    const sprites = createSprites(resources);
    const { background, prompt, scroll } = sprites;

    this.prompt.add(prompt);
    this.scroll = new ScrollContainer(scroll);
    this.background = new BackgroundContainer(background);

    this.main.addChild(this.background, { update: true });
    this.main.addChild(this.scroll);

    super.create();
  }

  /**
   * Update the scene in a running state.
   * @param  {Number} delta     The delta time.
   * @param  {Number} elapsedMS The elapsed time.
   */
  updateRunning(delta, elapsedMS) {
    super.updateRunning(delta, elapsedMS);

    if (this.scroll.enabled) {
      this.scroll.y -= (delta * SCROLL_SPEED);
      const last = this.scroll.lastChild();

      if (this.scroll.y < -this.scroll.height + ((SCREEN.HEIGHT) - (last.height))) {
        this.setState(Scene.STATES.PROMPTING);
      }
    }
  }
}

export default CreditsScene;
