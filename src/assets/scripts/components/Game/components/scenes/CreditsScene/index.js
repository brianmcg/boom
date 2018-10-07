import Scene from '../../../../Scene';
import { SPRITE_SHEETS } from '../../../constants/paths';
import { CREDITS } from '../../../constants/scene-types';
import { SCENE_PASS } from '../../../constants/event-types'; // eslint-disable-line

class CreditsScene extends Scene {
  constructor(props) {
    super(props);

    Object.assign(this, {
      type: CREDITS,
      assets: [
        ['spritesheet', `${SPRITE_SHEETS}/${CREDITS}.json`],
      ],
    });
  }

  create(resources) {} // eslint-disable-line

  update(delta) {} // eslint-disable-line

  render() {} // eslint-disable-line
}

export default CreditsScene;
