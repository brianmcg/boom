import { Keyboard } from '~/core/input';
import { SCREEN } from '~/constants/config';
import { SPRITESHEET_PATH, SOUND_PATH, SCENE_PATH } from '~/constants/paths';
import { createSprites } from './helpers';
import Scene from '../Scene';

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

    this.assets = {
      data: [
        ['spritesheet', `${SPRITESHEET_PATH}/${this.type}.json`],
        ['scene', `${SCENE_PATH}/${this.type}.json`],
      ],
      music: `${SOUND_PATH}/${this.type}.mp3`,
    };
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
    text.y = logo.y + logo.height
      + ((SCREEN.HEIGHT - (logo.y + logo.height)) / 2) - text.height;


    this.main.addChild(smoke, { update: true });
    this.main.addChild(sparks, { update: true });
    this.main.addChild(logo, { hide: true });
    this.prompt.addChild(text);

    super.create();
  }

  /**
   * Handle a state change to paused.
   */
  handleStateChangePaused() {
    super.handleStateChangePaused();
    this.removeChild(this.prompt);
  }

  /**
   * Handle a state change to running.
   */
  handleStateChangeRunning() {
    super.handleStateChangeRunning();
    this.addChild(this.prompt);
  }

  /**
   * Update the scene in a running state.
   * @param  {Number} delta     The delta time.
   * @param  {Number} elapsedMS The elapsed time.
   */
  updateRunning(delta, elapsedMS) {
    super.updateRunning(delta, elapsedMS);

    if (Keyboard.isPressed(Keyboard.KEYS.SPACE)) {
      this.setStatus(Scene.EVENTS.COMPLETE);
      this.setState(Scene.STATES.FADING_OUT);
    }
  }
}

export default TitleScene;
