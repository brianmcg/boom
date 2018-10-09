import { Scene } from 'game/components/graphics';
import { Keyboard } from 'game/components/input';

class WorldScene extends Scene {
  constructor(props) {
    super(props);

    Object.assign(this, {
      type: Scene.TYPES.WORLD,
      assets: [
        ['spritesheet', `${Scene.PATHS.SPRITE_SHEET}/${Scene.TYPES.WORLD}-${props.index}.json`],
      ],
    });
  }

  create() {
    super.create();
  }

  updateRunning() {
    super.updateRunning();

    if (this.keyboard.isPressed(Keyboard.KEYS.SPACE)) {
      this.setStatus(Scene.EVENTS.SCENE_COMPLETE);
      this.setState(Scene.STATES.FADING_OUT);
    }
  }

  render() {
    super.render();
  }
}

export default WorldScene;
