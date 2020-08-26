import { CELL_SIZE } from 'game/constants/config';
import { World as PhysicsWorld } from 'game/core/physics';

const MAX_GUN_FLASH_AMOUNT = 1;

const ITEM_FLASH_AMOUNT = 0.35;

const EXPLOSION_FLASH_DECREMENT = 0.2;

const ITEM_FLASH_DECREMENT = 0.01;

/**
 * Class representing a world.
 */
class World extends PhysicsWorld {
  /**
   * Creates a world.
   * @param  {Number} options.index       The index of the world.
   * @param  {Player} options.player      The player.
   * @param  {Array}  options.enemies     The enemies.
   * @param  {Array}  options.obstacles   The obstacles.
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
    obstacles = [],
    items = [],
    grid = [[]],
    entrance,
    exit,
    visibility,
    brightness,
  }) {
    super(grid);

    this.scene = scene;
    this.exit = exit;
    this.entrance = entrance;

    this.player = player;
    this.items = items;
    this.enemies = enemies;
    this.obstacles = obstacles;

    this.brightness = brightness;
    this.flash = 0;
    this.visibility = visibility * CELL_SIZE;

    this.explosionFlash = false;
    this.itemFlash = false;

    this.explosions = [];

    this.startTime = performance.now();

    this.startingProps = Object.assign({}, this.props);

    this.initialize();

    enemies.forEach(enemy => this.add(enemy));

    obstacles.forEach(object => this.add(object));

    items.forEach(item => this.add(item));

    player.onDeath(() => this.restart());

    player.onPickUp(item => this.onItemPickup(item));

    this.add(player);
  }

  /**
   * Update the world.
   * @param  {Number} delta            The delta time value.
   * @param  {Object} options.actions  The player actions.
   */
  update(delta) {
    const { gridX, gridY } = this.player;
    const { x, y } = this.exit;

    this.explosions.forEach(e => e.update(delta));

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

    super.update(delta);

    // TODO: Use sectors.
    // this.player.enabledSectors.forEach((sector) => {
    //   sector.dynamicBodies.forEach(body => body.update(delta));
    // });
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
  restart() {
    this.scene.triggerRestart();
  }

  /**
   * Set the brightness and enabled gun flash.
   * @param {Number} power The power of the gun shot.
   */
  onExplosion(power) {
    this.flash += Math.min(power / 5, MAX_GUN_FLASH_AMOUNT);
    this.explosionFlash = true;
  }

  /**
   * Add an explosion to the world.
   * @param {World} explosion The explosion to add.
   */
  addExplosion(explosion) {
    this.explosions.push(explosion);
  }

  /**
   * Remove an explosion from the world.
   * @param  {Explosion} explosion The explosion to remove.
   */
  removeExplosion(explosion) {
    this.explosions = this.explosions.filter(e => e.id !== explosion.id);
  }


  /**
   * Set the brightness and enabled item flash.
   */
  onItemPickup(item) {
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
      itemsFound: this.items.filter(item => item.isRemoved()).length,
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
