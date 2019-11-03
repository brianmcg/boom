import {
  Rectangle,
  Texture,
  TextSprite,
  RectangleSprite,
} from '~/core/graphics';
import { BLACK, WHITE, RED } from '~/constants/colors';
import { TILE_SIZE, SCREEN } from '~/constants/config';
import { FONT_SIZES } from '~/constants/fonts';
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

const createWallSprites = (world, frames, textures) => {
  const wallImages = [];
  const wallTextures = {};
  const wallSprites = [];

  world.grid.forEach((row) => {
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
      const slice = new Rectangle(frame.x + i, frame.y, 1, frame.h);
      wallTextures[image].push(new Texture(texture, slice));
    }
  });

  for (let i = 0; i < SCREEN.WIDTH; i += 1) {
    const wallSprite = new WallSprite(wallTextures, i);
    wallSprites.push(wallSprite);
  }

  return wallSprites;
};

const createBackgroundSprites = (world, frames, textures) => {
  const backgroundImages = [];
  const backgroundTextures = {};
  const backgroundSprites = [];

  world.grid.forEach((row) => {
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
        const pixel = new Rectangle(frame.x + i, frame.y + j, 1, 1);
        row.push(new Texture(texture, pixel));
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

const createEntitySprites = (world, textures, animations) => {
  const entitySprites = {};

  world.items.forEach((item) => {
    entitySprites[item.id] = new EntitySprite(textures[item.type]);
  });

  world.obstacles.forEach((object) => {
    entitySprites[object.id] = new EntitySprite(textures[object.type]);
  });

  world.enemies.forEach((enemy) => {
    entitySprites[enemy.id] = createEnemySprite({
      animations: animations.enemies[enemy.type],
      textures,
      enemy,
    });
  });

  return entitySprites;
};

const createReviewSprites = (text) => {
  const background = new RectangleSprite({
    width: SCREEN.WIDTH,
    height: SCREEN.HEIGHT,
    color: BLACK,
    alpha: 0.8,
  });

  const title = new TextSprite({
    font: FONT_SIZES.LARGE,
    text: text.title,
    color: WHITE,
  });

  const enemies = {
    name: new TextSprite({
      font: FONT_SIZES.SMALL,
      text: text.enemies,
      color: WHITE,
    }),
    value: new TextSprite({
      font: FONT_SIZES.SMALL,
      text: '0',
      color: RED,
    }),
  };

  const items = {
    name: new TextSprite({
      font: FONT_SIZES.SMALL,
      text: text.items,
      color: WHITE,
    }),
    value: new TextSprite({
      font: FONT_SIZES.SMALL,
      text: '0',
      color: RED,
    }),
  };

  const time = {
    name: new TextSprite({
      font: FONT_SIZES.SMALL,
      text: text.time,
      color: WHITE,
    }),
    value: new TextSprite({
      font: FONT_SIZES.SMALL,
      text: '0',
      color: RED,
    }),
  };

  return {
    background,
    title,
    stats: {
      enemies,
      items,
      time,
    },
  };
};

const createPromptSprites = (text) => {
  const label = new TextSprite({
    font: FONT_SIZES.SMALL,
    text: text.continue,
    color: RED,
  });

  return {
    label,
  };
};

const createWorldSprites = (world, resources) => {
  const { textures, data } = resources;
  const { frames, animations } = data;
  const { player } = world;

  const entities = createEntitySprites(world, textures, animations);
  const weapon = createWeaponSprite(player, textures, animations.weapons);
  const walls = createWallSprites(world, frames, textures);
  const background = createBackgroundSprites(world, frames, textures);

  return {
    player: {
      weapon,
    },
    map: {
      walls,
      entities,
    },
    background,
  };
};

/**
 * Creates the sprites for the scene.
 * @param  {World}  world     The world.
 * @param  {Object} resources The resources.
 * @param  {Object} text      The text.
 * @return {Object            The sprites for the scene.
 */
export const createSprites = (world, resources, text) => ({
  world: createWorldSprites(world, resources),
  prompt: createPromptSprites(text.prompt),
  review: createReviewSprites(text.review),
});
