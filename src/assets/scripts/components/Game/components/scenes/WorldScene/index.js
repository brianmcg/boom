// import * as PIXI from 'pixi.js';
import Scene from '../../../../Scene';
import { SPRITE_SHEETS } from '../../../constants/paths';
import { WORLD } from '../../../constants/scene-types';
import { SCENE_PASS, SCENE_FAIL, SCENE_QUIT } from '../../../constants/event-types';

class WorldScene extends Scene {
  constructor(props) {
    super(props);
    this.assets = [
      ['spritesheet', `${SPRITE_SHEETS}/${WORLD}-${props.index}.json`],
    ];
  }

  create() {

  }

  update(delta) {

  }

  render() {

  }
}

export default WorldScene;
