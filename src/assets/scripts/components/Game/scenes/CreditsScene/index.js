import { Scene } from '../../components/Graphics';
import { PATHS } from '../../constants/config';

class CreditsScene extends Scene {
  constructor(props) {
    super(props);

    Object.assign(this, {
      type: Scene.TYPES.CREDITS,
      assets: [
        ['spritesheet', `${PATHS.SPRITE_SHEETS}/${Scene.TYPES.CREDITS}.json`],
      ],
    });
  }
}

export default CreditsScene;
