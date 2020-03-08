import { Sprite } from 'game/core/graphics';
import Item from '../../entities/Item';

class HudKeySprite extends Sprite {
  constructor(texture, { key } = {}) {
    super(texture);

    this.hide();

    key.on(Item.EVENTS.FOUND, this.show.bind(this));
  }
}

export default HudKeySprite;
