import * as PIXI from 'pixi.js';
import Scene from '../Scene';
import { SPRITE_SHEETS } from '../../../constants/paths';
import { TITLE } from '../../../constants/scene-types';
import { SCENE_COMPLETE } from '../../../constants/scene-events';
import { FADING_OUT } from '../../../constants/scene-states';

class TitleScene extends Scene {
  constructor(props) {
    super(props);

    Object.assign(this, {
      type: TITLE,
      assets: [
        ['spritesheet', `${SPRITE_SHEETS}/${TITLE}.json`],
      ],
    });
  }

  create(resources) {
    const { textures } = resources.spritesheet;

    this.sprites = Object.keys(textures).map(texture => new PIXI.Sprite(textures[texture]));
    this.sprites.forEach(sprite => this.addChild(sprite));

    super.create();
  }

  updateRunning() {
    if (this.input.isKeyPressed(this.input.SPACE)) {
      this.setStatus(SCENE_COMPLETE);
      this.setState(FADING_OUT);
    }
  }

  render() {
    super.render();
  }
}

export default TitleScene;
