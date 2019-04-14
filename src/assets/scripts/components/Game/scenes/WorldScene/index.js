import { Keyboard } from '~/core/input';
import { DEBUG } from '~/constants/config';
import { parse } from './helpers';
import Scene from '../Scene';
import DebugContainer from './containers/DebugContainer';
import WorldContainer from './containers/WorldContainer';

const { isHeld, isPressed, KEYS } = Keyboard;

export default class WorldScene extends Scene {
  constructor(options) {
    super({ type: Scene.TYPES.WORLD, ...options });

    this.menuItems = [{
      label: Scene.TEXT.CONTINUE,
      onSelect: () => {
        this.setState(Scene.STATES.RUNNING);
      },
    }, {
      label: Scene.TEXT.RESTART,
      onSelect: () => {
        this.setStatus(Scene.EVENTS.RESTART);
        this.setState(Scene.STATES.FADING_OUT);
      },
    }, {
      label: Scene.TEXT.QUIT,
      onSelect: () => {
        this.setStatus(Scene.EVENTS.QUIT);
        this.setState(Scene.STATES.FADING_OUT);
      },
    }];
  }

  create(resources) {
    super.create(resources);

    const { level, sprites } = parse(resources, DEBUG);

    level.on('complete', () => this.setState(Scene.STATES.PROMPTING));

    const world = DEBUG
      ? new DebugContainer({ level, sprites })
      : new WorldContainer({ level, sprites });

    this.main.addChild(world);
  }

  updateRunning(delta) {
    const input = {
      isMovingForward: isHeld(KEYS.UP_ARROW),
      isMovingBackward: isHeld(KEYS.DOWN_ARROW),
      isTurningLeft: isHeld(KEYS.LEFT_ARROW),
      isTurningRight: isHeld(KEYS.RIGHT_ARROW),
      isUsing: isPressed(KEYS.SPACE),
    };

    super.updateRunning(delta, input);
  }

  onPrompting() {
    this.onPaused();
    this.addChild(this.prompt);
  }

  updatePrompting(delta) {
    this.prompt.update(delta);

    if (isPressed(KEYS.SPACE)) {
      this.setStatus(Scene.EVENTS.COMPLETE);
      this.setState(Scene.STATES.FADING_OUT);
    }
  }
}
