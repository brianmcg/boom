import * as PIXI from 'pixi.js';
import Scene from '../../../../Scene';
import { SPRITE_SHEETS } from '../../../constants/paths';
import { TITLE } from '../../../constants/scene-types';

class TitleScene extends Scene {
  constructor(props) {
    super(props);
    this.props.assets = [
      ['spritesheet', `${SPRITE_SHEETS}/${TITLE}.json`],
    ];
  }

  create(resources) {
    const { textures } = resources.spritesheet;

    this.props.sprites = Object.keys(textures).map(texture => new PIXI.Sprite(textures[texture]));
    this.props.sprites.forEach(sprite => this.addChild(sprite));
    this.props.events.emit('scene:pass', TITLE);
  }
}

export default TitleScene;
