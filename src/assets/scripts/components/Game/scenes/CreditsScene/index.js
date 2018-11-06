import { Keyboard } from 'game/core/input';
import { SPRITESHEET_FILE_PATH, SOUND_FILE_PATH } from '../../constants/paths';
import Scene from '../Scene';

class CreditsScene extends Scene {
  constructor(props) {
    super(props);

    this.type = Scene.TYPES.CREDITS;

    this.assets = {
      data: [
        ['spritesheet', `${SPRITESHEET_FILE_PATH}/${this.type}.json`],
      ],
      music: `${SOUND_FILE_PATH}/${this.type}.mp3`,
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
