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

    enemies.forEach(enemy => this.add(enemy));
    items.forEach(item => this.add(item));
    objects.forEach(object => this.add(object));

    this.add(player);
    this.player = player;
  }

  update(delta, input) {
    this.player.actions = input;

    super.update(delta);
  }
}
