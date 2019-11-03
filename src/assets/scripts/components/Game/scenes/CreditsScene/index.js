import translate from '~/translate';
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
   * @param  {Number} options.index The index of the scene.
   * @param  {Number} options.scale The scale of the scene.
   */
  constructor(options) {
    super({ type: Scene.TYPES.CREDITS, ...options });

    this.menuItems = [{
      label: translate('scene.menu.continue'),
      onSelect: () => {
        this.setRunning();
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
   * Create the TitleScene assets.
   * @param  {Object} assets The loaded scene assets.
   */
  create(assets) {
    super.create(assets);

    const text = {
      credits: [{
        key: translate('credits.scroll.coding'),
        values: [translate('credits.scroll.author')],
      }, {
        key: translate('credits.scroll.graphics'),
        values: [translate('credits.scroll.author')],
      }, {
        key: translate('credits.scroll.sound'),
        values: [translate('credits.scroll.author')],
      }, {
        key: translate('credits.scroll.screenplay'),
        values: [translate('credits.scroll.author')],
      }],
      continue: translate('scene.prompt.continue'),
      end: translate('credits.scroll.end'),
    };

    const { sprites } = parse({ assets, text });
    const background = new BackgroundContainer(sprites.background);
    const scroll = new ScrollContainer(sprites.scroll);

    scroll.once(ScrollContainer.EVENTS.SCROLL_COMPLETE, () => {
      this.setPrompting();
    });

    this.promptContainer.addChild(sprites.prompt);
    this.mainContainer.addChild(background);
    this.mainContainer.addChild(scroll);
  }

  updatePrompting(delta) {
    this.updateRunning(delta);
    super.updatePrompting(delta);
  }
}

export default CreditsScene;
