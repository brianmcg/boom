import { World as PhysicsWorld } from 'game/core/physics';
import { TILE_SIZE } from 'game/constants/config';

const MAX_GUN_FLASH_AMOUNT = 0.8;

const ITEM_FLASH_AMOUNT = 0.35;

const GUN_FLASH_DECREMENT = 0.2;

const ITEM_FLASH_DECREMENT = 0.01;

/**
 * Class representing a world.
 */
class World extends PhysicsWorld {
  /**
   * Creates a world.
   * @param  {[type]} options.index       The index of the world.
   * @param  {Player} options.player      The player.
   * @param  {Array}  options.enemies     The enemies.
   * @param  {Array}  options.obstacles   The obstacles.
   * @param  {Array}  options.items       The items.
   * @param  {Array}  options.grid        The sector grid.
   * @param  {Object} options.entrance    The entrance coordinates.
   * @param  {Object} options.exit        The exit coordinates.
   * @param  {Number} options.visibility  The visibility of the world.
   * @param  {Number} options.brightness  The brightness of the world.

   */
  constructor({
    index,
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

    enemies.forEach(enemy => this.add(enemy));
    obstacles.forEach(object => this.add(object));
    items.forEach(item => this.add(item));

    this.exit = exit;
    this.entrance = entrance;

    this.addPlayer(player);

    this.player = player;
    this.items = items;
    this.enemies = enemies;
    this.obstacles = obstacles;

    this.baseBrightness = brightness;
    this.brightness = brightness;
    this.visibility = visibility;

    this.gunFlash = false;
    this.itemFlash = false;

    this.index = index;
    this.startTime = performance.now();
  }

  /**
   * Update the world.
   * @param  {Number} delta            The delta time value.
   * @param  {Object} options.actions  The player actions.
   */
  update(delta, { actions }) {
    const { gridX, gridY } = this.player;
    const { x, y } = this.exit;

    if (this.gunFlash) {
      this.brightness -= GUN_FLASH_DECREMENT * delta;
    }

    if (this.itemFlash) {
      this.brightness -= ITEM_FLASH_DECREMENT * delta;
    }

    if (this.brightness <= this.baseBrightness) {
      this.itemFlash = false;
      this.gunFlash = false;
      this.brightness = this.baseBrightness;
    }

    this.player.setActions(actions);

    if (x === gridX && y === gridY) {
      this.scene.setReviewing();
    }

    super.update(delta);
  }

  /**
   * Add the player to the world.
   * @param {Player} player The player.
   */
  addPlayer(player) {
    super.add(player);

    player.x = (TILE_SIZE * this.entrance.x) + (TILE_SIZE / 2);
    player.y = (TILE_SIZE * this.entrance.y) + (TILE_SIZE / 2);
    player.angle = 0;
    player.velocity = 0;
    player.weapon.setArming();
    player.actions.use = true;
    player.updateInteractions();
  }

  /**
   * Set the brightness and enabled gun flash.
   * @param {Number} power The power of the gun shot.
   */
  setGunFlash(power) {
    this.brightness += Math.min(power / 10, MAX_GUN_FLASH_AMOUNT);
    this.gunFlash = true;
  }

  /**
   * Set the brightness and enabled item flash.
   */
  setItemFlash() {
    this.brightness += ITEM_FLASH_AMOUNT;
    this.itemFlash = true;
  }

  /**
   * Get the world statistics
   * @return {Object} Info about the world to date.
   */
  getStatistics() {
    return {
      levelNumber: this.scene.index,
      timeTaken: performance.now() - this.startTime,
      itemsFound: this.items.filter(item => item.found).length,
      itemsTotal: this.items.length,
      enemiesKilled: this.enemies.filter(enemy => enemy.isDead()).length,
      enemiesTotal: this.enemies.length,
    };
  }
}

export default World;
