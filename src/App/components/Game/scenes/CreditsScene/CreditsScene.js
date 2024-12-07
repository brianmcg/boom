import translate from '@util/translate';
import { CREDITS_SCENE_ASSETS } from '@constants/assets';
import { parse } from './parsers';
import ScrollContainer from './containers/ScrollContainer';
import { Container } from '@game/core/graphics';
import Scene from '../Scene';

export default class CreditsScene extends Scene {
  constructor(options) {
    super(options);

    this.assets = CREDITS_SCENE_ASSETS;

    this.menu.add({
      label: translate('credits.menu.continue'),
      action: () => this.setRunning(),
    });

    this.promptOption = translate('scene.prompt.continue');
  }

  onPromptInput() {
    this.soundController.emitSound(this.sounds.complete);
    this.onStop = () => this.game.showTitleScene();
    this.setFadingOut();
  }

  onSelectQuit() {
    this.onStop = () => this.game.showTitleScene();
    this.setFadingOut();
  }

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

  destroy(options) {
    this.removeChild(this.scrollContainer);
    this.scrollContainer.destroy(options);
    super.destroy(options);
  }
}
