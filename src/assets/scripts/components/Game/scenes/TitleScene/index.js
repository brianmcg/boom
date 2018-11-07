import { Sprite } from 'game/core/graphics';
import { Keyboard } from 'game/core/input';
import { SPRITESHEET_FILE_PATH, SOUND_FILE_PATH } from '../../constants/paths';
import Scene from '../Scene';

class TitleScene extends Scene {
  constructor(props) {
    super(props);

    this.type = Scene.TYPES.TITLE;

    this.assets = {
      data: [
        ['spritesheet', `${SPRITESHEET_FILE_PATH}/${this.type}.json`],
      ],
      music: `${SOUND_FILE_PATH}/${this.type}.mp3`,
    };
  }

  create(resources) {
    const { textures } = resources.spritesheet;

    this.sprites = Object.values(textures).map(texture => new Sprite(texture));

    this.sprites.forEach(sprite => this.main.addChild(sprite));

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

export default TitleScene;
