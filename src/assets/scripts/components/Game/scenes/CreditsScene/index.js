import translate from 'root/translate';
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
    super(options);

    this.menu = [{
      label: translate('scene.menu.continue'),
      action: () => this.setRunning(),
    }, {
      label: translate('scene.menu.quit'),
      action: () => this.triggerQuit(),
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

    const resources = parse({ text, ...options });

    const { background, scroll } = resources.sprites;

    const backgroundContainer = new BackgroundContainer(background);

    const scrollContainer = new ScrollContainer(scroll);

    scrollContainer.onScrollComplete(() => this.setPrompting());

    this.mainContainer.addChild(backgroundContainer);
    this.mainContainer.addChild(scrollContainer);
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
