import translate from '@util/translate';
import { TITLE_SCENE_ASSETS } from '@constants/assets';
import { KEYS } from '@game/core/input';
import { parse } from './parsers';
import BackgroundContainer from './containers/BackgroundContainer';
import ForegroundContainer from './containers/ForegroundContainer';
import Scene, { STATES } from '../Scene';

export default class TitleScene extends Scene {
  constructor(options) {
    super(options);

    this.assets = TITLE_SCENE_ASSETS;

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

    this.promptOption = translate('title.prompt.start');

    this.game.input.add(STATES.PROMPTING, {
      onKeyDown: {
        [KEYS.Q]: () => this.showMenu(),
      },
    });
  }

  create(options) {
    const { renderer } = this.game.app;
    const { sprites } = parse({ ...options, renderer });

    this.mainContainer.addChild(new BackgroundContainer(sprites.background));
    this.mainContainer.addChild(new ForegroundContainer(sprites.foreground));

    super.create(options);
  }

  complete() {
    this.game.showWorldScene();
  }

  restart() {
    this.game.showTitleScene();
  }

  quit() {
    this.game.exit();
  }
}
