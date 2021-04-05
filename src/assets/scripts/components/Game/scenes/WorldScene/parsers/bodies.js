import { degrees, AXES } from 'game/core/physics';
import { ITEM_TYPES, ENEMY_TYPES } from 'game/constants/assets';
import { CELL_SIZE } from 'game/constants/config';
import {
  Cell,
  PushWall,
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
      ...props.door,
      x: (CELL_SIZE * cell.x) + (CELL_SIZE / 2),
      y: (CELL_SIZE * cell.y) + (CELL_SIZE / 2),
      width: cell.axis === AXES.X ? CELL_SIZE : 3,
      length: cell.axis === AXES.Y ? CELL_SIZE : 3,
      height: cell.height * CELL_SIZE,
      axis: cell.axis,
      blocking: cell.blocking,
      key: cell.key,
      offset: cell.offset || 0.5,
      double: cell.double,
      sides,
      soundSprite,
      reverse: cell.reverse,
      overlay: cell.overlay,
    });
  }

  if (cell.pushable) {
    return new PushWall({
      ...props.pushWall,
      x: (CELL_SIZE * cell.x) + (CELL_SIZE / 2),
      y: (CELL_SIZE * cell.y) + (CELL_SIZE / 2),
      width: CELL_SIZE,
      length: CELL_SIZE,
      height: cell.height * CELL_SIZE,
      axis: cell.axis,
      blocking: cell.blocking,
      offset: 0.1,
      sides,
      soundSprite,
    });
  }

  if (cell.transparency) {
    return new Cell({
      x: (CELL_SIZE * cell.x) + (CELL_SIZE / 2),
      y: (CELL_SIZE * cell.y) + (CELL_SIZE / 2),
      blocking: cell.blocking,
      axis: cell.axis,
      width: cell.axis === AXES.X ? CELL_SIZE : CELL_SIZE / 2,
      length: cell.axis === AXES.Y ? CELL_SIZE : CELL_SIZE / 2,
      height: cell.height * CELL_SIZE,
      transparency: cell.transparency,
      offset: cell.offset,
      reverse: cell.reverse,
      sides,
    });
  }


  return new Cell({
    x: (CELL_SIZE * cell.x) + (CELL_SIZE / 2),
    y: (CELL_SIZE * cell.y) + (CELL_SIZE / 2),
    blocking: cell.blocking,
    width: CELL_SIZE,
    length: CELL_SIZE,
    height: cell.height * CELL_SIZE,
    reverse: cell.reverse,
    sides,
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

  const {
    entrance,
    exit,
    props,
    sky,
  } = data;

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
    const { spatter } = data.props.enemies[enemy.name].effects;
    const numberOfSpatters = spatter ? animations[spatter].length : 0;
    const spatterOffset = spatter
      ? (spatterTypes.indexOf(spatter) * numberOfSpatters) + 1
      : 0;

    const spatters = [...Array(numberOfSpatters).keys()].map(i => i + spatterOffset);

    return [
      ...memo,
      new ENEMIES[props.enemies[enemy.name].behaviour]({
        type: enemy.type,
        name: enemy.name,
        x: (CELL_SIZE * enemy.x) + (CELL_SIZE / 2),
        y: (CELL_SIZE * enemy.y) + (CELL_SIZE / 2),
        width: Math.max(Math.ceil(CELL_SIZE * enemy.width), CELL_SIZE / 2),
        length: Math.max(Math.ceil(CELL_SIZE * enemy.length), CELL_SIZE / 2),
        height: Math.ceil(CELL_SIZE * enemy.height),
        float: enemy.float,
        proneHeight: enemy.proneHeight,
        ...props.enemies[enemy.name],
        spatters,
        soundSprite,
      }),
    ];
  }, []);

  const { spatter } = props.player.effects;

  const numberOfSpatters = spatter ? animations[spatter].length : 0;

  const spatterOffset = spatter
    ? (spatterTypes.indexOf(spatter) * numberOfSpatters) + 1
    : 0;

  const spatters = [...Array(numberOfSpatters).keys()].map(i => i + spatterOffset);

  const player = new Player({
    ...props.player,
    x: (CELL_SIZE * entrance.x) + (CELL_SIZE / 2),
    y: (CELL_SIZE * entrance.y) + (CELL_SIZE / 2),
    angle: degrees(entrance.angle),
    soundSprite,
    items,
    spatters,
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
    sky,
  });
};
