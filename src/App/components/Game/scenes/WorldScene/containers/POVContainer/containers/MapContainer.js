import { Container } from '@game/core/graphics';

export default class MapContainer extends Container {
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
          this.playableChildren = this.playableChildren.filter(
            c => c !== sprite
          );
        });
      }
    });

    // Handle effect added event.
    world.onEffectAdded(effect => {
      const sprite = effects[effect.sourceId];

      sprite.onComplete = () => {
        this.removeChild(sprite);
        effect.removeFromParent();
      };

      this.addChild(sprite);
    });

    this.sprites = sprites;
  }

  update(ticker) {
    this.children.sort((a, b) => b.zOrder - a.zOrder);
    super.update(ticker);
  }

  destroy(options) {
    const { effects, entities, walls } = this.sprites;

    walls.forEach(layer => {
      layer.forEach(slice => {
        this.removeChild(slice);
        slice.destroy(options);
      });
    });

    Object.values(entities).forEach(sprite => {
      sprite.removeAllListeners?.();
      this.removeChild(sprite);
      sprite.destroy(options);
    });

    Object.values(effects).forEach(sprite => {
      sprite.removeAllListeners?.();
      this.removeChild(sprite);
      sprite.destroy(options);
    });

    this.sprites = null;

    super.destroy(options);
  }
}
