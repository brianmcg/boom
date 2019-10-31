import translate from '~/translate';
import { Keyboard } from '~/core/input';
import { parse } from './parsers';
import WorldContainer from './containers/WorldContainer';
import World from './entities/World';
import Scene from '../Scene';
import Player from './entities/Player';

const { isHeld, isPressed, KEYS } = Keyboard;

class WorldScene extends Scene {
  constructor({
    player = new Player(),
    ...options
  }) {
    super({ type: Scene.TYPES.WORLD, ...options });

    this.player = player;

    this.menuItems = [{
      label: translate('scene.menu.continue'),
      onSelect: () => {
        this.setRunning();
      },
    }, {
      label: translate('scene.menu.restart'),
      onSelect: () => {
        this.setStatus(Scene.EVENTS.RESTART);
        this.setFadingOut();
      },
    }, {
      label: translate('scene.menu.quit'),
      onSelect: () => {
        this.setStatus(Scene.EVENTS.QUIT);
        this.setFadingOut();
      },
    }];
  }

  create(resources) {
    const { world, sprites } = parse(resources, this.player);

    super.create(resources);

    this.world = world;
    this.world.on(World.EVENTS.EXIT, () => this.setPrompting());

    this.mainContainer.addChild(new WorldContainer({ world, sprites }));
  }

  updateRunning(delta) {
    this.world.update(delta, {
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
      armPistol: isPressed(KEYS.NUM_1),
      armShotgun: isPressed(KEYS.NUM_2),
      armChaingun: isPressed(KEYS.NUM_3),
    });

    super.updateRunning(delta);
  }
}

export default WorldScene;
