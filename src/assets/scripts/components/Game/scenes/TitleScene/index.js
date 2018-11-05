import { Scene, Sprite } from 'game/components/graphics';
import { Keyboard } from 'game/components/input';

class TitleScene extends Scene {
  constructor(props) {
    super(props);

    Object.assign(this, {
      type: Scene.TYPES.TITLE,
      assets: [
        ['spritesheet', `${Scene.PATHS.SPRITE_SHEET}/${Scene.TYPES.TITLE}.json`],
      ],
    });

    this.index = 0;
  }

  create(resources) {
    const { textures } = resources.spritesheet;

    this.sprites = Object.values(textures).map(texture => new Sprite(texture));

    this.sprites.forEach(sprite => this.addChild(sprite));

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

export default TitleScene;
