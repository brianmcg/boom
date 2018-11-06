import { Scene } from 'game/components/graphics';
import { Keyboard } from 'game/components/input';
import { SPRITESHEET_FILE_PATH, SOUND_FILE_PATH, MAP_FILE_PATH } from '../../constants/paths';

class WorldScene extends Scene {
  constructor(props) {
    super(props);

    this.type = Scene.TYPES.WORLD;

    this.assets = {
      data: [
        ['spritesheet', `${SPRITESHEET_FILE_PATH}/${this.type}-${this.index}.json`],
        ['map', `${MAP_FILE_PATH}/${this.type}-${this.index}.json`],
      ],
      music: `${SOUND_FILE_PATH}/${this.type}-${this.index}.mp3`,
    };
  }

  create() {
    super.create();
  }

  updateRunning() {
    super.updateRunning();

    if (Keyboard.isPressed(Keyboard.KEYS.SPACE)) {
      this.setStatus(Scene.EVENTS.SCENE_COMPLETE);
      this.setState(Scene.STATES.FADING_OUT);
    }
  }

  render() {
    super.render();
  }
}

export default WorldScene;
