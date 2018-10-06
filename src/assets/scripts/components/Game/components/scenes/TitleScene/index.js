import * as PIXI from 'pixi.js';
import Scene from '../../../../Scene';
import { SPRITE_SHEETS } from '../../../constants/paths';
import { TITLE } from '../../../constants/scene-types';
import { SCENE_PASS } from '../../../constants/event-types';

class TitleScene extends Scene {
  constructor(props) {
    super(props);
    this.assets = [
      ['spritesheet', `${SPRITE_SHEETS}/${TITLE}.json`],
    ];
  }

  create(resources) {
    const { textures } = resources.spritesheet;

    this.sprites = Object.keys(textures).map(texture => new PIXI.Sprite(textures[texture]));
    this.sprites.forEach(sprite => this.addChild(sprite));
    this.events.emit(SCENE_PASS, TITLE);
  }
}

export default TitleScene;
