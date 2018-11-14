import { Keyboard } from '~/core/input';
import { SCENE_PATH } from '~/constants/paths';
import Scene from '../Scene';

class CreditsScene extends Scene {
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

  updateRunning() {
    super.updateRunning();

    if (Keyboard.isPressed(Keyboard.KEYS.SPACE)) {
      this.setStatus(Scene.EVENTS.SCENE_COMPLETE);
      this.setState(Scene.STATES.FADING_OUT);
    }
  }
}

export default CreditsScene;
