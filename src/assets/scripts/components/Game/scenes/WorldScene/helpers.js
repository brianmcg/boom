import * as PIXI from 'pixi.js';
import { TILE_SIZE, SCREEN } from '~/constants/config';
import { RectangleSprite, Line } from '~/core/graphics';
import {
  Sector,
  Level,
  Player,
  Door,
  Entity,
  Item,
  Amp,
} from '~/engine';
import WallSprite from './sprites/WallSprite';
import EntitySprite from './sprites/EntitySprite';
import BackgroundSprite from './sprites/BackgroundSprite';
import EnemySprite from './sprites/EnemySprite';
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

const ENEMIES = [Amp].reduce((result, enemy) => ({
  ...result,
  [enemy.name.toLowerCase()]: enemy,
}), {});

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
        const EnemyType = ENEMIES[type];

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
      } else if (body instanceof Amp) {
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

const createEnemySprite = ({ animations, textures }) => {
  const { tiles } = animations.tilesets[0];
  const textureCollection = {};

  animations.layers.forEach((layer) => {
    textureCollection[layer.name] = {};
    for (let y = 0; y < layer.height; y += 1) {
      const layerTextures = [];
      for (let x = 0; x < layer.width; x += 1) {
        const item = layer.data[(y * layer.width) + x];
        if (item) {
          const tile = tiles.find(t => t.id === item - 1);
          layerTextures.push(textures[tile.image]);
        }
      }
      if (!textures.length) {
        textureCollection[layer.name][y] = layerTextures;
      }
    }
  });

  return new EnemySprite(textureCollection);
};

const createSprites = (level, resources) => {
  const { textures, data } = resources;
  const { frames, animations } = data;

  const backgroundImages = [];
  const backgroundTextures = {};
  const backgroundSprites = [];

  const wallTextures = {};
  const wallImages = [];
  const wallSprites = [];

  const entitySprites = {};

  level.grid.forEach((row) => {
    row.forEach((sector) => {
      const {
        front,
        left,
        back,
        right,
        top,
        bottom,
      } = sector;

      [front, left, back, right].forEach((side) => {
        if (side && !wallImages.includes(side)) {
          wallImages.push(side);
        }
      });

      [top, bottom].forEach((side) => {
        if (side && !backgroundImages.includes(side)) {
          backgroundImages.push(side);
        }
      });
    });
  });

  backgroundImages.forEach((image) => {
    backgroundTextures[image] = [];

    const { frame } = frames[image];
    const texture = textures[image];

    for (let i = 0; i < TILE_SIZE; i += 1) {
      const row = [];
      for (let j = 0; j < TILE_SIZE; j += 1) {
        const pixel = new PIXI.Rectangle(frame.x + i, frame.y + j, 1, 1);
        row.push(new PIXI.Texture(texture, pixel));
      }
      backgroundTextures[image].push(row);
    }
  });

  for (let i = 0; i < SCREEN.WIDTH; i += 1) {
    const row = [];
    for (let j = 0; j < SCREEN.HEIGHT; j += 1) {
      row.push(new BackgroundSprite(backgroundTextures));
    }
    backgroundSprites.push(row);
  }

  wallImages.forEach((image) => {
    wallTextures[image] = [];

    const { frame } = frames[image];
    const texture = textures[image];

    for (let i = 0; i < frame.w; i += 1) {
      const slice = new PIXI.Rectangle(frame.x + i, frame.y, 1, frame.h);
      wallTextures[image].push(new PIXI.Texture(texture, slice));
    }
  });

  for (let i = 0; i < SCREEN.WIDTH; i += 1) {
    const wallSprite = new WallSprite(wallTextures);
    wallSprites.push(wallSprite);
  }

  level.items.forEach((item) => {
    entitySprites[item.id] = new EntitySprite(textures[item.type]);
  });

  level.objects.forEach((object) => {
    entitySprites[object.id] = new EntitySprite(textures[object.type]);
  });

  level.enemies.forEach((enemy) => {
    entitySprites[enemy.id] = createEnemySprite({
      animations: animations.enemies[enemy.type],
      textures,
    });
  });

  return {
    map: { walls: wallSprites, entities: entitySprites },
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
