import translate from '@translate';
import { CREDITS_SCENE_ASSETS, SCENE_PATHS } from '@game/constants/assets';
import { parse } from './parsers';
import ScrollContainer from './containers/ScrollContainer';
import Scene from '../Scene';

const CREDITS_PATH = SCENE_PATHS.CREDITS;

/**
 * Class representing a CreditsScene.
 */
class CreditsScene extends Scene {
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
          key: translate('credits.scroll.french'),
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

    this.scrollContainer = new ScrollContainer(sprites.scroll);

    this.scrollContainer.onScrollComplete(() => this.setPrompting());

    this.mainContainer.addChild(this.scrollContainer);
  }

  updateRunning(delta) {
    return this.scrollContainer.scroll(delta);
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

export { CREDITS_PATH };

export default CreditsScene;
