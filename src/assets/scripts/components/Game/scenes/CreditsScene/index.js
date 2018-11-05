import { Scene } from 'game/components/graphics';
import { Keyboard } from 'game/components/input';

class CreditsScene extends Scene {
  constructor(props) {
    super(props);

    Object.assign(this, {
      type: Scene.TYPES.CREDITS,
      assets: [
        ['spritesheet', `${Scene.PATHS.SPRITE_SHEET}/${Scene.TYPES.CREDITS}.json`],
      ],
    });
  }

  updateRunning() {
    super.updateRunning();

    if (Keyboard.isPressed(Keyboard.KEYS.SPACE)) {
      this.setStatus(Scene.EVENTS.SCENE_COMPLETE);
      this.setState(Scene.STATES.FADING_OUT);
    }
  }
}

export default CreditsScene;
