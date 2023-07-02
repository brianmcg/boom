import translate from '@translate';
import { TITLE_SCENE_ASSETS } from '@game/constants/assets';
import { KEYS } from '@game/core/input';
import { parse } from './parsers';
import BackgroundContainer from './containers/BackgroundContainer';
import ForegroundContainer from './containers/ForegroundContainer';
import Scene, { STATES } from '../Scene';

/**
 * Class representing a TitleScene.
 * @extends {Scene}
 */
class TitleScene extends Scene {
  /**
   * Creates a TitleScene.
   * @param  {String} options.game    The game running the scene.
   */
  constructor(options) {
    super(options);

    this.assets = TITLE_SCENE_ASSETS;

    this.menu = [{
      label: translate('scene.menu.continue'),
      action: () => this.setRunning(),
    }, {
      label: translate('scene.menu.quit'),
      action: () => this.triggerQuit(),
    }];

    this.promptOption = translate('title.prompt.start');

    this.game.input.add(STATES.PROMPTING, {
      onKeyDown: {
        [KEYS.Q]: () => this.showMenu(),
      },
    });
  }

  /**
   * Create the TitleScene options.
   * @param  {Object} options.graphics The scene graphics.
   */
  create(options) {
    const { sprites } = parse(options);

    this.mainContainer.addChild(new BackgroundContainer(sprites.background));
    this.mainContainer.addChild(new ForegroundContainer(sprites.foreground));

    super.create(options);
  }

  /**
   * Complete the scene.
   */
  complete() {
    this.game.showWorldScene();
  }

  /**
   * Restart the scene.
   */
  restart() {
    this.game.showTitleScene();
  }

  /**
   * Quit the scene.
   */
  quit() {
    this.game.stop();
  }
}

export default TitleScene;
