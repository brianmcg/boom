import { World as PhysicsWorld } from '~/core/physics';
import { TILE_SIZE } from '~/constants/config';
import Player from '../Player';

const EVENTS = {
  EXIT: 'world:exit',
  ENTER: 'world:enter',
};

const MAX_GUN_FLASH_AMOUNT = 0.8;

const ITEM_FLASH_AMOUNT = 0.25;

const GUN_FLASH_DECREMENT = 0.2;

const ITEM_FLASH_DECREMENT = 0.01;

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
    this.player = player;
    this.obstacles = obstacles;
    this.items = items;
    this.enemies = enemies;
    this.brightness = 0;

    player.x = (TILE_SIZE * entrance.x) + (TILE_SIZE / 2); // 1088
    player.y = (TILE_SIZE * entrance.y) + (TILE_SIZE / 2); // 163
    player.angle = 0; // 928;
    player.weapon.setArming();

    this.gunFlash = false;
    this.itemFlash = false;
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

    if (this.brightness <= 0) {
      this.itemFlash = false;
      this.gunFlash = false;
      this.brightness = 0;
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
   * Emit the exit event.
   */
  exit() {
    this.emit(EVENTS.EXIT);
  }

  /**
   * The world events.
   * @static
   */
  static get EVENTS() {
    return EVENTS;
  }
}

export default World;
