import { degrees } from 'game/core/physics';
import { ITEM_TYPES, ENEMY_TYPES } from 'game/constants/assets';
import { CELL_SIZE } from 'game/constants/config';
import Cell from '../entities/Cell';
import World from '../entities/World';
import Door from '../entities/Door';
import Entity from '../entities/Entity';
import ExplosiveEntity from '../entities/ExplosiveEntity';
import GunEnemy from '../entities/GunEnemy';
import ChaseEnemy from '../entities/ChaseEnemy';
import ProjectileEnemy from '../entities/ProjectileEnemy';
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
  [ENEMY_TYPES.GUN]: GunEnemy,
  [ENEMY_TYPES.CHASE]: ChaseEnemy,
  [ENEMY_TYPES.PROJECTILE]: ProjectileEnemy,
};

const createCell = ({ cell, props }) => {
  const sides = Object.keys(cell.sides).reduce((memo, key) => ({
    ...memo,
    [key]: {
      name: cell.sides[key],
      spatter: 0,
    },
  }), {});

  if (cell.door) {
    return new Door({
      x: (CELL_SIZE * cell.x) + (CELL_SIZE / 2),
      y: (CELL_SIZE * cell.y) + (CELL_SIZE / 2),
      width: CELL_SIZE,
      height: CELL_SIZE,
      axis: cell.axis,
      blocking: cell.blocking,
      sides,
      key: cell.key,
      ...props.door,
    });
  }

  if (cell.bars) {
    return new Cell({
      x: (CELL_SIZE * cell.x) + (CELL_SIZE / 2),
      y: (CELL_SIZE * cell.y) + (CELL_SIZE / 2),
      blocking: cell.blocking,
      axis: cell.axis,
      sides,
      width: CELL_SIZE,
      height: cell.blocking ? CELL_SIZE : 0,
      bars: true,
    });
  }

  return new Cell({
    x: (CELL_SIZE * cell.x) + (CELL_SIZE / 2),
    y: (CELL_SIZE * cell.y) + (CELL_SIZE / 2),
    blocking: cell.blocking,
    sides,
    width: CELL_SIZE,
    height: cell.blocking ? CELL_SIZE : 0,
  });
};

/**
 * Create a world.
 * @param  {Object} data   The world data.
 * @return {World}         The created world.
 */
export const createWorld = ({ scene, data, graphics }) => {
  const spatterTypes = Object.values(data.props.enemies).reduce((memo, { spatterType }) => {
    if (memo.includes(spatterType)) {
      return memo;
    }
    return [...memo, spatterType];
  }, []);

  const { entrance, exit, props } = data;
  const { visibility, brightness, gravity } = props.world;
  const { animations } = graphics.data;
  // TODO: Deal with multiple spatter types.
  const spatters = animations[spatterTypes[0]].length;

  const grid = data.grid.reduce((rows, row) => ([
    ...rows,
    row.reduce((cells, cell) => ([
      ...cells,
      createCell({ cell, props }),
    ]), []),
  ]), []);

  const obstacles = data.obstacles.reduce((memo, obstacle) => ([
    ...memo,
    obstacle.explosive
      ? new ExplosiveEntity({
        name: obstacle.name,
        x: (CELL_SIZE * obstacle.x) + (CELL_SIZE / 2),
        y: (CELL_SIZE * obstacle.y) + (CELL_SIZE / 2),
        blocking: obstacle.blocking,
        width: Math.ceil(CELL_SIZE * obstacle.width),
        height: Math.ceil(CELL_SIZE * obstacle.height),
        animated: !!obstacle.animated,
        ...props.obstacles[obstacle.name],
      })
      : new Entity({
        name: obstacle.name,
        x: (CELL_SIZE * obstacle.x) + (CELL_SIZE / 2),
        y: (CELL_SIZE * obstacle.y) + (CELL_SIZE / 2),
        blocking: obstacle.blocking,
        width: Math.ceil(CELL_SIZE * obstacle.width),
        height: Math.ceil(CELL_SIZE * obstacle.height),
        animated: !!obstacle.animated,
      }),
  ]), []);

  const items = data.items.reduce((memo, item) => ([
    ...memo,
    new ITEMS[item.type]({
      ...item,
      type: item.type,
      name: item.name,
      x: (CELL_SIZE * item.x) + (CELL_SIZE / 2),
      y: (CELL_SIZE * item.y) + (CELL_SIZE / 2),
      width: CELL_SIZE / 2,
      height: CELL_SIZE / 2,
    }),
  ]), []);

  const enemies = data.enemies.reduce((memo, enemy) => ([
    ...memo,
    new ENEMIES[props.enemies[enemy.type].behaviour]({
      type: enemy.type,
      name: enemy.name,
      x: (CELL_SIZE * enemy.x) + (CELL_SIZE / 2),
      y: (CELL_SIZE * enemy.y) + (CELL_SIZE / 2),
      width: Math.ceil(CELL_SIZE * enemy.width),
      height: Math.ceil(CELL_SIZE * enemy.height),
      ...props.enemies[enemy.type],
      spatters,
    }),
  ]), []);

  const player = new Player({
    ...props.player,
    x: (CELL_SIZE * entrance.x) + (CELL_SIZE / 2),
    y: (CELL_SIZE * entrance.y) + (CELL_SIZE / 2),
    angle: degrees(entrance.angle),
  });

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
    gravity,
  });
};
