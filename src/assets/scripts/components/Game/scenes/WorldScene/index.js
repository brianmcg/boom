import { Keyboard } from '~/core/input';
// import { DEBUG } from '~/constants/config';
import { parse } from './helpers';
// import DebugContainer from './containers/DebugContainer';
import WorldContainer from './containers/WorldContainer';
import Level from './entities/Level';
import Scene from '../Scene';

const { isHeld, isPressed, KEYS } = Keyboard;

class WorldScene extends Scene {
  constructor(options) {
    super({ type: Scene.TYPES.WORLD, ...options });

    this.menuItems = [{
      label: Scene.TEXT.CONTINUE,
      onSelect: () => {
        this.setRunning();
      },
    }, {
      label: Scene.TEXT.RESTART,
      onSelect: () => {
        this.setStatus(Scene.EVENTS.RESTART);
        this.setFadingOut();
      },
    }, {
      label: Scene.TEXT.QUIT,
      onSelect: () => {
        this.setStatus(Scene.EVENTS.QUIT);
        this.setFadingOut();
      },
    }];
  }

  create(resources) {
    const { level, sprites } = parse(resources);

    super.create(resources);

    level.on(Level.EVENTS.COMPLETE, () => this.setPrompting());

    this.main.addChild(new WorldContainer({ level, sprites }));
  }

  updateRunning(delta) {
    super.updateRunning(delta, {
      actions: {
        moveForward: isHeld(KEYS.UP_ARROW),
        moveBackward: isHeld(KEYS.DOWN_ARROW),
        turnLeft: isHeld(KEYS.LEFT_ARROW),
        turnRight: isHeld(KEYS.RIGHT_ARROW),
        use: isPressed(KEYS.SPACE),
        lookDown: isHeld(KEYS.COMMA),
        lookUp: isHeld(KEYS.PERIOD),
        crouch: isHeld(KEYS.SHIFT),
        attack: isPressed(KEYS.CTRL),
        continueAttack: isHeld(KEYS.CTRL),
      },
    });
  }

  // setPrompting() {
  //  this.setPaused();
  //  this.addChild(this.prompt);
  // }

  updatePrompting(delta) {
    this.prompt.update(delta);

    if (isPressed(KEYS.SPACE)) {
      this.setStatus(Scene.EVENTS.COMPLETE);
      this.setFadingOut();
    }
  }
}

export default WorldScene;
