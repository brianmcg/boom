import {
  Rectangle,
  Texture,
  TextSprite,
  RectangleSprite,
  Sprite,
} from 'game/core/graphics';
import { BLACK, WHITE, RED } from 'game/constants/colors';
import { TILE_SIZE, SCREEN } from 'game/constants/config';
import { FONT_SIZES } from 'game/constants/fonts';
import WallSprite from '../sprites/WallSprite';
import EntitySprite from '../sprites/EntitySprite';
import AnimatedEntitySprite from '../sprites/AnimatedEntitySprite';
import BackgroundSprite from '../sprites/BackgroundSprite';
import EnemySprite from '../sprites/EnemySprite';
import WeaponSprite from '../sprites/WeaponSprite';
import HudKeySprite from '../sprites/HudKeySprite';

const createEnemySprite = ({ animations, textures, enemy }) => {
  const textureCollection = Object.keys(animations).reduce((animationMemo, state) => ({
    ...animationMemo,
    [state]: Object.keys(animations[state]).reduce((stateMemo, angle) => ({
      ...stateMemo,
      [angle]: animations[state][angle].map(image => textures[image]),
    }), {}),
  }), {});

  return new EnemySprite(enemy, textureCollection);
};

const createWeaponSprite = ({ animations, textures, player }) => {
  const textureCollection = Object.keys(player.weapons).reduce((memo, key) => ({
    ...memo,
    [key]: animations[key].map(image => textures[image]),
  }), {});

  return new WeaponSprite(textureCollection, player);
};

const createWallSprites = ({ world, frames, textures }) => {
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

const createBackgroundSprites = ({ world, frames, textures }) => {
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
      row.push(new BackgroundSprite(backgroundTextures, i, j));
    }
    backgroundSprites.push(row);
  }

  return backgroundSprites;
};

const createEntitySprites = ({ animations, textures, world }) => {
  const entitySprites = {};

  world.items.forEach((item) => {
    entitySprites[item.id] = new EntitySprite(textures[item.texture]);
  });

  world.obstacles.forEach((object) => {
    if (object.animated) {
      const animationTextures = animations[object.texture].map(t => textures[t]);
      entitySprites[object.id] = new AnimatedEntitySprite(animationTextures);
    } else {
      entitySprites[object.id] = new EntitySprite(textures[object.texture]);
    }
  });

  world.enemies.forEach((enemy) => {
    entitySprites[enemy.id] = createEnemySprite({
      animations: animations[enemy.name.toLowerCase()],
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
    alpha: 0.75,
  });

  const title = new TextSprite({
    font: FONT_SIZES.LARGE,
    text: text.title,
    color: WHITE,
  });

  const enemies = {
    name: new TextSprite({
      font: FONT_SIZES.MEDIUM,
      text: text.enemies,
      color: WHITE,
    }),
    value: new TextSprite({
      font: FONT_SIZES.MEDIUM,
      text: '0',
      color: RED,
    }),
  };

  const items = {
    name: new TextSprite({
      font: FONT_SIZES.MEDIUM,
      text: text.items,
      color: WHITE,
    }),
    value: new TextSprite({
      font: FONT_SIZES.MEDIUM,
      text: '0',
      color: RED,
    }),
  };

  const time = {
    name: new TextSprite({
      font: FONT_SIZES.MEDIUM,
      text: text.time,
      color: WHITE,
    }),
    value: new TextSprite({
      font: FONT_SIZES.MEDIUM,
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

const createHudSprites = (world, textures) => {
  const healthIcon = new Sprite(textures.health);

  const healthAmount = new TextSprite({
    font: FONT_SIZES.MEDIUM,
    text: '100',
    color: WHITE,
  });

  const ammoIcon = new Sprite(textures.ammo);

  const ammoAmount = new TextSprite({
    font: FONT_SIZES.MEDIUM,
    text: '100',
    color: WHITE,
  });

  const keys = world.items.reduce((memo, item) => {
    if (item.color) {
      return {
        ...memo,
        [item.color]: new HudKeySprite(textures[item.texture], {
          key: item,
        }),
      };
    }

    return memo;
  }, {});

  const message = new TextSprite({
    font: FONT_SIZES.SMALL,
    text: '',
    color: RED,
  });

  const foreground = new RectangleSprite({
    width: SCREEN.WIDTH,
    height: SCREEN.HEIGHT,
    color: RED,
    alpha: 0,
  });

  return {
    foreground,
    healthIcon,
    healthAmount,
    ammoIcon,
    ammoAmount,
    keys,
    message,
  };
};

const createWorldSprites = (world, resources) => {
  const { textures, data } = resources;
  const { frames, animations } = data;
  const { player } = world;

  const entities = createEntitySprites({
    animations,
    textures,
    world,
  });

  const weapon = createWeaponSprite({
    animations,
    textures,
    player,
  });

  const walls = createWallSprites({
    frames,
    textures,
    world,
  });

  const background = createBackgroundSprites({
    frames,
    textures,
    world,
  });

  const hud = createHudSprites(world, textures);

  return {
    player: {
      weapon,
      hud,
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
  review: createReviewSprites(text.review),
});
