import { Keyboard } from '~/core/input';
import { SCENE_PATH } from '~/constants/paths';
import Scene from '../Scene';

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

    this.assets = {
      data: [
        ['scene', `${SCENE_PATH}/${this.type}/scene.json`],
      ],
      music: `${SCENE_PATH}/${this.type}/scene.mp3`,
    };
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

export default CreditsScene;
