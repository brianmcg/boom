import { Keyboard } from '~/core/input';
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

    this.menuItems = [{
      label: TEXT.CONTINUE,
      onSelect: () => {
        this.setState(Scene.STATES.RUNNING);
      },
    }, {
      label: TEXT.RESTART,
      onSelect: () => {
        this.setStatus(Scene.EVENTS.RESTART);
        this.setState(Scene.STATES.FADING_OUT);
      },
    }, {
      label: TEXT.QUIT,
      onSelect: () => {
        this.setStatus(Scene.EVENTS.QUIT);
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
      this.setStatus(Scene.EVENTS.COMPLETE);
      this.setState(Scene.STATES.FADING_OUT);
    }
  }

  render() {
    super.render();
  }
}

export default WorldScene;
