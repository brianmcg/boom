import { CELL_SIZE } from 'game/constants/config';
import { World as PhysicsWorld } from 'game/core/physics';
import Effect from '../../effects/Effect';

const ITEM_FLASH_AMOUNT = 0.35;

const ITEM_FLASH_DECREMENT = 0.01;

const MAX_EXPLOSION_FLASH_AMOUNT = 1;

const EXPLOSION_FLASH_DECREMENT = 0.15;

/**
 * Class representing a world.
 */
class World extends PhysicsWorld {
  /**
   * Creates a world.
   * @param  {Number} options.index       The index of the world.
   * @param  {Player} options.player      The player.
   * @param  {Array}  options.enemies     The enemies.
   * @param  {Array}  options.objects   The objects.
   * @param  {Array}  options.items       The items.
   * @param  {Array}  options.grid        The cell grid.
   * @param  {Object} options.entrance    The entrance coordinates.
   * @param  {Object} options.exit        The exit coordinates.
   * @param  {Number} options.visibility  The visibility of the world.
   * @param  {Number} options.brightness  The brightness of the world.
   */
  constructor({
    scene,
    player,
    enemies = [],
    objects = [],
    items = [],
    grid = [[]],
    entrance,
    exit,
    visibility,
    brightness,
  }) {
    super(grid, [
      ...enemies,
      ...items,
      ...objects,
      player,
    ]);

    this.scene = scene;
    this.exit = exit;
    this.entrance = entrance;
    this.player = player;
    this.items = items;
    this.enemies = enemies;
    this.objects = objects;
    this.brightness = brightness;
    this.flash = 0;
    this.visibility = visibility * CELL_SIZE;
    this.explosionFlash = false;
    this.itemFlash = false;
    this.effects = [];
    this.startTime = performance.now();
    this.startingProps = Object.assign({}, this.props);

    player.onDeath(() => this.onPlayerDeath());

    player.onPickUp(item => this.onPlayerPickUp(item));
  }

  /**
   * Update the world.
   * @param  {Number} delta            The delta time value.
   * @param  {Object} options.actions  The player actions.
   */
  update(delta, elapsedMS) {
    const { gridX, gridY } = this.player;
    const { x, y } = this.exit;

    this.effects.forEach(e => e.update(delta, elapsedMS));

    if (this.explosionFlash) {
      this.flash -= EXPLOSION_FLASH_DECREMENT * delta;
    }

    if (this.itemFlash) {
      this.flash -= ITEM_FLASH_DECREMENT * delta;
    }

    if (this.flash <= 0) {
      this.itemFlash = false;
      this.explosionFlash = false;
      this.flash = 0;
    }

    if (x === gridX && y === gridY) {
      this.scene.setAddingReviewing();
    }

    super.update(delta, elapsedMS);
  }

  /**
   * Start the world.
   * @param  {String} message The message for the player.
   */
  start(message) {
    this.player.start(message);
  }


  /**
   * Play the world.
   */
  play() {
    this.dynamicBodies.forEach(body => body.play());
  }

  /**
   * Pause the world.
   */
  pause() {
    this.dynamicBodies.forEach(body => body.pause());
  }

  /**
   * Stop the world.
   * @return {[type]} [description]
   */
  stop() {
    this.dynamicBodies.forEach(body => body.stop());
  }

  /**
   * Restart the world scene.
   */
  onPlayerDeath() {
    this.scene.triggerRestart();
  }

  /**
   * Add an explosion to the world.
   * @param {World} explosion The explosion to add.
   */
  addEffect({ flash = 0, shake, ...options }) {
    this.effects.push(new Effect(options));

    if (flash) {
      this.flash = Math.min(this.flash + (flash / 5), MAX_EXPLOSION_FLASH_AMOUNT);
      this.explosionFlash = true;
    }

    if (shake) {
      this.player.shake(shake);
    }
  }

  /**
   * Remove an explosion from the world.
   * @param  {Effect} explosion The explosion to remove.
   */
  removeEffect(explosion) {
    this.effects = this.effects.filter(e => e.id !== explosion.id);
  }


  /**
   * Set the brightness and enabled item flash.
   */
  onPlayerPickUp(item) {
    item.setRemoved();
    this.remove(item);
    this.flash += ITEM_FLASH_AMOUNT;
    this.itemFlash = true;
  }

  /**
   * Get the world statistics
   * @return {Object} Info about the world to date.
   */
  getStatistics() {
    return {
      timeTaken: performance.now() - this.startTime,
      itemsFound: this.items.filter(item => item.isRemoved).length,
      itemsTotal: this.items.length,
      enemiesKilled: this.enemies.filter(enemy => enemy.isDead()).length,
      enemiesTotal: this.enemies.length,
    };
  }

  /**
   * The world properties.
   * @return {Object}
   */
  get props() {
    return { player: this.player.props };
  }
}

export default World;
