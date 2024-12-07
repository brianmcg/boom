import translate from '@util/translate';
import { WORLD_SCENE_ASSETS } from '@constants/assets';
import { DEBUG } from '@constants/config';
import { KEYS, BUTTONS } from '@game/core/input';

import { parse } from './parsers';
import POVContainer from './containers/POVContainer';
import MapContainer from './containers/MapContainer';
import ReviewContainer from './containers/ReviewContainer';
import Scene, { STATES } from '../Scene';

Object.assign(STATES, {
  ADDING_REVIEW: 'world:scene:adding:review',
  DISPLAYING_REVIEW: 'world:scene:displaying:review',
  REMOVING_REVIEW: 'world:scene:removing:review',
});

const FADE_INCREMENT = 0.05;

const FADE_PIXEL_SIZE = 4;

const MAP_VIEW = DEBUG === 2;

export default class WorldScene extends Scene {
  constructor({ id, index, ...options }) {
    super(options);

    this.index = index;

    this.assets = WORLD_SCENE_ASSETS(index);

    this.menu.add({
      label: translate('world.menu.continue'),
      action: () => this.onSelectContinue(),
    });

    this.menu.add({
      label: translate('world.menu.restart'),
      action: () => this.onSelectRestart(),
    });

    this.promptOption = translate('scene.prompt.continue');

    this.title = translate(`world.title.${id}`);

    this.game.input.add(STATES.RUNNING, {
      onKeyDown: {
        [KEYS.UP_ARROW]: () => this.assignPlayerAction({ moveForward: true }),
        [KEYS.W]: () => this.assignPlayerAction({ moveForward: true }),
        [KEYS.DOWN_ARROW]: () =>
          this.assignPlayerAction({ moveBackward: true }),
        [KEYS.S]: () => this.assignPlayerAction({ moveBackward: true }),
        [KEYS.LEFT_ARROW]: () => this.assignPlayerAction({ turnLeft: true }),
        [KEYS.RIGHT_ARROW]: () => this.assignPlayerAction({ turnRight: true }),
        [KEYS.A]: () => this.assignPlayerAction({ strafeLeft: true }),
        [KEYS.D]: () => this.assignPlayerAction({ strafeRight: true }),
        [KEYS.E]: () => this.assignPlayerAction({ use: true }),
        // [KEYS.SPACE]: () => this.assignPlayerAction({ use: true }),
        [KEYS.CTRL]: () => this.assignPlayerAction({ attack: true }),
        [KEYS.SHIFT]: () => this.assignPlayerAction({ crouch: true }),
        [KEYS.ALT]: () => this.assignPlayerAction({ secondaryAttack: true }),
        [KEYS.NUM_1]: () => this.assignPlayerAction({ selectWeapon: 1 }),
        [KEYS.NUM_2]: () => this.assignPlayerAction({ selectWeapon: 2 }),
        [KEYS.NUM_3]: () => this.assignPlayerAction({ selectWeapon: 3 }),
        [KEYS.NUM_4]: () => this.assignPlayerAction({ selectWeapon: 4 }),
      },
      onKeyUp: {
        [KEYS.UP_ARROW]: () => this.assignPlayerAction({ moveForward: false }),
        [KEYS.W]: () => this.assignPlayerAction({ moveForward: false }),
        [KEYS.DOWN_ARROW]: () =>
          this.assignPlayerAction({ moveBackward: false }),
        [KEYS.S]: () => this.assignPlayerAction({ moveBackward: false }),
        [KEYS.LEFT_ARROW]: () => this.assignPlayerAction({ turnLeft: false }),
        [KEYS.RIGHT_ARROW]: () => this.assignPlayerAction({ turnRight: false }),
        [KEYS.A]: () => this.assignPlayerAction({ strafeLeft: false }),
        [KEYS.D]: () => this.assignPlayerAction({ strafeRight: false }),
        [KEYS.CTRL]: () =>
          this.assignPlayerAction({ attack: false, stopAttack: true }),
        [KEYS.SHIFT]: () => this.assignPlayerAction({ crouch: false }),
      },
      onMouseDown: {
        [BUTTONS.LEFT]: () => this.assignPlayerAction({ attack: true }),
        [BUTTONS.RIGHT]: () =>
          this.assignPlayerAction({ secondaryAttack: true }),
      },
      onMouseUp: {
        [BUTTONS.LEFT]: () =>
          this.assignPlayerAction({ attack: false, stopAttack: true }),
        [BUTTONS.RIGHT]: () =>
          this.assignPlayerAction({ secondaryAttack: false }),
      },
      onMouseMove: {
        callback: x => this.incrementPlayerAction({ rotate: x }),
      },
      onMouseWheel: {
        callback: y => this.assignPlayerAction({ cycleWeapon: y }),
      },
    });
  }

  onPromptInput() {
    this.onStop = () => {
      if (this.index < this.game.assets.data.world.levels.length - 1) {
        this.game.showWorldScene({
          index: this.index + 1,
          startProps: this.world.props,
        });
      } else {
        this.game.showCreditsScene();
      }
    };

    this.soundController.emitSound(this.sounds.complete);
    this.setRemovingReview();
  }

  onSelectContinue() {
    this.setRunning();
  }

  onSelectRestart() {
    this.onStop = () =>
      this.game.showWorldScene({
        index: this.index,
        startProps: this.world.startProps,
      });

    this.setFadingOut();
  }

  onSelectQuit() {
    this.onStop = () => this.game.showTitleScene();
    this.setFadingOut();
  }

  create({ graphics, data, sounds }) {
    super.create({ graphics, sounds });

    const { renderer } = this.game.app;

    const text = {
      review: {
        title: this.title,
        enemies: translate('world.review.enemies'),
        items: translate('world.review.items'),
        secrets: translate('world.review.secrets'),
        time: translate('world.review.time'),
      },
    };

    const { world, sprites } = parse({
      scene: this,
      mapView: MAP_VIEW,
      renderer,
      graphics,
      data,
      text,
    });

    this.viewContainer = MAP_VIEW
      ? new MapContainer({ world, sprites: sprites.world })
      : new POVContainer({ world, sprites: sprites.world });

    this.mainContainer.addChild(this.viewContainer);
    this.reviewContainer = new ReviewContainer(sprites.review, this.sounds);
    this.reviewContainer.onShowStat(sound =>
      this.soundController.emitSound(sound)
    );

    this.world = world;
  }

  update(ticker) {
    switch (this.state) {
      case STATES.ADDING_REVIEW:
        this.updateAddingReview(ticker.deltaTime);
        break;
      case STATES.DISPLAYING_REVIEW:
        this.updateDisplayingReview();
        break;
      case STATES.REMOVING_REVIEW:
        this.updateRemovingReview(ticker.deltaTime);
        break;
      default:
        break;
    }

    super.update(ticker);
  }

  updateRunning(ticker) {
    this.world.update(ticker.deltaTime, ticker.elapsedMS);
  }

  updateAddingReview(deltaTime) {
    this.fadeAmount += FADE_INCREMENT * deltaTime;

    if (this.fadeAmount >= 1) {
      this.fadeAmount = 1;
      this.setDisplayingReview();
    }

    this.fade(this.fadeAmount, {
      pixelSize: FADE_PIXEL_SIZE,
    });
  }

  updateDisplayingReview() {
    this.fade(this.fadeAmount, {
      pixelSize: FADE_PIXEL_SIZE,
    });
  }

  updateRemovingReview(deltaTime) {
    this.fadeAmount -= FADE_INCREMENT * deltaTime;

    if (this.fadeAmount <= 0) {
      this.fadeAmount = 0;
      this.removeChild(this.reviewContainer);
      this.setFadingOut();
    }

    this.fade(this.fadeAmount, {
      pixelSize: FADE_PIXEL_SIZE,
    });
  }

  play() {
    super.play();
    this.world.play();
  }

  pause() {
    super.pause();
    this.world.pause();
  }

  stop() {
    super.stop();
    this.world.stop();
  }

  assignPlayerAction(actions) {
    Object.assign(this.world.player.actions, actions);
  }

  incrementPlayerAction(actions) {
    Object.keys(actions).forEach(key => {
      this.world.player.actions[key] += actions[key];
    });
  }

  setRunning() {
    super.setRunning();

    if (!this.started) {
      this.started = true;
      this.world.start(this.title);
    }
  }

  setAddingReview() {
    if (this.setState(STATES.ADDING_REVIEW)) {
      this.stop();
      this.fadeAmount = 0;
      this.reviewContainer.setStatistics(this.world.getStatistics());
      this.addChild(this.reviewContainer);
    }
  }

  setDisplayingReview() {
    return this.setState(STATES.DISPLAYING_REVIEW);
  }

  setRemovingReview() {
    if (this.viewContainer.removeHud) {
      this.viewContainer.removeHud();
    }

    return this.setState(STATES.REMOVING_REVIEW);
  }

  destroy(...options) {
    this.world.destroy();
    super.destroy(options);
  }
}
