import { Scene } from 'game/components/Graphics';

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

  render() {
    super.render();
  }
}

export default WorldScene;
