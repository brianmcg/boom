import { Keyboard } from '~/core/input';
import { SPRITESHEET_PATH, SOUND_PATH } from '~/constants/paths';
import Scene from '../Scene';

class CreditsScene extends Scene {
  constructor(props) {
    super(props);

    this.type = Scene.TYPES.CREDITS;

    this.assets = {
      data: [
        ['spritesheet', `${SPRITESHEET_PATH}/${this.type}.json`],
      ],
      music: `${SOUND_PATH}/${this.type}.mp3`,
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
