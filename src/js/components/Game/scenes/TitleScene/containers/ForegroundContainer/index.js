import { Container } from '@game/core/graphics';
import { SCREEN } from '@game/constants/config';

const INTERVAL = 3000;

const SPEED = 6;

/**
 * Class representing a foreground container.
 */
class ForegroundContainer extends Container {
  /**
   * Creates a foreground container.
   * @param  {LogoSprite}   options.logo   The logo sprite.
   * @param  {LogoSprite}   options.light  The logo sprite.
   * @param  {LogoSprite}   options.mask   The logo sprite.
   */
  constructor(sprites) {
    super();

    const { logo, light, mask } = sprites;

    logo.x = (SCREEN.WIDTH / 2);
    logo.y = (SCREEN.HEIGHT / 2);

    mask.x = (SCREEN.WIDTH / 2);
    mask.y = (SCREEN.HEIGHT / 2);

    light.x = -light.width / 2;
    light.y = (SCREEN.HEIGHT / 2);

    light.mask = mask;

    this.addChild(logo);
    this.addChild(mask);
    this.addChild(light);

    this.sprites = sprites;
    this.timer = INTERVAL / 2;
    this.animate = false;
  }

  /**
   * Update the container.
   * @param  {Number} delta     The delta time value.
   * @param  {Number} elapsedMS The elapsed time in milliseconds.
   */
  update(delta = 0, elsapsedMS = 0) {
    const { light } = this.sprites;

    if (this.animate) {
      light.x += SPEED * delta;

      if (light.x > SCREEN.WIDTH + (light.width / 2)) {
        light.x = -light.width / 2;
        this.animate = false;
      }
    } else {
      this.timer += elsapsedMS;

      if (this.timer >= INTERVAL) {
        this.animate = true;
        this.timer = false;
      }
    }
  }
}

export default ForegroundContainer;
