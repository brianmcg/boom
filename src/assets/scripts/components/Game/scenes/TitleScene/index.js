import { parse } from './helpers';
import Scene from '../Scene';
import BackgroundContainer from './containers/BackgroundContainer';

/**
 * Class representing a TitleScene.
 * @extends {Scene}
 */
export default class TitleScene extends Scene {
  /**
   * Creates a TitleScene.
   * @param  {Number} options.index The index of the scene.
   * @param  {Number} options.scale The scale of the scene.
   */
  constructor(options) {
    super({ ...options, type: Scene.TYPES.TITLE });

    this.menuItems = [{
      label: Scene.TEXT.CONTINUE,
      onSelect: () => {
        this.setState(Scene.STATES.RUNNING);
      },
    }, {
      label: Scene.TEXT.QUIT,
      onSelect: () => {
        this.setStatus(Scene.EVENTS.QUIT);
        this.setState(Scene.STATES.FADING_OUT);
      },
    }];
  }

  /**
   * Create the TitleScene assets.
   * @param  {Object} assets The loaded scene assets.
   */
  create(assets) {
    super.create(assets);

    const { sprites } = parse(assets);
    const background = new BackgroundContainer(sprites.background);

    this.prompt.addChild(sprites.prompt);
    this.main.addChild(background);
  }

  onRunning() {
    super.onRunning();
    this.setState(Scene.STATES.PROMPTING);
  }
}
