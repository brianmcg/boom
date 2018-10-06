import Scene from '../../../../Scene';
import { SPRITE_SHEETS } from '../../../constants/paths';
import { CREDITS } from '../../../constants/scene-types';

class CreditsScene extends Scene {
  constructor(props) {
    super(props);
    this.props.assets = [
      ['spritesheet', `${SPRITE_SHEETS}/${CREDITS}.json`],
    ];
  }

  create(resources) {
    console.log('create', resources);
  }
}

export default CreditsScene;
