import { TILE_SIZE } from 'game/constants/config';
import Sector from '../entities/Sector';
import World from '../entities/World';
import Door from '../entities/Door';
import Entity from '../entities/Entity';
import Amp from '../entities/Amp';
import Zombie from '../entities/Zombie';
import Mancubus from '../entities/Mancubus';
import Player from '../entities/Player';
import Key from '../entities/Key';
import Ammo from '../entities/Ammo';
import Health from '../entities/Health';
import Weapon from '../entities/Weapon';

const ENEMIES = [
  Amp,
  Zombie,
  Mancubus,
].reduce((result, enemy) => ({
  ...result,
  [enemy.name.toLowerCase()]: enemy,
}), {});

const ITEMS = [
  Key,
  Ammo,
  Health,
  Weapon,
].reduce((result, item) => ({
  ...result,
  [item.name.toLowerCase()]: item,
}), {});

const createSector = (sector, props) => {
  if (sector.door) {
    return new Door({
      x: (TILE_SIZE * sector.x) + (TILE_SIZE / 2),
      y: (TILE_SIZE * sector.y) + (TILE_SIZE / 2),
      width: TILE_SIZE,
      height: TILE_SIZE,
      length: TILE_SIZE,
      axis: sector.axis,
      blocking: sector.blocking,
      sides: sector.sides,
      key: sector.key,
      ...props.door,
    });
  }

  return new Sector({
    x: (TILE_SIZE * sector.x) + (TILE_SIZE / 2),
    y: (TILE_SIZE * sector.y) + (TILE_SIZE / 2),
    blocking: sector.blocking,
    sides: sector.sides,
    width: TILE_SIZE,
    height: sector.blocking ? TILE_SIZE : 0,
    length: TILE_SIZE,
  });
};

/**
 * Create a world.
 * @param  {Object} data   The world data.
 * @return {World}         The created world.
 */
export const createWorld = (data) => {
  const { entrance, exit, props } = data;
  const { visibility, brightness } = props.world;

  const grid = data.grid.reduce((rows, row) => ([
    ...rows,
    row.reduce((sectors, sector) => ([
      ...sectors,
      createSector(sector, props),
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
      animated: obstacle.animated,
    }),
  ]), []);

  const items = data.items.reduce((memo, item) => ([
    ...memo,
    new ITEMS[item.name]({
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
    new ENEMIES[enemy.name]({
      x: (TILE_SIZE * enemy.x) + (TILE_SIZE / 2),
      y: (TILE_SIZE * enemy.y) + (TILE_SIZE / 2),
      width: TILE_SIZE / 2,
      height: TILE_SIZE / 2,
      length: TILE_SIZE / 2,
      ...props.enemies[enemy.name],
    }),
  ]), []);

  const player = new Player(props.player);

  return new World({
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
