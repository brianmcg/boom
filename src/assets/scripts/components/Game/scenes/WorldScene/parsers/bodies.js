import { degrees, AXES } from 'game/core/physics';
import { ITEM_TYPES, ENEMY_TYPES } from 'game/constants/assets';
import { CELL_SIZE, DEBUG } from 'game/constants/config';
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
  TransparentCell,
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
      name: cell.sides[key].name,
      height: (cell.sides[key].height || cell.height) * CELL_SIZE,
      spatter: 0,
    },
  }), {});

  if (cell.door) {
    return new Door({
      ...props.door,
      x: (CELL_SIZE * cell.x) + (CELL_SIZE / 2),
      y: (CELL_SIZE * cell.y) + (CELL_SIZE / 2),
      width: cell.width * CELL_SIZE,
      length: cell.length * CELL_SIZE,
      height: cell.height * CELL_SIZE,
      axis: cell.axis,
      blocking: cell.blocking,
      key: cell.key,
      offset: cell.offset || 0.5,
      double: cell.double,
      sides,
      soundSprite,
      reverse: cell.reverse,
      entrance: cell.entrance,
      exit: cell.exit,
      active: cell.active,
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
    return new TransparentCell({
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
    closed: cell.closed,
    edge: cell.edge,
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

  const bloodColors = [
    data.props.player,
    ...Object.values(data.props.enemies),
  ].reduce((memo, { bloodColor }) => {
    if (bloodColor && !memo.includes(bloodColor)) {
      memo.push(bloodColor);
    }

    return memo;
  }, []);

  const {
    entrance,
    exit,
    props,
    sky,
    brightness = 0.8,
    visibility = 16,
    floorOffset = 0,
    splash,
    ripple,
  } = data;

  const { animations } = graphics.data;

  const grid = data.grid.reduce((cols, col) => ([
    ...cols,
    col.reduce((cells, cell) => ([
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
        z: object.z * CELL_SIZE,
        blocking: object.blocking,
        width: Math.ceil(CELL_SIZE * object.width),
        length: Math.ceil(CELL_SIZE * object.length),
        height: Math.ceil(CELL_SIZE * object.height),
        animated: !!object.animated,
        anchor: object.anchor,
        scale: object.scale,
      }),
  ]), []);

  const items = data.items.reduce((memo, item) => ([
    ...memo,
    new ITEMS[props.items[item.name].type]({
      ...item,
      ...props.items[item.name],
      x: (CELL_SIZE * item.x) + (CELL_SIZE / 2),
      y: (CELL_SIZE * item.y) + (CELL_SIZE / 2),
      width: CELL_SIZE / 4,
      length: CELL_SIZE / 4,
      height: CELL_SIZE / 4,
      floorOffset,
    }),
  ]), []);

  const enemies = data.enemies.reduce((memo, enemy) => {
    const item = enemy.item ? {
      name: enemy.item,
      scale: 0,
      ...props.items[enemy.item]
    } : null;

    const { bloodColor, effects } = props.enemies[enemy.name];
    const { spatter } = effects;
    const numberOfSpatters = spatter ? animations[spatter].length : 0;
    const spatterTypeOffset = spatterTypes.indexOf(spatter) * numberOfSpatters;
    const spatterColorOffset = bloodColors.indexOf(bloodColor) * numberOfSpatters;
    const spatterOffset = spatter ? spatterTypeOffset + spatterColorOffset + 1 : 0;
    const spatters = [...Array(numberOfSpatters).keys()].map(i => i + spatterOffset);

    return [
      ...memo,
      new ENEMIES[props.enemies[enemy.name].behaviour]({
        type: enemy.type,
        name: enemy.name,
        x: (CELL_SIZE * enemy.x) + (CELL_SIZE / 2),
        y: (CELL_SIZE * enemy.y) + (CELL_SIZE / 2),
        width: Math.min(
          Math.max(Math.round(CELL_SIZE * enemy.width), CELL_SIZE / 2),
          CELL_SIZE - 1,
        ),
        length: Math.min(
          Math.max(Math.round(CELL_SIZE * enemy.length), CELL_SIZE / 2),
          CELL_SIZE - 1,
        ),
        height: Math.round(CELL_SIZE * enemy.height),
        float: enemy.float,
        scale: enemy.scale,
        proneHeight: enemy.proneHeight,
        ...props.enemies[enemy.name],
        spatters,
        soundSprite,
        splash,
        ripple,
        item: item
          ? new ITEMS[item.type]({
            width: CELL_SIZE / 4,
            length: CELL_SIZE / 4,
            height: CELL_SIZE / 4,
            floorOffset,
            ...item,
          })
          : null,
      }),
    ];
  }, []);

  const { bloodColor, effects } = props.player;
  const { spatter } = effects;
  const numberOfSpatters = spatter ? animations[spatter].length : 0;
  const spatterTypeOffset = spatterTypes.indexOf(spatter) * numberOfSpatters;
  const spatterColorOffset = bloodColors.indexOf(bloodColor) * numberOfSpatters;
  const spatterOffset = spatter ? spatterTypeOffset + spatterColorOffset + 1 : 0;
  const spatters = [...Array(numberOfSpatters).keys()].map(i => i + spatterOffset);
  const weapons = Object.keys(props.player.weapons).reduce((memo, key) => ({
    ...memo,
    [key]: {
      ...props.player.weapons[key],
      equiped: !!DEBUG || props.player.weapons[key].equiped,
    },
  }), {});

  const player = new Player({
    ...props.player,
    x: (CELL_SIZE * entrance.x) + (CELL_SIZE / 2),
    y: (CELL_SIZE * entrance.y) + (CELL_SIZE / 2),
    angle: degrees(entrance.angle) + 0.0001,
    soundSprite,
    items: enemies.reduce((memo, { item }) => item ? [...memo, item] : memo, items),
    spatters,
    weapons,
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
    floorOffset,
  });
};
