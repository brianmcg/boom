import * as PIXI from 'pixi.js';
import { TILE_SIZE, SCREEN } from '~/constants/config';
import { Sector } from '~/core/physics';
import { RectangleSprite, Line } from '~/core/graphics';
import Level from '~/engine/components/Level';
import Player from '~/engine/components/Player';
import Door from '~/engine/components/Door';
import Entity from '~/engine/components/Entity';
import Item from '~/engine/components/Item';
import Enemy from '~/engine/components/Enemy';
import WallSprite from './sprites/WallSprite';
import EntitySprite from './sprites/EntitySprite';
import BackgroundSprite from './sprites/BackgroundSprite';
import {
  BROWN,
  RED,
  YELLOW,
  BLUE,
  WHITE,
} from '~/constants/colors';

/**
 * @module game/scenes/world-scene/helpers
 */

const SECTOR_TYPES = {
  START: 'start',
  END: 'end',
};

const LAYERS = {
  FLOOR: 0,
  WALLS: 1,
  DOORS: 2,
  ITEMS: 3,
  ENEMIES: 4,
  ROOF: 5,
  GAME: 6,
};

const createLevel = (data) => {
  const grid = [];
  const objects = [];
  const items = [];
  const enemies = [];

  const mapWidth = data.layers[LAYERS.WALLS].width;
  const mapHeight = data.layers[LAYERS.WALLS].height;
  const { tiles } = data.tilesets[0];
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
      const floorValue = data.layers[LAYERS.FLOOR].data[index];
      const wallValue = data.layers[LAYERS.WALLS].data[index];
      const doorValue = data.layers[LAYERS.DOORS].data[index];
      const itemValue = data.layers[LAYERS.ITEMS].data[index];
      const enemyValue = data.layers[LAYERS.ENEMIES].data[index];
      const roofValue = data.layers[LAYERS.ROOF].data[index];

      let wallImage;
      let doorImage;
      let properties;
      let sideIds;
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
        doorAxisX = data.layers[LAYERS.DOORS].data[index - 1]
          || data.layers[LAYERS.DOORS].data[index + 1];
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
          sideIds: [doorImage, doorImage, doorImage, doorImage, floorImage, roofImage],
          key,
        }));
      } else {
        if (doorImage) {
          if (doorAxisX) {
            sideIds = [doorImage, wallImage, doorImage, wallImage, floorImage, roofImage];
          } else {
            sideIds = [wallImage, doorImage, wallImage, doorImage, floorImage, roofImage];
          }
        } else {
          sideIds = [wallImage, wallImage, wallImage, wallImage, floorImage, roofImage];
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

      // if (enemyValue) {
      //   enemies.push(new Enemy({
      //     x: (TILE_SIZE * x) + (TILE_SIZE / 2),
      //     y: (TILE_SIZE * y) + (TILE_SIZE / 2),
      //     width: TILE_SIZE / 2,
      //     height: TILE_SIZE / 2,
      //     length: TILE_SIZE / 2,
      //   }));
      // }
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
      } else if (body instanceof Door) {
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
  const backgroundPixelTextures = {};
  const wallSprites = [];
  const backgroundSprites = [];
  const { textures, data } = resources;
  const { frames } = data;
  const backgroundImages = [];

  level.grid.forEach((row) => {
    row.forEach((sector) => {
      const [a, b, c, d, e, f] = sector.sideIds;
      [a, b, c, d].forEach((sideId) => {
        if (sideId && !wallImages.includes(sideId)) {
          wallImages.push(sideId);
        }
      });
      [e, f].forEach((sideId) => {
        if (sideId && !backgroundImages.includes(sideId)) {
          backgroundImages.push(sideId);
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

  const mapSprites = {};

  level.items.forEach((item) => {
    mapSprites[item.id] = new EntitySprite(textures[item.type]);
  });

  level.objects.forEach((object) => {
    mapSprites[object.id] = new EntitySprite(textures[object.type]);
  });

  backgroundImages.forEach((image) => {
    backgroundPixelTextures[image] = [];

    const { frame } = frames[image];
    const texture = textures[image];

    for (let i = 0; i < TILE_SIZE; i += 1) {
      const row = [];
      for (let j = 0; j < TILE_SIZE; j += 1) {
        const pixel = new PIXI.Rectangle(frame.x + i, frame.y + j, 1, 1);
        row.push(new PIXI.Texture(texture, pixel));
      }
      backgroundPixelTextures[image].push(row);
    }
  });

  for (let i = 0; i < SCREEN.WIDTH; i += 1) {
    const row = [];
    for (let j = 0; j < SCREEN.HEIGHT; j += 1) {
      row.push(new BackgroundSprite(backgroundPixelTextures));
    }
    backgroundSprites.push(row);
  }

  return {
    map: { walls: wallSprites, objects: mapSprites },
    background: backgroundSprites,
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
