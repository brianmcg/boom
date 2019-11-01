import translate from '~/translate';
import { Keyboard } from '~/core/input';
import { SOUNDS } from '~/constants/sounds';
import { SOUND } from '~/constants/assets';
import { parse } from './parsers';
import WorldContainer from './containers/WorldContainer';
import World from './entities/World';
import Scene from '../Scene';

const { isHeld, isPressed, KEYS } = Keyboard;

const STATES = {
  ...Scene.STATES,
  REVIEWING: 'reviewing',
};

/**
 * Class representing a world scene.
 */
class WorldScene extends Scene {
  /**
   * Create a world scene.
   * @param  {Number} options.index   The index of the scene.
   * @param  {Number} options.scale   The scale of the scene.
   * @param  {String} options.type    The type of scene.
   * @param  {String} options.sound   The scene music.
   */
  constructor(options) {
    super({ type: Scene.TYPES.WORLD, ...options });

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

  /**
   * Create the world scene.
   * @param  {Objects} resources The scene resources.
   * @param  {Player}  player    The game player.
   */
  create(resources, player) {
    const { world, sprites } = parse(resources, player);

    super.create(resources);

    this.world = world;
    this.world.on(World.EVENTS.EXIT, () => this.setReviewing());

    this.mainContainer.addChild(new WorldContainer({ world, sprites }));
  }

  update(delta) {
    super.update(delta);

    switch (this.state) {
      case STATES.REVIEWING:
        this.updateReviewing(delta);
        break;
      default:
        break;
    }
  }

  /**
   * Update the scene in the running state.
   * @param  {Number} delta The delta time.
   */
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

  updateReviewing(delta) {
    // console.log(delta);
  }

  /**
   * Set the state to reviewing.
   */
  setReviewing() {
    if (this.setState(STATES.REVIEWING)) {
      this.sound.pause();
      this.sound.play(SOUND.EFFECTS, SOUNDS.WEAPON_PISTOL);
    }
  }
}

export default WorldScene;
