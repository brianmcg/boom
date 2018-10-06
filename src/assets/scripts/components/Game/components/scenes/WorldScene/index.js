// import * as PIXI from 'pixi.js';
import Scene from '../../../../Scene';
import { SPRITE_SHEETS } from '../../../constants/paths';
import { WORLD } from '../../../constants/scene-types';

class SplashScene extends Scene {
  constructor(props) {
    super(props);
    this.props.assets = [
      ['spritesheet', `${SPRITE_SHEETS}/${WORLD}-${props.index}.json`],
    ];
  }

  create(resources) {
    console.log('create', resources);
  }
}

export default SplashScene;
