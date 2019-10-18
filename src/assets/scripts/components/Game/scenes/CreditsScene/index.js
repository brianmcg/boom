import { parse } from './parsers';
import { TEXT } from './text';
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

  // 'credits.prompt': 'Press space to continue',
  // 'credits.scroll.end': 'The End',
  // 'credits.scroll.coding': 'Coding',
  // 'credits.scroll.graphics': 'Graphics',
  // 'credits.scroll.sound': 'Sound',
  // 'credits.scroll.screenplay': 'Script',
  // 'credits.scroll.author': 'Brian Mcgrath',

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

    const { sprites } = parse({ assets, text: TEXT });
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
