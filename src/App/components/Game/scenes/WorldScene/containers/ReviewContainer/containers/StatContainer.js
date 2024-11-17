import { Container } from '@game/core/graphics';

const SCALE_INCREMENT = 0.1;

const INTERVAL = 200;

/**
 * Class representing a stat container.
 */
export default class StatContainer extends Container {
  /**
   * Creates a StatContainer.
   * @param  {Array}  options.sprites The sprites to display.
   * @param  {Number} options.y       The y coordinate of the sprites.
   * @param  {String} options.sound   The sound to play when scaled.
   */
  constructor({ sprites, y, sound }) {
    super();

    this.sprites = sprites;
    this.sound = sound;
    this.scaleAmount = 0;
    this.timer = 0;

    sprites.forEach(sprite => {
      sprite.y = y;
      this.addChild(sprite);
    });

    this.on('added', () => {
      this.children.forEach(child => child.scale.set(0));
    });
  }

  /**
   * Updates the container.
   * @param  {Number} delta     The time delta.
   * @param  {Number} elapsedMS The elapsed time.
   */
  update(ticker) {
    this.scaleAmount += SCALE_INCREMENT * ticker.deltaTime || 1;

    if (this.scaleAmount >= 1) {
      this.scaleAmount = 1;

      if (this.timer === 0 && !this.isComplete) {
        this.isComplete = true;
        this.parent.emitShowStat(this.sound);
      }

      this.timer += ticker.elapsedMS || 1;

      if (this.timer >= INTERVAL) {
        this.parent.showNext();
        this.stop();
      }
    }

    this.children.forEach(child => child.scale.set(this.scaleAmount));
  }
}
