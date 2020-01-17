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
   * @param  {Number} options.scale   The scale of the scene.
   * @param  {String} options.type    The type of scene.
   * @param  {String} options.game    The game running the scene.
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

    this.promptOption = translate('scene.prompt.continue');
  }

  /**
   * Create the TitleScene options.
   * @param  {Object} options The loaded scene options.
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
    const scroll = new ScrollContainer(sprites.scroll);

    scroll.once(ScrollContainer.EVENTS.SCROLL_COMPLETE, () => {
      this.setPrompting();
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
    this.game.show(Scene.TYPES.TITLE);
  }

  /**
   * Restart the scene.
   */
  restart() {
    this.game.show(Scene.TYPES.CREDITS);
  }

  /**
   * Quit the scene.
   */
  quit() {
    this.game.show(Scene.TYPES.TITLE);
  }
}

export default CreditsScene;
