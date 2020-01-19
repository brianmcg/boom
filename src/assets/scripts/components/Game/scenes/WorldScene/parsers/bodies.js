import { TILE_SIZE } from 'game/constants/config';
import Sector from '../entities/Sector';
import World from '../entities/World';
import Door from '../entities/Door';
import Entity from '../entities/Entity';
import Item from '../entities/Item';
import Amp from '../entities/Amp';
import Zombie from '../entities/Zombie';
import Mancubus from '../entities/Mancubus';
import Player from '../entities/Player';

const ENEMIES = [
  Amp,
  Zombie,
  Mancubus,
].reduce((result, enemy) => ({
  ...result,
  [enemy.name.toLowerCase()]: enemy,
}), {});

const createSector = (sector, stats) => {
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
      ...stats.door,
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


export const createWorld = (data, stats, player) => {
  const { entrance, exit } = data;
  const { visibility, brightness } = stats.world;

  const grid = data.grid.reduce((rows, row) => ([
    ...rows,
    row.reduce((sectors, sector) => ([
      ...sectors,
      createSector(sector, stats),
    ]), []),
  ]), []);

  const obstacles = data.obstacles.reduce((memo, obstacle) => ([
    ...memo,
    new Entity({
      type: obstacle.type,
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
    new Item({
      type: item.type,
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
      type: enemy.type,
      x: (TILE_SIZE * enemy.x) + (TILE_SIZE / 2),
      y: (TILE_SIZE * enemy.y) + (TILE_SIZE / 2),
      width: TILE_SIZE / 2,
      height: TILE_SIZE / 2,
      length: TILE_SIZE / 2,
      ...stats.enemies[enemy.name],
    }),
  ]), []);

  if (!player) {
    player = new Player(stats.player);
  }

  const world = new World({
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

  return world;
};
