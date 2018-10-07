import Scene from '../../../../Scene';
import { SPRITE_SHEETS } from '../../../constants/paths';
import { WORLD } from '../../../constants/scene-types';
import { SCENE_PASS, SCENE_FAIL, SCENE_QUIT } from '../../../constants/event-types'; // eslint-disable-line

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

  create() {} // eslint-disable-line

  update(delta) {} // eslint-disable-line

  render() {} // eslint-disable-line
}

export default WorldScene;
