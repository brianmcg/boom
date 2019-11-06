import { World as PhysicsWorld } from 'game/core/physics';
import { TILE_SIZE } from 'game/constants/config';
import Player from '../Player';

const MAX_GUN_FLASH_AMOUNT = 0.8;

const ITEM_FLASH_AMOUNT = 0.35;

const GUN_FLASH_DECREMENT = 0.2;

const ITEM_FLASH_DECREMENT = 0.01;

const DEFAULTS = {
  BRIGHTNESS: -0.15,
  VISIBILITY: TILE_SIZE * 12,
};

/**
 * Class representing a world.
 */
class World extends PhysicsWorld {
  /**
   * Creates a world.
   * @param  {Player} options.player      The player.
   * @param  {Array}  options.enemies     The enemies.
   * @param  {Array}  options.obstacles   The obstacles.
   * @param  {Array}  options.items       The items.
   * @param  {Array}  options.grid        The sector grid.
   * @param  {Object} options.entrance    The entrance coordinates.
   */
  constructor({
    index,
    player = new Player(),
    enemies = [],
    obstacles = [],
    items = [],
    grid = [[]],
    entrance,
  }) {
    super(grid);

    enemies.forEach(enemy => this.add(enemy));
    obstacles.forEach(object => this.add(object));
    items.forEach(item => this.add(item));

    this.add(player);

    player.x = (TILE_SIZE * entrance.x) + (TILE_SIZE / 2);
    player.y = (TILE_SIZE * entrance.y) + (TILE_SIZE / 2);
    player.angle = entrance.angle;
    player.weapon.setArming();

    // player.x = 1088;
    // player.y = 163;
    // player.angle = 928;

    this.player = player;
    this.items = items;
    this.enemies = enemies;
    this.obstacles = obstacles;

    this.baseBrightness = DEFAULTS.BRIGHTNESS;
    this.brightness = DEFAULTS.BRIGHTNESS;
    this.visibility = DEFAULTS.VISIBILITY;

    this.gunFlash = false;
    this.itemFlash = false;

    this.index = index;
    this.startTime = performance.now();
  }

  /**
   * Update the world.
   * @param  {Number} delta           The delta time value.
   * @param  {Object} options.actions The player actions.
   */
  update(delta, actions) {
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

    super.update(delta);
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
      levelNumber: this.index,
      timeTaken: performance.now() - this.startTime,
      itemsFound: this.items.filter(item => item.found).length,
      itemsTotal: this.items.length,
      enemiesKilled: this.enemies.filter(enemy => enemy.isDead()).length,
      enemiesTotal: this.enemies.length,
    };
  }
}

export default World;
