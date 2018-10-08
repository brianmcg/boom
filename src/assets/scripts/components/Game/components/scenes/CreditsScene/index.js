import Scene from '../Scene';
import { SPRITE_SHEETS } from '../../../constants/paths';
import { CREDITS } from '../../../constants/scene-types';
import { SCENE_COMPLETE } from '../../../constants/scene-events';

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
}

export default CreditsScene;
