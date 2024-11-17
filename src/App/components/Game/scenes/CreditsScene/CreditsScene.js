import translate from '@util/translate';
import { CREDITS_SCENE_ASSETS } from '@constants/assets';
import { parse } from './parsers';
import ScrollContainer from './containers/ScrollContainer';
import { Container } from '@game/core/graphics';
import Scene from '../Scene';

/**
 * Class representing a CreditsScene.
 */
export default class CreditsScene extends Scene {
  /**
   * Creates a CreditsScene.
   * @param  {String} options.game    The game running the scene.
   */
  constructor(options) {
    super(options);

    this.assets = CREDITS_SCENE_ASSETS;

    this.menu = [
      {
        label: translate('scene.menu.continue'),
        action: () => this.setRunning(),
      },
      {
        label: translate('scene.menu.quit'),
        action: () => this.triggerQuit(),
      },
    ];

    this.promptOption = translate('scene.prompt.continue');
  }

  /**
   * Create the credits scene.
   * @param  {Object} options.graphics The scene graphics.
   */
  create(options) {
    super.create(options);

    const text = {
      credits: [
        {
          key: translate('credits.scroll.animator'),
          values: [translate('credits.scroll.author')],
        },
        {
          key: translate('credits.scroll.art'),
          values: [translate('credits.scroll.author')],
        },
        {
          key: translate('credits.scroll.artist'),
          values: [translate('credits.scroll.author')],
        },
        {
          key: translate('credits.scroll.creative'),
          values: [translate('credits.scroll.author')],
        },
        {
          key: translate('credits.scroll.game'),
          values: [translate('credits.scroll.author')],
        },
        {
          key: translate('credits.scroll.level'),
          values: [translate('credits.scroll.author')],
        },
        {
          key: translate('credits.scroll.narrative'),
          values: [translate('credits.scroll.author')],
        },
        {
          key: translate('credits.scroll.programmer'),
          values: [translate('credits.scroll.author')],
        },
        {
          key: translate('credits.scroll.tester'),
          values: [translate('credits.scroll.author')],
        },
        {
          key: translate('credits.scroll.sound'),
          values: [translate('credits.scroll.author')],
        },
        {
          key: translate('credits.scroll.ui'),
          values: [translate('credits.scroll.author')],
        },
        {
          key: translate('credits.scroll.locales'),
          values: [translate('credits.scroll.author')],
        },
        {
          key: translate('credits.scroll.producer'),
          values: [translate('credits.scroll.author')],
        },
        {
          key: translate('credits.scroll.director'),
          values: [translate('credits.scroll.author')],
        },
      ],
      end: translate('credits.scroll.end'),
    };

    const { sprites } = parse({ text, ...options });

    this.backgroundContainer = new Container();
    this.scrollContainer = new ScrollContainer(sprites.scroll);

    this.backgroundContainer.addChild(sprites.background);
    this.mainContainer.addChild(this.backgroundContainer);
    this.mainContainer.addChild(this.scrollContainer);

    this.scrollContainer.onScrollComplete(() => this.setPrompting());
  }

  updateRunning(ticker) {
    return this.scrollContainer.scroll(ticker);
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

  /**
   * Destroy the scene.
   * @param  {Object} options The destroy options.
   */
  destroy(options) {
    this.removeChild(this.scrollContainer);
    this.scrollContainer.destroy(options);
    super.destroy(options);
  }
}
