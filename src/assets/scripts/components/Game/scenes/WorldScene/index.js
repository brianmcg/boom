import translate from 'root/translate';
import { KEYS } from 'game/core/input';
import { SCENE_PATH, SCENE_MAP } from 'game/constants/assets';
import { parse } from './parsers';
import POVContainer from './containers/POVContainer';
import ReviewContainer from './containers/ReviewContainer';
import Scene from '../Scene';

const STATES = {
  ADDING_REVIEW: 'world:scene:adding:review',
  DISPLAYING_REVIEW: 'world:scene:displaying:review',
  REMOVING_REVIEW: 'world:scene:removing:review',
};

const FADE_INCREMENT = 0.1;

const FADE_PIXEL_SIZE = 8;

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
    super(options);

    this.assets = {
      ...this.assets,
      data: {
        name: SCENE_MAP,
        src: `${SCENE_PATH}/${this.path}/${SCENE_MAP}`,
      },
    };

    this.menuItems = [{
      label: translate('scene.menu.continue'),
      onSelect: this.setRunning.bind(this),
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

    this.mainContainer.addChild(new POVContainer({
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
      case STATES.ADDING_REVIEW:
        this.updateAddingReview(delta);
        break;
      case STATES.DISPLAYING_REVIEW:
        this.updateDisplayingReview(delta);
        break;
      case STATES.REMOVING_REVIEW:
        this.updateRemovingReview(delta);
        break;
      default:
        break;
    }

    super.update(delta);
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
        armWeaponA: this.game.isKeyPressed(KEYS.NUM_1),
        armWeaponB: this.game.isKeyPressed(KEYS.NUM_2),
        armWeaponC: this.game.isKeyPressed(KEYS.NUM_3),
        armWeaponD: this.game.isKeyPressed(KEYS.NUM_4),
        strafe: this.game.isKeyHeld(KEYS.SHIFT),
        angleChange: this.game.getMouseX(),
        pitchChange: this.game.getMouseY(),
      },
    });

    super.updateRunning(delta);
  }

  /**
   * Update the scene when in a adding review state.
   * @param  {Number} delta The delta value.
   */
  updateAddingReview(delta) {
    this.fadeEffect += FADE_INCREMENT * delta;

    if (this.fadeEffect >= 1) {
      this.fadeEffect = 1;
      this.setDisplayingReview();
    }

    this.updateFadeEffect(this.fadeEffect, {
      pixelSize: FADE_PIXEL_SIZE,
    });
  }

  /**
   * Update the scene in the reviewing state.
   * @param  {Number} delta The delta time.
   */
  updateDisplayingReview() {
    this.updateFadeEffect(this.fadeEffect, {
      pixelSize: FADE_PIXEL_SIZE,
    });
  }

  /**
   * Update the scene when in a removing review state.
   * @param  {Number} delta The delta value.
   */
  updateRemovingReview(delta) {
    this.fadeEffect -= FADE_INCREMENT * delta;

    if (this.fadeEffect <= 0) {
      this.fadeEffect = 0;
      this.triggerComplete();
    }

    this.mainContainer.updateFadeEffect(this.fadeEffect, {
      pixelSize: FADE_PIXEL_SIZE,
    });

    this.reviewContainer.updateFadeEffect(this.fadeEffect);
  }

  /**
   * Set the state to adding review.
   */
  setAddingReviewing() {
    if (this.setState(STATES.ADDING_REVIEW)) {
      this.fadeEffect = 0;
      this.game.pauseSounds();
      this.mainContainer.stop();
      this.reviewContainer.setStatistics(this.world.getStatistics());
      this.addChild(this.reviewContainer);
    }
  }

  /**
   * Update the scene when in a prompting state.
   * @param  {Number} delta The delta value.
   */
  updatePrompting() {
    if (this.game.isKeyPressed(KEYS.SPACE)) {
      this.setRemovingReview();
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
   * Set the scene to the displaying review state.
   */
  setDisplayingReview() {
    const isStateChanged = this.setState(STATES.DISPLAYING_REVIEW);

    if (isStateChanged) {
      this.reviewContainer.setShowTitle();
    }

    return isStateChanged;
  }

  /**
   * Set the state to removing review.
   */
  setRemovingReview() {
    const isStateChanged = this.setState(STATES.REMOVING_REVIEW);

    if (isStateChanged) {
      this.reviewContainer.setRemoveStats();
    }

    return isStateChanged;
  }

  /**
   * Complete the scene.
   */
  complete() {
    if (this.index < this.game.data.world.levels) {
      this.game.showWorldScene({
        index: this.index + 1,
        startingProps: this.world.props,
      });
    } else {
      this.game.showCreditsScene();
    }
  }

  /**
   * Trigger the complete event.
   */
  triggerComplete() {
    this.removeChild(this.reviewContainer);
    super.triggerComplete();
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
