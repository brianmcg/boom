import translate from 'root/translate';
import { KEYS } from 'game/core/input';
import { SOUNDS } from 'game/constants/sounds';
import { SCENE_PATH, SCENE_MAP } from 'game/constants/assets';
import { parse } from './parsers';
import WorldContainer from './containers/WorldContainer';
import ReviewContainer from './containers/ReviewContainer';
import Scene from '../Scene';

const STATES = {
  REVIEWING: 'world:scene:reviewing',
  PLAYER_DEAD: 'world:scene:player:dead',
};

/**
 * Class representing a world scene.
 */
class WorldScene extends Scene {
  /**
   * Create a world scene.
   * @param  {Number} options.index   The index of the scene.
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
   */
  create({ graphics, data }) {
    const text = {
      review: {
        title: translate('world.review.title'),
        enemies: translate('world.review.enemies'),
        items: translate('world.review.items'),
        time: translate('world.review.time'),
      },
    };

    const { world, sprites } = parse({
      graphics,
      data,
      text,
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
      case STATES.PLAYER_DEAD:
        this.updatePlayerDead(delta);
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
      actions: {
        moveForward: this.game.isKeyHeld(KEYS.UP_ARROW),
        moveBackward: this.game.isKeyHeld(KEYS.DOWN_ARROW),
        turnLeft: this.game.isKeyHeld(KEYS.LEFT_ARROW),
        turnRight: this.game.isKeyHeld(KEYS.RIGHT_ARROW),
        use: this.game.isKeyPressed(KEYS.SPACE),
        lookDown: this.game.isKeyHeld(KEYS.COMMA),
        lookUp: this.game.isKeyHeld(KEYS.PERIOD),
        crouch: this.game.isKeyHeld(KEYS.ALT),
        attack: this.game.isKeyHeld(KEYS.CTRL),
        armPistol: this.game.isKeyPressed(KEYS.NUM_1),
        armShotgun: this.game.isKeyPressed(KEYS.NUM_2),
        armChaingun: this.game.isKeyPressed(KEYS.NUM_3),
        strafe: this.game.isKeyHeld(KEYS.SHIFT),
      },
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
   * Update the scene in the player dead state.
   * @param  {Number} delta The delta time.
   */
  updatePlayerDead(delta) {
    // TODO: Implement logic for restarting level.
    this.tmp = delta;
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
      this.game.pauseSounds();
      this.game.playSound(SOUNDS.WEAPON_PISTOL);
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
      this.game.show({
        type: Scene.TYPES.WORLD,
        index: this.index + 1,
        props: this.world.props,
      });
    } else {
      this.game.show({
        type: Scene.TYPES.CREDITS,
      });
    }
  }

  /**
   * Restart the scene.
   */
  restart() {
    this.game.show({
      type: Scene.TYPES.WORLD,
      index: this.index,
      props: this.world.startingProps,
    });
  }

  /**
   * Quit the scene.
   */
  quit() {
    this.game.show({ type: Scene.TYPES.TITLE });
  }
}

export default WorldScene;
