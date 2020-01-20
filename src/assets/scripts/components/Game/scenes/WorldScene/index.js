import translate from 'root/translate';
import { Keyboard } from 'game/core/input';
import { SOUNDS } from 'game/constants/sounds';
import { GAME_SOUNDS, SCENE_PATH, SCENE_MAP } from 'game/constants/assets';
import { parse } from './parsers';
import WorldContainer from './containers/WorldContainer';
import ReviewContainer from './containers/ReviewContainer';
import Scene from '../Scene';

const { isHeld, isPressed, KEYS } = Keyboard;

const STATES = {
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
   * @param  {String} options.game    The game running the scene.
   */
  constructor(options) {
    super({ type: Scene.TYPES.WORLD, ...options });

    this.assets = {
      ...this.assets,
      data: {
        name: SCENE_MAP,
        src: `${SCENE_PATH}/${this.path}/${SCENE_MAP}`,
      },
    };

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

    this.promptOption = translate('scene.prompt.continue');
  }

  /**
   * Create the world scene.
   * @param  {Object} options.graphics The scene graphics.
   * @param  {Object} options.data     The scene data.
   * @param  {Player} options.player   The player.
   */
  create({ graphics, data, player }) {
    const text = {
      review: {
        title: translate('world.review.title'),
        enemies: translate('world.review.enemies'),
        items: translate('world.review.items'),
        time: translate('world.review.time'),
      },
    };

    const { stats } = this.game.data;

    const { world, sprites } = parse({
      graphics,
      data,
      player,
      text,
      stats,
    });

    this.mainContainer.addChild(new WorldContainer({
      world,
      sprites: sprites.world,
    }));

    this.reviewContainer = new ReviewContainer(sprites.review);
    this.world = world;
    this.world.scene = this;

    super.create({ graphics });
  }

  /**
   * Update the scene
   * @param  {[delta} delta The delta time.
   */
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
      crouch: isHeld(KEYS.ALT),
      attack: isHeld(KEYS.CTRL),
      armPistol: isPressed(KEYS.NUM_1),
      armShotgun: isPressed(KEYS.NUM_2),
      armChaingun: isPressed(KEYS.NUM_3),
      strafe: isHeld(KEYS.SHIFT),
    });

    super.updateRunning(delta);
  }

  /**
   * Update the scene in the reviewing state.
   * @param  {Number} delta The delta time.
   */
  updateReviewing(delta) {
    this.updatePaused(delta);
    this.reviewContainer.update(delta);
  }

  /**
   * Set the state to fading out.
   */
  setFadingOut() {
    super.setFadingOut();
    this.reviewContainer.setHideText();
  }

  /**
   * Set the state to reviewing.
   */
  setReviewing() {
    if (this.setState(STATES.REVIEWING)) {
      this.game.sound.pause();
      this.game.sound.play(GAME_SOUNDS.NAME, SOUNDS.WEAPON_PISTOL);
      this.mainContainer.stop();
      this.reviewContainer.setStatistics(this.world.getStatistics());
      this.addChild(this.reviewContainer);
    }
  }

  /**
   * Complete the scene.
   */
  complete() {
    if (this.index < this.game.data.numLevels) {
      this.game.show(Scene.TYPES.WORLD, this.index + 1, this.world.player);
    } else {
      this.game.show(Scene.TYPES.CREDITS);
    }
  }

  /**
   * Restart the scene.
   */
  restart() {
    this.game.show(Scene.TYPES.WORLD, this.index, this.world.player);
  }

  /**
   * Quit the scene.
   */
  quit() {
    this.game.show(Scene.TYPES.TITLE);
  }
}

export default WorldScene;
