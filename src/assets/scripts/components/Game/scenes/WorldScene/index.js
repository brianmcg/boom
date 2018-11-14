import { Keyboard } from '~/core/input';
import { SCENE_PATH } from '~/constants/paths';
import Scene from '../Scene';

const TEXT = {
  CONTINUE: 'Continue',
  RESTART: 'Restart',
  QUIT: 'Quit',
};

class WorldScene extends Scene {
  constructor(props) {
    super(props);

    this.type = Scene.TYPES.WORLD;

    this.assets = {
      data: [
        ['scene', `${SCENE_PATH}/${this.type}_${this.index}/scene.json`],
      ],
      music: `${SCENE_PATH}/${this.type}_${this.index}/scene.mp3`,
    };


    this.menuItems = [{
      label: TEXT.CONTINUE,
      onSelect: () => {
        this.setState(Scene.STATES.RUNNING);
      },
    }, {
      label: TEXT.RESTART,
      onSelect: () => {
        this.setStatus(Scene.EVENTS.SCENE_RESTART);
        this.setState(Scene.STATES.FADING_OUT);
      },
    }, {
      label: TEXT.QUIT,
      onSelect: () => {
        this.setStatus(Scene.EVENTS.SCENE_QUIT);
        this.setState(Scene.STATES.FADING_OUT);
      },
    }];
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
