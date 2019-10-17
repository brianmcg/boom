import * as PIXI from 'pixi.js';
import { TILE_SIZE, SCREEN } from '~/constants/config';
import WallSprite from '../sprites/WallSprite';
import EntitySprite from '../sprites/EntitySprite';
import BackgroundSprite from '../sprites/BackgroundSprite';
import EnemySprite from '../sprites/EnemySprite';
import WeaponSprite from '../sprites/WeaponSprite';

const createEnemySprite = ({ animations, textures, enemy }) => {
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

  return new EnemySprite(enemy, textureCollection);
};

const createWeaponSprite = (player, textures, animations) => {
  const { tiles } = animations.tilesets[0];
  const textureCollection = {};

  animations.layers.forEach((layer) => {
    const layerTextures = [];

    layer.data.forEach((item) => {
      if (item) {
        const { image } = tiles.find(t => t.id === item - 1);

        layerTextures.push(textures[image]);
      }
    });

    textureCollection[layer.name] = layerTextures;
  });

  return new WeaponSprite(textureCollection, player);
};

const createWallSprites = (level, frames, textures) => {
  const wallImages = [];
  const wallTextures = {};
  const wallSprites = [];

  level.grid.forEach((row) => {
    row.forEach((sector) => {
      const {
        front,
        left,
        back,
        right,
      } = sector;

      [front, left, back, right].forEach((side) => {
        if (side && !wallImages.includes(side)) {
          wallImages.push(side);
        }
      });
    });
  });

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
    const wallSprite = new WallSprite(wallTextures, i);
    wallSprites.push(wallSprite);
  }

  return wallSprites;
};

const createBackgroundSprites = (level, frames, textures) => {
  const backgroundImages = [];
  const backgroundTextures = {};
  const backgroundSprites = [];

  level.grid.forEach((row) => {
    row.forEach((sector) => {
      const { top, bottom } = sector;

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

  return backgroundSprites;
};

const createEntitySprites = (level, textures, animations) => {
  const entitySprites = {};

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
      enemy,
    });
  });

  return entitySprites;
};

export const createSprites = (level, resources) => {
  const { textures, data } = resources;
  const { frames, animations } = data;
  const { player } = level;

  const entities = createEntitySprites(level, textures, animations);
  const weapon = createWeaponSprite(player, textures, animations.weapons);
  const walls = createWallSprites(level, frames, textures);
  const background = createBackgroundSprites(level, frames, textures);

  return {
    player: { weapon },
    map: { walls, entities },
    background,
  };
};
