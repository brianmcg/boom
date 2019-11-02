import { World as PhysicsWorld } from '~/core/physics';
import { TILE_SIZE } from '~/constants/config';
import Player from '../Player';

const EVENTS = {
  EXIT: 'world:exit',
  ENTER: 'world:enter',
};

/**
 * Class representing a world.
 */
class World extends PhysicsWorld {
  /**
   * Creates a world.
   * @param  {Player} options.player      [description]
   * @param  {Array}  options.enemies     [description]
   * @param  {Array}  options.obstacles   [description]
   * @param  {Array}  options.items       [description]
   * @param  {Array}  options.grid        [description]
   * @param  {Object} options.entrance    [description]
   */
  constructor({
    player = new Player(),
    enemies = [],
    obstacles = [],
    items = [],
    grid = [[]],
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

    player.x = 1088; // (TILE_SIZE * entrance.x) + (TILE_SIZE / 2);
    player.y = 163; // (TILE_SIZE * entrance.y) + (TILE_SIZE / 2);
    player.angle = 928; // 0;
    player.weapon.setArming();
  }

  /**
   * Update the world.
   * @param  {Number} delta           The delta time value.
   * @param  {Object} options.actions The player actions.
   */
  update(delta, actions) {
    this.brightness = Math.max(this.brightness -= 0.25 * delta, 0);
    this.player.setActions(actions);

    super.update(delta);
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
