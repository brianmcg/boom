import { Particle } from '@game/core/graphics';

export default class BackgroundSprite extends Particle {
  constructor(textures, x, y) {
    super();
    this.x = x;
    this.y = y;
    this.textures = textures;
    this.texture = textures[Object.keys(textures)[0]][0][0];
  }

  changeTexture(name, x, y) {
    this.texture = this.textures[name][x][y];
  }
}
