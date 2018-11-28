import { Keyboard } from '~/core/input';
import { SCREEN } from '~/constants/config';
import { createSprites } from './helpers';
import Scene from '../Scene';
import CreditsContainer from './containers/CreditsContainer';
import EndContainer from './containers/EndContainer';

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
    const {
      smoke,
      credits,
      end,
      pressSpace,
    } = sprites;

    smoke.width = SCREEN.WIDTH;
    smoke.height = SCREEN.HEIGHT;

    this.prompt.addChild(pressSpace);
    this.credits = new CreditsContainer(credits);
    this.end = new EndContainer(end);

    this.main.addChild(smoke, { update: true });
    this.main.addChild(this.credits);

    super.create();
  }

  /**
   * Update the scene in a running state.
   * @param  {Number} delta     The delta time.
   * @param  {Number} elapsedMS The elapsed time.
   */
  updateRunning(delta, elapsedMS) {
    super.updateRunning(delta, elapsedMS);

    if (this.credits.enabled) {
      this.credits.y -= (delta * SCROLL_SPEED);

      if (this.credits.y < -this.credits.height) {
        this.main.removeChild(this.credits);
        this.main.addChild(this.end);
      }
    }

    if (this.end.enabled) {
      this.end.y -= (delta * SCROLL_SPEED);

      if (this.end.y <= (SCREEN.HEIGHT / 2) - (this.end.height / 2)) {
        this.end.y = (SCREEN.HEIGHT / 2) - (this.end.height / 2);
        this.setState(Scene.STATES.PROMPTING);
      }
    }

    if (Keyboard.isPressed(Keyboard.KEYS.SPACE)) {
      this.setStatus(Scene.EVENTS.COMPLETE);
      this.setState(Scene.STATES.FADING_OUT);
    }
  }
}

export default CreditsScene;
