import Scene from '../../../../Scene';
import { SPRITE_SHEETS } from '../../../constants/paths';
import { CREDITS } from '../../../constants/scene-types';
import { SCENE_PASS } from '../../../constants/event-types';

class CreditsScene extends Scene {
  constructor(props) {
    super(props);
    this.assets = [
      ['spritesheet', `${SPRITE_SHEETS}/${CREDITS}.json`],
    ];
  }

  create(resources) {

  }

  update(delta) {

  }

  render() {

  }
}

export default CreditsScene;
