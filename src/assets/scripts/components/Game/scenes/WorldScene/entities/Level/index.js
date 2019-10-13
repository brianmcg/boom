import { World } from '~/core/physics';

const EVENTS = {
  COMPLETE: 'level:complete',
};

/**
 * Class representing a level.
 */
class Level extends World {
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
    this.enemies = enemies;
  }

  /**
   * Update the level.
   * @param  {Number} delta           The delta time value.
   * @param  {Object} options.actions The player actions.
   */
  update(delta, { actions }) {
    this.player.setActions(actions);

    super.update(delta);

    if (this.isExitSector()) {
      this.emit(EVENTS.COMPLETE, this.player);
    }
  }

  isExitSector() {
    return this.getSector(this.player.gridX, this.player.gridY).exit;
  }

  /**
   * The level events.
   * @static
   * @member
   */
  static get EVENTS() {
    return EVENTS;
  }
}

export default Level;
