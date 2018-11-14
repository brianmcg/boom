import { Keyboard } from '~/core/input';
import { SCREEN } from '~/constants/config';
import { SCENE_PATH } from '~/constants/paths';
import { createSprites } from './helpers';
import Scene from '../Scene';

class TitleScene extends Scene {
  constructor(props) {
    super(props);

    this.type = Scene.TYPES.TITLE;

    this.assets = {
      data: [
        ['scene', `${SCENE_PATH}/${this.type}/scene.json`],
      ],
      music: `${SCENE_PATH}/${this.type}/scene.mp3`,
    };
  }

  create(resources) {
    const sprites = createSprites(resources);
    const {
      smoke,
      sparks,
      logo,
      text,
    } = sprites;
    const ratio = logo.height / (SCREEN.HEIGHT / 1.75);

    logo.height /= ratio;
    logo.width /= ratio;
    logo.x = (SCREEN.WIDTH / 2) - (logo.width / 2);
    logo.y = (SCREEN.HEIGHT / 2) - (logo.height / 2);

    smoke.width = SCREEN.WIDTH;
    smoke.height = SCREEN.HEIGHT;

    sparks.width = SCREEN.WIDTH;
    sparks.height = SCREEN.HEIGHT;

    text.x = (SCREEN.WIDTH / 2) - (text.width / 2);
    text.y = logo.y + logo.height
      + ((SCREEN.HEIGHT - (logo.y + logo.height)) / 2) - text.height;


    this.main.addChild(smoke, { update: true });
    this.main.addChild(sparks, { update: true });
    this.main.addChild(logo, { hide: true });
    this.prompt.addChild(text);

    super.create();
  }

  handleStateChangePaused() {
    super.handleStateChangePaused();
    this.removeChild(this.prompt);
  }

  handleStateChangeRunning() {
    super.handleStateChangeRunning();
    this.addChild(this.prompt);
  }

  updateRunning(delta, elapsedMS) {
    super.updateRunning(delta, elapsedMS);

    if (Keyboard.isPressed(Keyboard.KEYS.SPACE)) {
      this.setStatus(Scene.EVENTS.SCENE_COMPLETE);
      this.setState(Scene.STATES.FADING_OUT);
    }
  }

  render() {
    super.render();
  }
}

export default TitleScene;
