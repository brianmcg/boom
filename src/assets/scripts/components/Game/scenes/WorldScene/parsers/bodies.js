import { degrees } from 'game/core/physics';
import { ITEM_TYPES, ENEMY_TYPES } from 'game/constants/assets';
import { CELL_SIZE } from 'game/constants/config';
import {
  Cell,
  World,
  Door,
  Entity,
  ExplosiveEntity,
  GunEnemy,
  ChaseEnemy,
  ProjectileEnemy,
  Player,
  KeyItem,
  AmmoItem,
  HealthItem,
  WeaponItem,
} from 'game/engine';

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

const createCell = ({ cell, props, soundSprite }) => {
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
      length: CELL_SIZE,
      height: CELL_SIZE,
      axis: cell.axis,
      blocking: cell.blocking,
      sides,
      offset: cell.offset,
      key: cell.key,
      ...props.door,
      soundSprite,
    });
  }

  if (cell.transparency) {
    return new Cell({
      x: (CELL_SIZE * cell.x) + (CELL_SIZE / 2),
      y: (CELL_SIZE * cell.y) + (CELL_SIZE / 2),
      blocking: cell.blocking,
      axis: cell.axis,
      sides,
      width: CELL_SIZE,
      length: CELL_SIZE,
      height: cell.blocking ? CELL_SIZE : 0,
      transparency: cell.transparency,
      offset: cell.offset,
    });
  }

  return new Cell({
    x: (CELL_SIZE * cell.x) + (CELL_SIZE / 2),
    y: (CELL_SIZE * cell.y) + (CELL_SIZE / 2),
    blocking: cell.blocking,
    sides,
    width: CELL_SIZE,
    length: CELL_SIZE,
    height: cell.blocking ? CELL_SIZE : 0,
    offset: cell.offset,
  });
};

/**
 * Create a world.
 * @param  {Object} data   The world data.
 * @return {World}         The created world.
 */
export const createWorld = ({ scene, data, graphics }) => {
  const { soundSprite } = scene.game;
  const spatterTypes = Object.values(data.props.enemies).reduce((memo, { effects }) => {
    if (effects.spatter && !memo.includes(effects.spatter)) {
      return [...memo, effects.spatter];
    }
    return memo;
  }, []);

  const { entrance, exit, props } = data;
  const { visibility, brightness } = props.world;
  const { animations } = graphics.data;

  const grid = data.grid.reduce((rows, row) => ([
    ...rows,
    row.reduce((cells, cell) => ([
      ...cells,
      createCell({ cell, soundSprite, props }),
    ]), []),
  ]), []);

  const objects = data.objects.reduce((memo, object) => ([
    ...memo,
    props.objects[object.name]?.explosive
      ? new ExplosiveEntity({
        name: object.name,
        x: (CELL_SIZE * object.x) + (CELL_SIZE / 2),
        y: (CELL_SIZE * object.y) + (CELL_SIZE / 2),
        blocking: object.blocking,
        width: Math.ceil(CELL_SIZE * object.width),
        length: Math.ceil(CELL_SIZE * object.length),
        height: Math.ceil(CELL_SIZE * object.height),
        animated: !!object.animated,
        ...props.objects[object.name],
        soundSprite,
      })
      : new Entity({
        name: object.name,
        x: (CELL_SIZE * object.x) + (CELL_SIZE / 2),
        y: (CELL_SIZE * object.y) + (CELL_SIZE / 2),
        blocking: object.blocking,
        width: Math.ceil(CELL_SIZE * object.width),
        length: Math.ceil(CELL_SIZE * object.length),
        height: Math.ceil(CELL_SIZE * object.height),
        animated: !!object.animated,
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
      length: CELL_SIZE / 2,
      height: CELL_SIZE / 2,
    }),
  ]), []);

  const enemies = data.enemies.reduce((memo, enemy) => {
    const { effects } = data.props.enemies[enemy.name];
    const spatters = effects.spatter ? animations[effects.spatter].length : 0;
    const spatterOffset = effects.spatter
      ? (spatterTypes.indexOf(effects.spatter) * spatters) + 1
      : 0;

    return [
      ...memo,
      new ENEMIES[props.enemies[enemy.name].behaviour]({
        type: enemy.type,
        name: enemy.name,
        x: (CELL_SIZE * enemy.x) + (CELL_SIZE / 2),
        y: (CELL_SIZE * enemy.y) + (CELL_SIZE / 2),
        width: Math.ceil(CELL_SIZE * enemy.width),
        length: Math.ceil(CELL_SIZE * enemy.length),
        height: Math.ceil(CELL_SIZE * enemy.height),
        float: enemy.float,
        proneHeight: enemy.proneHeight,
        ...props.enemies[enemy.name],
        spatterOffset,
        spatters,
        soundSprite,
      }),
    ];
  }, []);

  const player = new Player({
    ...props.player,
    x: (CELL_SIZE * entrance.x) + (CELL_SIZE / 2),
    y: (CELL_SIZE * entrance.y) + (CELL_SIZE / 2),
    angle: degrees(entrance.angle),
    soundSprite,
    items,
  });

  return new World({
    scene,
    grid,
    player,
    objects,
    items,
    enemies,
    entrance,
    exit,
    visibility,
    brightness,
  });
};
