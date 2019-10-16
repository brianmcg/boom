import { Keyboard } from '~/core/input';
import { parse } from './helpers';
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

    this.level = level;
    this.level.on(Level.EVENTS.COMPLETE, () => this.setPrompting());

    this.mainContainer.addChild(new WorldContainer({ level, sprites }));
  }

  updateRunning(delta) {
    this.level.update(delta, {
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
    });

    super.updateRunning(delta);
  }
}

export default WorldScene;
