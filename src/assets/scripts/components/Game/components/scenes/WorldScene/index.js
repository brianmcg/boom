import Scene from '../Scene';
import { SPRITE_SHEETS } from '../../../constants/paths';
import { WORLD } from '../../../constants/scene-types';

class WorldScene extends Scene {
  constructor(props) {
    super(props);

    Object.assign(this, {
      type: WORLD,
      assets: [
        ['spritesheet', `${SPRITE_SHEETS}/${WORLD}-${props.index}.json`],
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
