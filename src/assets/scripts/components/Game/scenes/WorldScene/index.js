import translate from 'root/translate';
import { KEYS } from 'game/core/input';
import { SCENE_PATH, SCENE_MAP, SCENE_TYPES } from 'game/constants/assets';
import { parse } from './parsers';
import WorldContainer from './containers/WorldContainer';
import ReviewContainer from './containers/ReviewContainer';
import Scene from '../Scene';

const STATES = {
  STANDARD: 'world:scene.standard',
  REVIEWING: 'world:scene:reviewing',
};

/**
 * Class representing a world scene.
 */
class WorldScene extends Scene {
  /**
   * Create a world scene.
   * @param  {Number} options.index   The index of the scene.
   * @param  {String} options.game    The game running the scene.
   */
  constructor(options) {
    super({
      ...options,
      type: SCENE_TYPES.WORLD,
    });

    this.assets = {
      ...this.assets,
      data: {
        name: SCENE_MAP,
        src: `${SCENE_PATH}/${this.path}/${SCENE_MAP}`,
      },
    };

    this.menuItems = [{
      label: translate('scene.menu.continue'),
      onSelect: this.hideMenu.bind(this),
    }, {
      label: translate('scene.menu.restart'),
      onSelect: this.triggerRestart.bind(this),
    }, {
      label: translate('scene.menu.quit'),
      onSelect: this.triggerQuit.bind(this),
    }];

    this.promptOption = translate('scene.prompt.continue');

    this.title = translate('world.title', {
      index: this.index,
    });
  }

  /**
   * Create the world scene.
   * @param  {Object} options.graphics The scene graphics.
   * @param  {Object} options.data     The scene data.
   * @param  {Object} options.sounds   The scene sounds.
   */
  create({ graphics, data, sounds }) {
    const { renderer } = this.game;

    const text = {
      review: {
        title: translate('world.title', {
          index: this.index,
        }),
        enemies: translate('world.review.enemies'),
        items: translate('world.review.items'),
        time: translate('world.review.time'),
      },
    };

    const { world, sprites } = parse({
      scene: this,
      renderer,
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

    super.create({ graphics, sounds });
  }

  /**
   * Update the scene
   * @param  {[delta} delta The delta time.
   */
  update(delta) {
    switch (this.state) {
      case STATES.REVIEWING:
        this.updateReviewing(delta);
        break;
      default:
        super.update(delta);
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
        moveForward: this.game.isKeyHeld(KEYS.UP_ARROW) || this.game.isKeyHeld(KEYS.W),
        moveBackward: this.game.isKeyHeld(KEYS.DOWN_ARROW) || this.game.isKeyHeld(KEYS.S),
        turnLeft: this.game.isKeyHeld(KEYS.LEFT_ARROW),
        turnRight: this.game.isKeyHeld(KEYS.RIGHT_ARROW),
        strafeLeft: this.game.isKeyHeld(KEYS.A),
        strafeRight: this.game.isKeyHeld(KEYS.D),
        use: this.game.isKeyPressed(KEYS.SPACE),
        lookDown: this.game.isKeyHeld(KEYS.COMMA),
        lookUp: this.game.isKeyHeld(KEYS.PERIOD),
        crouch: this.game.isKeyHeld(KEYS.ALT),
        attack: this.game.isKeyHeld(KEYS.CTRL),
        armPistol: this.game.isKeyPressed(KEYS.NUM_1),
        armShotgun: this.game.isKeyPressed(KEYS.NUM_2),
        armChaingun: this.game.isKeyPressed(KEYS.NUM_3),
        strafe: this.game.isKeyHeld(KEYS.SHIFT),
        angleChange: this.game.getMouseX(),
        pitchChange: this.game.getMouseY(),
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
      this.playSound(this.sounds.pause);
      this.mainContainer.stop();
      this.reviewContainer.setStatistics(this.world.getStatistics());
      this.addChild(this.reviewContainer);
    }
  }

  /**
   * Set the state to running;
   */
  setRunning() {
    super.setRunning();

    if (!this.started) {
      this.started = true;
      this.world.player.addMessage(this.title);
    }
  }

  /**
   * Complete the scene.
   */
  complete() {
    if (this.index < this.game.data.numLevels) {
      this.game.showWorldScene({
        index: this.index + 1,
        props: this.world.props,
      });
    } else {
      this.game.showCreditsScene();
    }
  }

  /**
   * Restart the scene.
   */
  restart() {
    this.game.showWorldScene({
      index: this.index,
      props: this.world.startingProps,
    });
  }

  /**
   * Quit the scene.
   */
  quit() {
    this.game.showTitleScene();
  }

  /**
   * Destroy the scene.
   */
  destroy(...options) {
    this.world.destroy();
    super.destroy(options);
  }
}

export default WorldScene;
