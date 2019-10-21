import { TILE_SIZE } from '~/constants/config';
import Sector from '../entities/Sector';
import World from '../entities/World';
import Player from '../entities/Player';
import Door from '../entities/Door';
import Entity from '../entities/Entity';
import Item from '../entities/Item';
import Amp from '../entities/Amp';
import Zombie from '../entities/Zombie';
import Mancubus from '../entities/Mancubus';

const SECTOR_TYPES = {
  START: 'start',
  END: 'end',
};

const ENEMY_TYPES = [Amp, Zombie, Mancubus].reduce((result, enemy) => ({
  ...result,
  [enemy.name.toLowerCase()]: enemy,
}), {});

const MAP_LAYERS = {
  FLOOR: 0,
  WALLS: 1,
  DOORS: 2,
  ITEMS: 3,
  ENEMIES: 4,
  ROOF: 5,
  GAME: 6,
};

export const createWorld = (data) => {
  const grid = [];
  const objects = [];
  const items = [];
  const enemies = [];

  const mapWidth = data.layers[MAP_LAYERS.WALLS].width;
  const mapHeight = data.layers[MAP_LAYERS.WALLS].height;
  const { tiles } = data.tilesets[0];
  const start = {};
  const end = {};

  data.layers[MAP_LAYERS.GAME].objects.forEach((object) => {
    if (object.name === SECTOR_TYPES.START) {
      start.x = Math.floor(object.x / TILE_SIZE);
      start.y = Math.floor(object.y / TILE_SIZE);
    }
    if (object.name === SECTOR_TYPES.END) {
      end.x = Math.floor(object.x / TILE_SIZE);
      end.y = Math.floor(object.y / TILE_SIZE);
    }
  });

  for (let y = 0; y < mapHeight; y += 1) {
    const row = [];

    for (let x = 0; x < mapWidth; x += 1) {
      const index = (y * mapWidth) + x;
      const floorValue = data.layers[MAP_LAYERS.FLOOR].data[index];
      const wallValue = data.layers[MAP_LAYERS.WALLS].data[index];
      const doorValue = data.layers[MAP_LAYERS.DOORS].data[index];
      const itemValue = data.layers[MAP_LAYERS.ITEMS].data[index];
      const enemyValue = data.layers[MAP_LAYERS.ENEMIES].data[index];
      const roofValue = data.layers[MAP_LAYERS.ROOF].data[index];

      let wallImage;
      let doorImage;
      let properties;
      let sides;
      let doorAxisX;
      let floorImage;
      let roofImage;

      if (floorValue) {
        floorImage = tiles.find(t => t.id === floorValue - 1).image;
      }

      if (roofValue) {
        roofImage = tiles.find(t => t.id === roofValue - 1).image;
      }

      if (wallValue) {
        wallImage = tiles.find(tile => tile.id === wallValue - 1).image;

        if (doorValue) {
          doorImage = tiles.find(tile => tile.id === doorValue - 1).image;
        }
      }

      if (doorValue) {
        const tile = tiles.find(t => t.id === doorValue - 1);
        doorImage = tile.image;
        doorAxisX = data.layers[MAP_LAYERS.DOORS].data[index - 1]
          || data.layers[MAP_LAYERS.DOORS].data[index + 1];
      }

      if (!!doorImage && !wallImage) {
        const tile = tiles.find(t => t.id === doorValue - 1);
        properties = tile.properties || [];

        const key = (properties.find(prop => prop.name === 'key') || {}).value;

        row.push(new Door({
          x: (TILE_SIZE * x) + (TILE_SIZE / 2),
          y: (TILE_SIZE * y) + (TILE_SIZE / 2),
          width: TILE_SIZE,
          height: TILE_SIZE,
          length: TILE_SIZE,
          axis: doorAxisX ? 'x' : 'y',
          blocking: !!doorImage,
          sides: {
            front: doorImage,
            left: doorImage,
            back: doorImage,
            right: doorImage,
            bottom: floorImage,
            top: roofImage,
          },
          key,
        }));
      } else {
        if (doorImage) {
          if (doorAxisX) {
            sides = {
              front: doorImage,
              left: wallImage,
              back: doorImage,
              right: wallImage,
              bottom: floorImage,
              top: roofImage,
            };
          } else {
            sides = {
              front: wallImage,
              left: doorImage,
              back: wallImage,
              right: doorImage,
              bottom: floorImage,
              top: roofImage,
            };
          }
        } else {
          sides = {
            front: wallImage,
            left: wallImage,
            back: wallImage,
            right: wallImage,
            bottom: floorImage,
            top: roofImage,
          };
        }

        const sector = new Sector({
          x: (TILE_SIZE * x) + (TILE_SIZE / 2),
          y: (TILE_SIZE * y) + (TILE_SIZE / 2),
          width: TILE_SIZE,
          height: wallImage ? TILE_SIZE : 0,
          length: TILE_SIZE,
          blocking: !!wallImage,
          sides,
        });

        sector.exit = x === end.x && y === end.y;

        row.push(sector);
      }

      if (itemValue) {
        const tile = tiles.find(t => t.id === itemValue - 1);
        properties = tile.properties || [];

        const key = (properties.find(prop => prop.name === 'key') || {}).value;
        const { value } = properties.find(prop => prop.name === 'value') || {};

        if (key) {
          items.push(new Item({
            type: tile.image,
            x: (TILE_SIZE * x) + (TILE_SIZE / 2),
            y: (TILE_SIZE * y) + (TILE_SIZE / 2),
            width: TILE_SIZE / 2,
            length: TILE_SIZE / 2,
            blocking: false,
            key,
            value,
          }));
        } else {
          const nonBlocking = (properties.find(prop => prop.name === 'nonBlocking') || {}).value;

          objects.push(new Entity({
            type: tile.image,
            x: (TILE_SIZE * x) + (TILE_SIZE / 2),
            y: (TILE_SIZE * y) + (TILE_SIZE / 2),
            width: TILE_SIZE / 2,
            height: TILE_SIZE / 2,
            length: TILE_SIZE / 2,
            blocking: !nonBlocking,
          }));
        }
      }

      if (enemyValue) {
        const { image } = tiles.find(t => t.id === enemyValue - 1);
        const type = image.split('_')[0];
        const EnemyType = ENEMY_TYPES[type];

        if (EnemyType) {
          enemies.push(new EnemyType({
            type,
            x: (TILE_SIZE * x) + (TILE_SIZE / 2),
            y: (TILE_SIZE * y) + (TILE_SIZE / 2),
            width: TILE_SIZE / 2,
            height: TILE_SIZE / 2,
            length: TILE_SIZE / 2,
          }));
        }
      }
    }

    grid.push(row);
  }

  const player = new Player({
    x: (TILE_SIZE * start.x) + (TILE_SIZE / 2),
    y: (TILE_SIZE * start.y) + (TILE_SIZE / 2),
    width: TILE_SIZE / 2,
    height: TILE_SIZE / 2,
    length: TILE_SIZE / 2,
  });

  const world = new World({
    grid,
    player,
    objects,
    items,
    enemies,
  });

  return world;
};
