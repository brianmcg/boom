import { Texture as PixiTexture } from '../../pixi';
import CreatedTextureCache from '../../utilities/CreatedTextureCache';

export default class Texture extends PixiTexture {
  constructor(options) {
    super(options);
    CreatedTextureCache.add(this);
  }
}
