import { TILE_SIZE, SCREEN } from '~/constants/config';
import { Sector } from '~/core/physics';
import { RectangleSprite, Line } from '~/core/graphics';
import Level from './components/Level';
import Player from './components/Player';
import DoorSector from './components/DoorSector';
import GameObject from './components/GameObject';
import Item from './components/Item';
import Enemy from './components/Enemy';
import WallSprite from './sprites/WallSprite';
import {
  BROWN,
  RED,
  YELLOW,
  BLUE,
  WHITE,
} from '~/constants/colors';

import * as PIXI from 'pixi.js';

/**
 * @module helpers
 */

const SECTOR_TYPES = {
  START: 'start',
  END: 'end',
};

const LAYERS = {
  WALLS: 0,
  DOORS: 1,
  ITEMS: 2,
  ENEMIES: 3,
  GAME: 4,
};

const createLevel = (data) => {
  const grid = [];
  const objects = [];
  const items = [];
  const enemies = [];

  const mapWidth = data.layers[LAYERS.WALLS].width;
  const mapHeight = data.layers[LAYERS.WALLS].height;
  const { tiles } = data.tilesets[LAYERS.WALLS];
  const start = {};
  const end = {};

  data.layers[LAYERS.GAME].objects.forEach((object) => {
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
      const wallValue = data.layers[LAYERS.WALLS].data[index];
      const doorValue = data.layers[LAYERS.DOORS].data[index];
      const itemValue = data.layers[LAYERS.ITEMS].data[index];
      const enemyValue = data.layers[LAYERS.ENEMIES].data[index];

      let wallImage;
      let doorImage;
      let properties;
      let sideIds;
      let doorAxisX;

      if (wallValue) {
        wallImage = tiles.find(tile => tile.id === wallValue - 1).image;

        if (doorValue) {
          doorImage = tiles.find(tile => tile.id === doorValue - 1).image;
        }
      }

      if (doorValue) {
        const tile = tiles.find(t => t.id === doorValue - 1);
        doorImage = tile.image;
        doorAxisX = data.layers[LAYERS.DOORS].data[index - 1] || data.layers[LAYERS.DOORS].data[index + 1];
      }

      if (!!doorImage && !wallImage) {
        const tile = tiles.find(t => t.id === doorValue - 1);
        properties = tile.properties || [];

        const key = (properties.find(prop => prop.name === 'key') || {}).value;

        row.push(new DoorSector({
          x: (TILE_SIZE * x) + (TILE_SIZE / 2),
          y: (TILE_SIZE * y) + (TILE_SIZE / 2),
          width: TILE_SIZE,
          height: TILE_SIZE,
          length: TILE_SIZE,
          axis: doorAxisX ? 'x' : 'y',
          blocking: !!doorImage,
          sideIds: [doorImage, doorImage, doorImage, doorImage],
          key,
        }));
      } else {
        if (doorImage) {
          if (doorAxisX) {
            sideIds = [doorImage, wallImage, doorImage, wallImage];
          } else {
            sideIds = [wallImage, doorImage, wallImage, doorImage];
          }
        } else {
          sideIds = [wallImage, wallImage, wallImage, wallImage];
        }

        const sector = new Sector({
          x: (TILE_SIZE * x) + (TILE_SIZE / 2),
          y: (TILE_SIZE * y) + (TILE_SIZE / 2),
          width: TILE_SIZE,
          height: wallImage ? TILE_SIZE : 0,
          length: TILE_SIZE,
          blocking: !!wallImage,
          sideIds,
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

          objects.push(new GameObject({
            type: tiles[itemValue - 1].image,
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
        enemies.push(new Enemy({
          x: (TILE_SIZE * x) + (TILE_SIZE / 2),
          y: (TILE_SIZE * y) + (TILE_SIZE / 2),
          width: TILE_SIZE / 2,
          height: TILE_SIZE / 2,
          length: TILE_SIZE / 2,
        }));
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

  const level = new Level({
    grid,
    player,
    objects,
    items,
    enemies,
  });

  return level;
};

const createDebugSprites = (level) => {
  const bodySprites = {};
  const { bodies } = level;

  let color;

  const raySprites = [];

  for (let i = 0; i < SCREEN.WIDTH; i += 1) {
    raySprites.push(new Line({ color: YELLOW }));
  }

  Object.values(bodies).forEach((body) => {
    if (body.blocking || body instanceof Item) {
      if (body instanceof Player) {
        color = 0x00FF00;
      } else if (body instanceof Item) {
        color = BLUE;
      } else if (body instanceof Enemy) {
        color = RED;
      } else if (body instanceof DoorSector) {
        color = BROWN;
      } else {
        color = WHITE;
      }

      bodySprites[body.id] = new RectangleSprite({
        width: body.shape.width,
        height: body.shape.length,
        color,
      });
    }
  });

  return { bodySprites, raySprites };
};

// TODO: Create level bodySprites.
const createSprites = (level, resources) => {
  const wallImages = [];
  const wallSliceTextures = {};
  const wallSprites = [];

  const { textures, data } = resources;
  const { frames } = data;

  level.grid.forEach((row) => {
    row.forEach((sector) => {
      sector.sideIds.forEach((sideId) => {
        if (sideId && !wallImages.includes(sideId)) {
          wallImages.push(sideId);
        }
      });
    });
  });

  wallImages.forEach((image) => {
    wallSliceTextures[image] = [];

    const { frame } = frames[image];
    const texture = textures[image];

    for (let i = 0; i < frame.w; i += 1) {
      const slice = new PIXI.Rectangle(frame.x + i, frame.y, 1, frame.h);
      wallSliceTextures[image].push(new PIXI.Texture(texture, slice));
    }
  });

  for (let i = 0; i < SCREEN.WIDTH; i += 1) {
    const wallSprite = new WallSprite(wallSliceTextures);
    wallSprites.push(wallSprite);
  }

  return {
    entities: { walls: wallSprites },
  };
};

/**
 * Parses the loaded scene assets.
 * @param  {Object} assets The scene assets.
 * @return {Object}        The parsed scene data.
 */
export const parse = (resources, debug) => {
  const { data } = resources;
  const { map } = data;
  const level = createLevel(map);
  const sprites = debug ? createDebugSprites(level) : createSprites(level, resources);

  return { level, sprites };
};
