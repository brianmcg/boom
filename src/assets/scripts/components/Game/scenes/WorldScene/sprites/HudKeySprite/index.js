import { Sprite } from 'game/core/graphics';
import { Body } from 'game/core/physics';

class HudKeySprite extends Sprite {
  constructor(texture, { key } = {}) {
    super(texture);

    this.hide();

    key.on(Body.EVENTS.REMOVED, this.show.bind(this));
  }
}

export default HudKeySprite;
