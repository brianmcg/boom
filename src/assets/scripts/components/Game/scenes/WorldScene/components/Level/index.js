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
      grid = [[]],
    } = options;

    super(grid);

    this.items = items;

    enemies.forEach(enemy => this.add(enemy));

    items.forEach((item) => {
      this.sector(item.gridX, item.gridY).addChildId(item.id);
      this.add(item);
    });

    this.add(player);
    this.player = player;
  }

  update(delta, input) {
    this.player.actions = input;

    super.update(delta);
  }
}
