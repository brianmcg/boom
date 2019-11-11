import { AnimatedSprite } from 'game/core/graphics';

class LogoSprite extends AnimatedSprite {
  constructor(textures) {
    super(textures, {
      animationSpeed: 0.2,
      loop: true,
    });
  }

  play() {
    this.visible = true;
  }

  stop() {
    this.visible = false;
  }
}

export default LogoSprite;
