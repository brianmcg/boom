import translate from 'root/translate';
import { KEYS, BUTTONS } from 'game/core/input';
import { SCENE_PATH, SCENE_MAP } from 'game/constants/assets';
import { parse } from './parsers';
import POVContainer from './containers/POVContainer';
import ReviewContainer from './containers/ReviewContainer';
import Scene, { STATES } from '../Scene';

Object.assign(STATES, {
  ADDING_REVIEW: 'world:scene:adding:review',
  DISPLAYING_REVIEW: 'world:scene:displaying:review',
  REMOVING_REVIEW: 'world:scene:removing:review',
});

const FADE_INCREMENT = 0.05;

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

    this.menu = [{
      label: translate('scene.menu.continue'),
      action: () => this.setRunning(),
    }, {
      label: translate('scene.menu.restart'),
      action: () => this.triggerRestart(),
    }, {
      label: translate('scene.menu.quit'),
      action: () => this.triggerQuit(),
    }];

    this.promptOption = translate('scene.prompt.continue');

    this.title = translate('world.title', {
      index: this.index,
    });

    this.game.input.add(STATES.RUNNING, {
      onKeyDown: {
        [KEYS.UP_ARROW]: () => this.assignPlayerAction({ moveForward: true }),
        [KEYS.W]: () => this.assignPlayerAction({ moveForward: true }),
        [KEYS.DOWN_ARROW]: () => this.assignPlayerAction({ moveBackward: true }),
        [KEYS.S]: () => this.assignPlayerAction({ moveBackward: true }),
        [KEYS.LEFT_ARROW]: () => this.assignPlayerAction({ turnLeft: true }),
        [KEYS.RIGHT_ARROW]: () => this.assignPlayerAction({ turnRight: true }),
        [KEYS.A]: () => this.assignPlayerAction({ strafeLeft: true }),
        [KEYS.D]: () => this.assignPlayerAction({ strafeRight: true }),
        [KEYS.E]: () => this.assignPlayerAction({ use: true }),
        [KEYS.SPACE]: () => this.assignPlayerAction({ use: true }),
        [KEYS.CTRL]: () => this.assignPlayerAction({ attack: true }),
        [KEYS.SHIFT]: () => this.assignPlayerAction({ crouch: true }),
        [KEYS.NUM_1]: () => this.assignPlayerAction({ selectWeapon: 0 }),
        [KEYS.NUM_2]: () => this.assignPlayerAction({ selectWeapon: 1 }),
        [KEYS.NUM_3]: () => this.assignPlayerAction({ selectWeapon: 2 }),
        [KEYS.NUM_4]: () => this.assignPlayerAction({ selectWeapon: 3 }),
        [KEYS.NUM_5]: () => this.assignPlayerAction({ selectWeapon: 4 }),
      },
      onKeyUp: {
        [KEYS.UP_ARROW]: () => this.assignPlayerAction({ moveForward: false }),
        [KEYS.W]: () => this.assignPlayerAction({ moveForward: false }),
        [KEYS.DOWN_ARROW]: () => this.assignPlayerAction({ moveBackward: false }),
        [KEYS.S]: () => this.assignPlayerAction({ moveBackward: false }),
        [KEYS.LEFT_ARROW]: () => this.assignPlayerAction({ turnLeft: false }),
        [KEYS.RIGHT_ARROW]: () => this.assignPlayerAction({ turnRight: false }),
        [KEYS.A]: () => this.assignPlayerAction({ strafeLeft: false }),
        [KEYS.D]: () => this.assignPlayerAction({ strafeRight: false }),
        [KEYS.CTRL]: () => this.assignPlayerAction({ attack: false, stopAttack: true }),
        [KEYS.SHIFT]: () => this.assignPlayerAction({ crouch: false }),
      },
      onMouseDown: {
        [BUTTONS.LEFT]: () => this.assignPlayerAction({ attack: true }),
      },
      onMouseUp: {
        [BUTTONS.LEFT]: () => this.assignPlayerAction({ attack: false, stopAttack: true }),
      },
      onMouseMove: {
        callback: x => this.incrementPlayerAction({ rotate: x }),
      },
      onMouseWheel: {
        callback: y => this.assignPlayerAction({ cycleWeapon: y }),
      },
    });

    this.game.input.add(STATES.PROMPTING, {
      onKeyDown: {
        [KEYS.SPACE]: () => this.setRemovingReview(),
      },
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
    this.reviewContainer.onShowStat(() => this.soundController.emitSound(this.sounds.pause));

    this.world = world;

    super.create({ graphics, sounds });
  }

  /**
   * Update the scene
   * @param  {[delta} delta The delta time.
   */
  update(delta, elapsedMS) {
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

    super.update(delta, elapsedMS);
  }

  /**
   * Update the scene in the running state.
   * @param  {Number} delta The delta time.
   */
  updateRunning(delta, elapsedMS) {
    this.world.update(delta, elapsedMS);
  }

  /**
   * Update the scene when in a adding review state.
   * @param  {Number} delta The delta value.
   */
  updateAddingReview(delta) {
    this.fadeAmount += FADE_INCREMENT * delta;

    if (this.fadeAmount >= 1) {
      this.fadeAmount = 1;
      this.setDisplayingReview();
    }

    this.fade(this.fadeAmount, {
      pixelSize: FADE_PIXEL_SIZE,
    });
  }

  /**
   * Update the scene in the reviewing state.
   * @param  {Number} delta The delta time.
   */
  updateDisplayingReview() {
    this.fade(this.fadeAmount, {
      pixelSize: FADE_PIXEL_SIZE,
    });
  }

  /**
   * Update the scene when in a removing review state.
   * @param  {Number} delta The delta value.
   */
  updateRemovingReview(delta) {
    this.fadeAmount -= FADE_INCREMENT * delta;

    if (this.fadeAmount <= 0) {
      this.fadeAmount = 0;
      this.triggerComplete();
    }

    this.fade(this.fadeAmount, {
      pixelSize: FADE_PIXEL_SIZE,
    });
  }

  /**
   * Set the state to adding review.
   */
  setAddingReviewing() {
    if (this.setState(STATES.ADDING_REVIEW)) {
      this.stop();
      this.fadeAmount = 0;
      this.reviewContainer.setStatistics(this.world.getStatistics());
      this.addChild(this.reviewContainer);
    }
  }

  /**
   * Set player actions.
   * @param {Object} actions The actions to set.
   */
  assignPlayerAction(actions) {
    Object.assign(this.world.player.actions, actions);
  }

  /**
   * Increment player actions.
   * @param  {Object} actions The actions to increment.
   */
  incrementPlayerAction(actions) {
    Object.keys(actions).forEach((key) => {
      this.world.player.actions[key] += actions[key];
    });
  }

  /**
   * Set the state to running;
   */
  setRunning() {
    super.setRunning();

    if (!this.started) {
      this.started = true;
      this.world.start(this.title);
    }
  }

  /**
   * Set the scene to the displaying review state.
   */
  setDisplayingReview() {
    const isStateChanged = this.setState(STATES.DISPLAYING_REVIEW);

    if (isStateChanged) {
      this.soundController.emitSound(this.sounds.complete);
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
   * Play the scene.
   */
  play() {
    super.play();
    this.world.play();
  }

  /**
   * Pause the scene.
   */
  pause() {
    super.pause();
    this.world.pause();
  }

  /**
   * Stop the scene.
   */
  stop() {
    super.stop();
    this.world.stop();
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
