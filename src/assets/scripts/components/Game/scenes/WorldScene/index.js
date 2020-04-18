import translate from 'root/translate';
import { KEYS } from 'game/core/input';
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

    this.controls.add(STATES.RUNNING, {
      onKeyDown: {
        [KEYS.UP_ARROW]: () => this.world.player.setMoveForward(true),
        [KEYS.W]: () => this.world.player.setMoveForward(true),
        [KEYS.DOWN_ARROW]: () => this.world.player.setMoveBackward(true),
        [KEYS.S]: () => this.world.player.setMoveBackward(true),
        [KEYS.LEFT_ARROW]: () => this.world.player.setTurnLeft(true),
        [KEYS.RIGHT_ARROW]: () => this.world.player.setTurnRight(true),
        [KEYS.A]: () => this.world.player.setStrafeLeft(true),
        [KEYS.D]: () => this.world.player.setStrafeRight(true),
        [KEYS.E]: () => this.world.player.setUse(true),
        [KEYS.SPACE]: () => this.world.player.setUse(true),
        [KEYS.CTRL]: () => this.world.player.setAttack(true),
        [KEYS.NUM_1]: () => this.world.player.setSelectWeapon(0),
        [KEYS.NUM_2]: () => this.world.player.setSelectWeapon(1),
        [KEYS.NUM_3]: () => this.world.player.setSelectWeapon(2),
      },
      onKeyUp: {
        [KEYS.UP_ARROW]: () => this.world.player.setMoveForward(false),
        [KEYS.W]: () => this.world.player.setMoveForward(false),
        [KEYS.DOWN_ARROW]: () => this.world.player.setMoveBackward(false),
        [KEYS.S]: () => this.world.player.setMoveBackward(false),
        [KEYS.LEFT_ARROW]: () => this.world.player.setTurnLeft(false),
        [KEYS.RIGHT_ARROW]: () => this.world.player.setTurnRight(false),
        [KEYS.A]: () => this.world.player.setStrafeLeft(false),
        [KEYS.D]: () => this.world.player.setStrafeRight(false),
        [KEYS.CTRL]: () => this.world.player.setAttack(false),
      },
    });


    // // Attack
    // this.onMouseDown(() => {
    //   if (this.isRunning()) {
    //     this.world.player.actions.attack = true;
    //   }
    // });


    // this.onMouseUp(() => {
    //   if (this.isRunning()) {
    //     this.world.player.actions.attack = false;
    //     this.world.player.actions.stopAttack = true;
    //   }
    // });

    // this.onMouseMove((x) => {
    //   if (this.isRunning()) {
    //     this.world.player.actions.rotate += x;
    //   }
    // });


    // Replace parent class space callback.
    // this.onKeyDown(KEYS.SPACE, () => {
    //   if (this.isPrompting()) {
    //     this.setRemovingReview();
    //   }
    // }, {
    //   replace: true,
    // });
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
    this.world.update(delta);
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
