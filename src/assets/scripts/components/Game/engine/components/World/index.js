import { search, Graph } from 'game/core/ai';
import { World as PhysicsWorld } from 'game/core/physics';
import { CELL_SIZE } from 'game/constants/config';
import Effect from './components/Effect';

const ITEM_FLASH_AMOUNT = 0.35;

const ITEM_FLASH_DECREMENT = 0.01;

const MAX_EXPLOSION_FLASH_AMOUNT = 1.5;

const EXPLOSION_FLASH_DECREMENT = 0.15;

const FLASH_MULTIPLIER = 0.2;

const ENTRANCE_INTERVAL = 500;

const EFFECT_ADDED_EVENT = 'world:effect:added';

const NODE_WEIGHTS = {
  WALL: 0,
  FREE: 1,
  DYNAMIC_BODY: 20,
  STATIC_BODY: 100,
};

/**
 * Class representing a world.
 */
class World extends PhysicsWorld {
  /**
   * Creates a world.
   * @param  {Number} options.index       The index of the world.
   * @param  {Player} options.player      The player.
   * @param  {Array}  options.enemies     The enemies.
   * @param  {Array}  options.objects   The objects.
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
    objects = [],
    items = [],
    grid = [[]],
    entrance,
    exit,
    visibility,
    brightness,
    sky,
    floorOffset = 0,
  }) {
    super(grid, [
      ...enemies,
      ...items,
      ...objects,
      player,
    ]);

    this.scene = scene;
    this.player = player;
    this.items = items;
    this.enemies = enemies;
    this.objects = objects;
    this.brightness = brightness;
    this.flash = 0;
    this.visibility = visibility * CELL_SIZE;
    this.explosionFlash = false;
    this.itemFlash = false;
    this.effects = [];
    this.startTime = performance.now();
    this.exit = this.getCell(...Object.values(exit));
    this.entrance = this.getCell(...Object.values(entrance));
    this.startingProps = Object.assign({}, this.props);
    this.sky = sky;
    this.floorOffset = floorOffset;

    this.secrets = this.grid.reduce((memo, col) => ([
      ...memo,
      ...col.filter(cell => cell.isPushWall),
    ]), []);

    player.onDeath(() => this.onPlayerDeath());

    player.onPickUp(item => this.onPlayerPickUp(item));

    player.onExit(() => this.scene.setAddingReviewing());

    // Create graph for pathfinding.
    this.graphs = [
      new Graph(grid.map(col => col.map((cell) => {
        if (cell.blocking && !cell.isDoor) {
          return NODE_WEIGHTS.WALL;
        }

        if (cell.bodies.some(body => body.blocking && !body.isDynamic)) {
          return NODE_WEIGHTS.STATIC_BODY;
        }

        return NODE_WEIGHTS.FREE;
      })), {
        diagonal: true,
      }),
      new Graph(grid.map(col => col.map((cell) => {
        if (cell.blocking && !cell.isDoor && !cell.transparency) {
          return NODE_WEIGHTS.WALL;
        }

        if (cell.bodies.some(body => body.blocking && !body.isDynamic)) {
          return NODE_WEIGHTS.STATIC_BODY;
        }

        return NODE_WEIGHTS.FREE;
      })), {
        diagonal: true,
      }),
    ];

    // Create grid for floor stains.
    this.stains = [...Array(this.maxMapX + 1).keys()].map(() => [
      ...Array(this.maxMapY + 1).keys(),
    ].map(() => 0));
  }

  /**
   * Update the world.
   * @param  {Number} delta            The delta time value.
   * @param  {Object} options.actions  The player actions.
   */
  update(delta, elapsedMS) {
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

    if (this.entranceTimer) {
      this.entranceTimer -= elapsedMS;

      if (this.entranceTimer <= 0) {
        this.entranceTimer = null;
        this.entrance.use();
      }
    }

    super.update(delta, elapsedMS);
  }

  /**
   * Find a path between two cells.
   * @param  {Cell} from The starting cell.
   * @param  {Cell} to   The destination cell.
   * @return {Array}     A list of cells.
   */
  findPath(from, to, index = 0) {
    const graph = this.graphs[index];
    const start = graph.grid[from.gridX][from.gridY];
    const end = graph.grid[to.gridX][to.gridY];
    const initialWeights = [];

    this.dynamicBodies.forEach(({ gridX, gridY }) => {
      const node = graph.grid[gridX][gridY];
      initialWeights.push({ x: gridX, y: gridY, weight: node.weight });
      node.weight = NODE_WEIGHTS.DYNAMIC_BODY;
    });

    const path = search(graph, start, end);

    initialWeights.forEach(({ x, y, weight }) => {
      graph.grid[x][y].weight = weight;
    });

    return path.map(node => this.getCell(node.x, node.y));
  }

  /**
   * Start the world.
   * @param  {String} message The message for the player.
   */
  start(message) {
    this.entranceTimer = ENTRANCE_INTERVAL;
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
  onPlayerDeath() {
    this.scene.triggerRestart();
  }

  /**
   * Add an explosion to the world.
   * @param {World} explosion The explosion to add.
   */
  addEffect({ flash = 0, shake, ...options }) {
    const effect = new Effect({
      ...options,
      parent: this,
    });

    this.effects.push(effect);

    this.emit(EFFECT_ADDED_EVENT, effect);

    if (flash) {
      this.explosionFlash = true;

      this.flash = Math.min(
        this.flash + (flash * FLASH_MULTIPLIER),
        MAX_EXPLOSION_FLASH_AMOUNT,
      );
    }

    if (shake) {
      this.player.shake(shake);
    }
  }

  /**
   * Remove an explosion from the world.
   * @param  {Effect} effect The effect to remove.
   */
  removeEffect(effect) {
    this.effects = this.effects.filter(e => e.sourceId !== effect.sourceId);
  }


  /**
   * Set the brightness and enabled item flash.
   */
  onPlayerPickUp(item) {
    item.setRemoved();
    this.remove(item);
    this.flash += ITEM_FLASH_AMOUNT;
    this.itemFlash = true;
  }

  /**
   * Add a callback for the effect added event.
   * @param  {Function} callback The callback to add.
   */
  onEffectAdded(callback) {
    this.on(EFFECT_ADDED_EVENT, callback);
  }

  /**
   * Get the world statistics
   * @return {Object} Info about the world to date.
   */
  getStatistics() {
    return {
      timeTaken: performance.now() - this.startTime,
      itemsFound: this.items.filter(item => item.isRemoved).length,
      itemsTotal: this.items.length,
      enemiesKilled: this.enemies.filter(enemy => enemy.isDead()).length,
      enemiesTotal: this.enemies.length,
      secretsFound: this.secrets.filter(secret => secret.isOpened).length,
      secretsTotal: this.secrets.length,
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
