import { search } from '@game/core/ai';
import { World as PhysicsWorld } from '@game/core/physics';
import { CELL_SIZE } from '@constants/config';
import Effect from './components/Effect';
import { NODE_WEIGHTS, createGraphs } from './helpers';

const ENTRANCE_INTERVAL = 700;

const EVENTS = { EFFECT_ADDED: 'world:effect:added' };

const LIGHT = {
  PICKUP_AMOUNT: 0.35,
  PICKUP_DECREMENT: 0.01,
  MAX_FLASH_AMOUNT: 3,
  FLASH_DECREMENT: 0.2,
};

export default class World extends PhysicsWorld {
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
    waypoints = [],
    spawnPoints = [],
  }) {
    super(grid, [...enemies.filter(e => e.add), ...items, ...objects, player]);

    this.waypoints = waypoints.map(({ x, y }) => this.getCell(x, y));
    this.spawnPoints = spawnPoints.map(({ x, y }) => this.getCell(x, y));

    this.scene = scene;
    this.player = player;
    this.items = items;
    this.enemies = enemies;
    this.objects = objects;
    this.brightness = brightness;
    this.light = 0;
    this.flashLight = 0;
    this.pickupLight = 0;
    this.visibility = visibility * CELL_SIZE;
    this.effects = [];
    this.startTime = performance.now();
    this.exit = exit && this.getCell(...Object.values(exit));
    this.entrance = this.getCell(...Object.values(entrance));
    this.startProps = { ...this.props };
    this.sky = sky;
    this.floorOffset = floorOffset;

    this.secrets = this.grid.reduce(
      (memo, col) => [...memo, ...col.filter(cell => cell.isPushWall)],
      []
    );

    // Create graphs for pathfinding.
    this.graphs = this.dynamicBodies
      .reduce((memo, b) => {
        if (
          b.isEnemy &&
          b.collisionRadius &&
          !memo.includes(b.collisionRadius)
        ) {
          memo.push(b.collisionRadius);
        }
        return memo;
      }, [])
      .reduce(
        (memo, radius) => ({
          ...memo,
          [radius]: createGraphs(grid, radius - 1),
        }),
        {}
      );

    // Create grid for floor stains.
    this.stains = [...Array(this.maxMapX + 1).keys()].map(() =>
      [...Array(this.maxMapY + 1).keys()].map(() => 0)
    );

    this.alwaysRender = Object.values(this.bodies).filter(
      body => body.alwaysRender
    );

    player.onDeath(() => this.onPlayerDeath());

    player.onPickUp(item => this.onPlayerPickUp(item));

    player.onExit(() => this.scene.setAddingReview());
  }

  remove(body) {
    super.remove(body);
    this.alwaysRender = this.alwaysRender.filter(b => b.id !== body.id);
  }

  update(delta, elapsedMS) {
    if (this.entranceTimer) {
      this.entranceTimer = Math.max(0, this.entranceTimer - elapsedMS);
      if (this.entranceTimer === 0) this.entrance.use?.();
    }

    if (this.flashLight) {
      this.flashLight = Math.max(
        0,
        this.flashLight - LIGHT.FLASH_DECREMENT * delta
      );
    }

    if (this.pickupLight) {
      this.pickupLight = Math.max(
        0,
        this.pickupLight - LIGHT.PICKUP_DECREMENT * delta
      );
    }

    this.light = this.flashLight + this.pickupLight;

    super.update(delta, elapsedMS);
  }

  findPath(from, to, index = 0, diagonal = false) {
    const graph = this.graphs[from.collisionRadius][index];
    const start = graph.grid[from.gridX][from.gridY];
    const end = graph.grid[to.gridX][to.gridY];
    const initialWeights = [];

    graph.diagonal = diagonal;

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

  start(message) {
    this.entranceTimer = ENTRANCE_INTERVAL;
    this.player.start(message);
    this.enemies.forEach(enemy => enemy.start?.());
  }

  play() {
    this.dynamicBodies.forEach(body => body.play());
  }

  pause() {
    this.dynamicBodies.forEach(body => body.pause());
  }

  stop() {
    this.dynamicBodies.forEach(body => body.stop());
  }

  onPlayerDeath() {
    this.scene.triggerRestart();
  }

  addEffect(options) {
    const effect = new Effect({ ...options, parent: this });

    this.effects.push(effect);
    this.emit(EVENTS.EFFECT_ADDED, effect);
  }

  addFlashLight(intensity = 0) {
    if (intensity) {
      this.flashLight = Math.min(
        this.flashLight + intensity,
        LIGHT.MAX_FLASH_AMOUNT
      );
    }
  }

  addPickupLight() {
    this.pickupLight = LIGHT.PICKUP_AMOUNT;
  }

  addShake(amount) {
    if (amount) {
      this.player.shake(amount);
    }
  }

  removeEffect(effect) {
    this.effects = this.effects.filter(e => e.sourceId !== effect.sourceId);
  }

  onPlayerPickUp(item) {
    item.setRemoved();
    this.remove(item);
    this.addPickupLight();
  }

  onEffectAdded(callback) {
    this.on(EVENTS.EFFECT_ADDED, callback);
  }

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

  get props() {
    return { player: this.player.props };
  }
}
