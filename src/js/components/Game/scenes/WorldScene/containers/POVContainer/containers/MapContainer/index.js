import { Container } from '@game/core/graphics';

/**
 * Class representing an map container.
 */
class MapContainer extends Container {
  /**
   * Creates a MapContainer.
   * @param  {Array}  options.walls    The wall sprites.
   * @param  {Object} options.entities The entity sprites.
   */
  constructor(world, sprites) {
    super();

    const { walls, entities, effects } = sprites;

    // Add wall slice sprites.
    walls.forEach(layer => {
      layer.forEach(slice => this.addChild(slice));
    });

    // Handle sprite events.
    Object.values(entities).forEach(sprite => {
      if (sprite.onAnimationChange) {
        sprite.onAnimationChange(() => {
          if (!this.playableChildren.includes(sprite)) {
            this.playableChildren.push(sprite);
          }
        });

        sprite.onAnimationComplete(() => {
          this.playableChildren = this.playableChildren.filter(c => c !== sprite);
        });
      }
    });

    // Handle effect added event.
    world.onEffectAdded(effect => {
      const sprite = effects[effect.sourceId];

      sprite.onComplete = () => {
        this.removeChild(sprite);
        effect.remove();
      };

      this.addChild(sprite);
    });

    this.sprites = sprites;
  }

  /**
   * Sort the map container
   */
  update(delta) {
    this.children.sort((a, b) => b.zOrder - a.zOrder);
    super.update(delta);
  }

  /**
   * Destroy the container.
   * @param  {Object} options The destroy options.
   */
  destroy(options) {
    const { effects, entities } = this.sprites;

    Object.values(entities).forEach(sprite => {
      sprite.removeAllListeners?.();
      sprite.destroy(options);
    });

    Object.values(effects).forEach(sprite => {
      sprite.removeAllListeners?.();
      sprite.destroy(options);
    });

    super.destroy(options);
  }
}

export default MapContainer;
