import { FadeSprite } from '@game/core/graphics';
import { SCREEN } from '@constants/config';

export default class LogoSprite extends FadeSprite {
  constructor({ texture }) {
    super({ texture });
    this.maxScale = (SCREEN.HEIGHT * 0.6) / this.height;
  }
}
