import { Sprite } from '~/core/graphics';

class LogoSprite extends Sprite {
  constructor(texture) {
    super(texture);
    this.autoPlay = true;
  }

  play() {
    this.visible = true;
  }

  stop() {
    this.visible = false;
  }
}

export default LogoSprite;
