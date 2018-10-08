import { Scene } from '../../components/Graphics';
import { PATHS } from '../../constants/config';

class WorldScene extends Scene {
  constructor(props) {
    super(props);

    Object.assign(this, {
      type: Scene.TYPES.WORLD,
      assets: [
        ['spritesheet', `${PATHS.SPRITE_SHEETS}/${Scene.TYPES.WORLD}-${props.index}.json`],
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
