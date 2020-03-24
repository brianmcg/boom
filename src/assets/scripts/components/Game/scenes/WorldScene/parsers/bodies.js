import { ITEM_TYPES, ENEMY_TYPES, EFFECT_TYPES } from 'game/constants/assets';
import { TILE_SIZE } from 'game/constants/config';
import Cell from '../entities/Cell';
import World from '../entities/World';
import Door from '../entities/Door';
import Entity from '../entities/Entity';
import GunEnemy from '../entities/GunEnemy';
import ChaseEnemy from '../entities/ChaseEnemy';
import Player from '../entities/Player';
import KeyItem from '../entities/KeyItem';
import AmmoItem from '../entities/AmmoItem';
import HealthItem from '../entities/HealthItem';
import WeaponItem from '../entities/WeaponItem';

const ITEMS = {
  [ITEM_TYPES.KEY]: KeyItem,
  [ITEM_TYPES.AMMO]: AmmoItem,
  [ITEM_TYPES.HEALTH]: HealthItem,
  [ITEM_TYPES.WEAPON]: WeaponItem,
};

const ENEMIES = {
  [ENEMY_TYPES.GRUNT]: GunEnemy,
  [ENEMY_TYPES.DEMON]: ChaseEnemy,
};

const createCell = ({ cell, props }) => {
  const sides = Object.keys(cell.sides).reduce((memo, key) => ({
    ...memo,
    [key]: {
      texture: cell.sides[key],
      spatter: 0,
    },
  }), {});

  if (cell.door) {
    return new Door({
      x: (TILE_SIZE * cell.x) + (TILE_SIZE / 2),
      y: (TILE_SIZE * cell.y) + (TILE_SIZE / 2),
      width: TILE_SIZE,
      height: TILE_SIZE,
      length: TILE_SIZE,
      axis: cell.axis,
      blocking: cell.blocking,
      sides,
      key: cell.key,
      ...props.door,
    });
  }

  return new Cell({
    x: (TILE_SIZE * cell.x) + (TILE_SIZE / 2),
    y: (TILE_SIZE * cell.y) + (TILE_SIZE / 2),
    blocking: cell.blocking,
    sides,
    width: TILE_SIZE,
    height: cell.blocking ? TILE_SIZE : 0,
    length: TILE_SIZE,
  });
};

/**
 * Create a world.
 * @param  {Object} data   The world data.
 * @return {World}         The created world.
 */
export const createWorld = ({ scene, data, graphics }) => {
  const { entrance, exit, props } = data;
  const { visibility, brightness } = props.world;
  const { animations } = graphics.data;
  const spatters = animations[EFFECT_TYPES.SPATTER].length;

  const grid = data.grid.reduce((rows, row) => ([
    ...rows,
    row.reduce((cells, cell) => ([
      ...cells,
      createCell({ cell, props }),
    ]), []),
  ]), []);

  const obstacles = data.obstacles.reduce((memo, obstacle) => ([
    ...memo,
    new Entity({
      texture: obstacle.texture,
      x: (TILE_SIZE * obstacle.x) + (TILE_SIZE / 2),
      y: (TILE_SIZE * obstacle.y) + (TILE_SIZE / 2),
      blocking: obstacle.blocking,
      height: TILE_SIZE,
      width: TILE_SIZE / 2,
      length: TILE_SIZE / 2,
      animated: !!obstacle.animated,
    }),
  ]), []);

  const items = data.items.reduce((memo, item) => ([
    ...memo,
    new ITEMS[item.type]({
      ...item,
      texture: item.texture,
      x: (TILE_SIZE * item.x) + (TILE_SIZE / 2),
      y: (TILE_SIZE * item.y) + (TILE_SIZE / 2),
      width: TILE_SIZE / 2,
      length: TILE_SIZE / 2,
      height: TILE_SIZE / 2,
    }),
  ]), []);

  const enemies = data.enemies.reduce((memo, enemy) => ([
    ...memo,
    new ENEMIES[enemy.type]({
      type: enemy.type,
      x: (TILE_SIZE * enemy.x) + (TILE_SIZE / 2),
      y: (TILE_SIZE * enemy.y) + (TILE_SIZE / 2),
      width: TILE_SIZE / 2,
      height: TILE_SIZE / 2,
      length: TILE_SIZE / 2,
      ...props.enemies[enemy.type],
      spatters,
    }),
  ]), []);

  const player = new Player(props.player);

  return new World({
    scene,
    grid,
    player,
    obstacles,
    items,
    enemies,
    entrance,
    exit,
    visibility,
    brightness,
  });
};
