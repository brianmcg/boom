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
      objects = [],
      items = [],
      grid = [[]],
    } = options;

    super(grid);

    enemies.forEach(enemy => this.add(enemy));
    objects.forEach(object => this.add(object));
    items.forEach(item => this.add(item));

    this.add(player);
    this.player = player;
    this.objects = objects;
    this.items = items;
  }

  update(delta, input) {
    this.player.actions = input;

    super.update(delta);
  }
}
