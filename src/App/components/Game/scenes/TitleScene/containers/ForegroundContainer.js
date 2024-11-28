import { Container } from '@game/core/graphics';
import { SCREEN } from '@constants/config';

const INTERVAL = 4000;

const SPEED = 10;

export default class ForegroundContainer extends Container {
  constructor(sprites) {
    super();

    const { logo, light, mask } = sprites;

    logo.x = SCREEN.WIDTH / 2;
    logo.y = SCREEN.HEIGHT / 2;

    mask.x = SCREEN.WIDTH / 2;
    mask.y = SCREEN.HEIGHT / 2;

    light.x = -light.width / 2;
    light.y = SCREEN.HEIGHT / 2;

    light.mask = mask;

    this.addChild(logo);
    this.addChild(mask);
    this.addChild(light);

    this.sprites = sprites;
    this.timer = INTERVAL / 2;
    this.animate = false;
  }

  update({ deltaTime, elapsedMS }) {
    const { light } = this.sprites;

    if (this.animate) {
      light.x += SPEED * deltaTime;

      if (light.x > SCREEN.WIDTH + light.width / 2) {
        light.x = -light.width / 2;
        this.animate = false;
      }
    } else {
      this.timer += elapsedMS;

      if (this.timer >= INTERVAL) {
        this.animate = true;
        this.timer = false;
      }
    }
  }
}
