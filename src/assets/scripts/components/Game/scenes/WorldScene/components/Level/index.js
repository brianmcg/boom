import { World } from '~/core/physics';

export default class Level extends World {
  /**
   * @param  {Player} options.player  [description]
   * @param  {Array}  options.enemies [description]
   * @param  {Array}  options.items   [description]
   * @param  {Array}  options.objects [description]
   */
  constructor(options) {
    const {
      player,
      enemies = [],
      items = [],
      objects = [],
      grid = [[]],
    } = options;

    super(grid);

    this.player = player;
    this.enemies = enemies;
    this.items = items;
    this.objects = objects;

    this.add(player);

    this.enemies.forEach(enemy => this.add(enemy));
    this.items.forEach(item => this.add(item));
    this.objects.forEach(object => this.add(object));
  }

  getSector(x, y) {
    return this.grid[y][x];
  }
}
