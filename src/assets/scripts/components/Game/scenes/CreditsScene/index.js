import translate from 'root/translate';
import { SCENE_TYPES } from 'game/constants/assets';
import { parse } from './parsers';
import ScrollContainer from './containers/ScrollContainer';
import BackgroundContainer from './containers/BackgroundContainer';
import Scene from '../Scene';

/**
 * Class representing a CreditsScene.
 */
class CreditsScene extends Scene {
  /**
   * Creates a CreditsScene.
   * @param  {Number} options.index   The index of the scene.
   * @param  {String} options.type    The type of scene.
   * @param  {String} options.game    The game running the scene.
   */
  constructor(options) {
    super({
      ...options,
      type: SCENE_TYPES.CREDITS,
    });

    this.menuItems = [{
      label: translate('scene.menu.continue'),
      onSelect: this.setRunning.bind(this),
    }, {
      label: translate('scene.menu.quit'),
      onSelect: this.triggerQuit.bind(this),
    }];

    this.promptOption = translate('scene.prompt.continue');
  }

  /**
   * Create the credits scene.
   * @param  {Object} options.graphics The scene graphics.
   */
  create(options) {
    super.create(options);

    const text = {
      credits: [{
        key: translate('credits.scroll.coding'),
        values: [
          translate('credits.scroll.author'),
        ],
      }, {
        key: translate('credits.scroll.graphics'),
        values: [
          translate('credits.scroll.author'),
        ],
      }, {
        key: translate('credits.scroll.sound'),
        values: [
          translate('credits.scroll.author'),
        ],
      }, {
        key: translate('credits.scroll.screenplay'),
        values: [
          translate('credits.scroll.author'),
        ],
      }],
      end: translate('credits.scroll.end'),
    };

    const { sprites } = parse({
      ...options,
      text,
    });

    const background = new BackgroundContainer(sprites.background);

    const scroll = new ScrollContainer(sprites.scroll, {
      onComplete: () => this.setPrompting(),
    });


    this.mainContainer.addChild(background);
    this.mainContainer.addChild(scroll);
  }

  /**
   * Update the scene in the prompting state.
   * @param  {delta} delta The delta time.
   */
  updatePrompting(delta) {
    this.updateRunning(delta);
    super.updatePrompting(delta);
  }

  /**
   * Complete the scene.
   */
  complete() {
    this.game.showTitleScene();
  }

  /**
   * Restart the scene.
   */
  restart() {
    this.game.showCreditsScene();
  }

  /**
   * Quit the scene.
   */
  quit() {
    this.game.showTitleScene();
  }
}

export default CreditsScene;
