import { Sprite } from 'game/core/graphics';

/**
 * Class representing a hud key sprite.
 */
class HudKeySprite extends Sprite {
  /**
   * Creates a hud key sprite
   * @param  {Texture} texture     The sprite texture.
   * @param  {Key}     options.key The key entity.
   */
  constructor(texture, { key } = {}) {
    super(texture);

    this.hide();

    key.onRemovedEvent(this.show.bind(this));
  }
}

export default HudKeySprite;
