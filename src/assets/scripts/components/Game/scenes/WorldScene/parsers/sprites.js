import {
  Rectangle,
  Texture,
  RenderTexture,
  TextSprite,
  RectangleSprite,
  Sprite,
  Container,
  ColorMatrixFilter,
} from 'game/core/graphics';
import { BLACK, WHITE, RED } from 'game/constants/colors';
import { CELL_SIZE, SCREEN, WALL_LAYERS } from 'game/constants/config';
import { GAME_FONT } from 'game/constants/assets';
import { FONT_SIZES } from 'game/constants/fonts';
import WallSprite from '../sprites/WallSprite';
import EntitySprite from '../sprites/EntitySprite';
import AnimatedEntitySprite from '../sprites/AnimatedEntitySprite';
import BackgroundSprite from '../sprites/BackgroundSprite';
import EnemySprite from '../sprites/EnemySprite';
import WeaponSprite from '../sprites/WeaponSprite';
import HUDKeySprite from '../sprites/HUDKeySprite';
import HUDSprite from '../sprites/HUDSprite';
import ExplosionSprite from '../sprites/ExplosionSprite';
import ExplosiveEntitySprite from '../sprites/ExplosiveEntitySprite';

const createEnemySprite = ({ animations, textures, enemy }) => {
  const textureCollection = Object.keys(animations).reduce((animationMemo, state) => ({
    ...animationMemo,
    [state]: {
      ...animations[state],
      textures: animations[state].frames.map(image => textures[image]),
    },
  }), {});

  return new EnemySprite(enemy, textureCollection);
};

const createWeaponSprite = ({ animations, textures, player }) => {
  const textureCollection = player.weapons.reduce((weaponMemo, { type }) => ({
    ...weaponMemo,
    [type]: Object.keys(animations[type]).reduce((stateMemo, stateKey) => ({
      ...stateMemo,
      [stateKey]: animations[type][stateKey].frames.map(frame => textures[frame]),
    }), {}),
  }), {});

  return new WeaponSprite(textureCollection, player);
};

const createProjectileSprite = ({ animations, textures }) => {
  const projectileTextures = animations.map(animation => textures[animation]);

  return new AnimatedEntitySprite(projectileTextures);
};

const createWallSpriteMask = (wallTexture, renderer) => {
  const renderTexture = RenderTexture.create(CELL_SIZE, CELL_SIZE);
  const maskContainer = new Container();
  const filter = new ColorMatrixFilter();
  const maskForeground = new Sprite(wallTexture);

  const maskBackground = new RectangleSprite({
    width: CELL_SIZE,
    height: CELL_SIZE,
  });

  maskForeground.tint = BLACK;

  maskContainer.addChild(maskBackground);
  maskContainer.addChild(maskForeground);
  maskContainer.filters = [filter];

  filter.negative();

  renderer.render(maskContainer, renderTexture);

  return new Sprite(renderTexture);
};

const createWallSprites = ({
  world,
  frames,
  animations,
  textures,
  renderer,
}) => {
  const wallImages = [];
  const wallTextures = {};
  const wallSprites = [...Array(WALL_LAYERS)].map(() => []);

  const spatterContainer = new Container();

  const spatterTypes = world.enemies.reduce((memo, { spatterType }) => {
    if (!memo.includes(spatterType)) {
      memo.push(spatterType);
    }
    return memo;
  }, []);

  // TODO: Handle multiple spatter types.
  const spatters = animations[spatterTypes[0]];

  world.grid.forEach((row) => {
    row.forEach((cell) => {
      const {
        front,
        left,
        back,
        right,
      } = cell;

      [front, left, back, right].forEach((side) => {
        if (side && !wallImages.includes(side.type)) {
          wallImages.push(side.name);
        }
      });
    });
  });

  wallImages.forEach((image) => {
    wallTextures[image] = [];

    const { frame } = frames[image];
    const wallTexture = textures[image];

    const spatterTextures = spatters.map((spatter) => {
      const renderTexture = RenderTexture.create(CELL_SIZE, CELL_SIZE);
      const spatterTexture = textures[spatter];
      const wallSprite = new Sprite(wallTexture);
      const spatterSprite = new Sprite(spatterTexture);

      spatterSprite.mask = createWallSpriteMask(wallTexture, renderer);

      spatterContainer.removeChildren();
      spatterContainer.addChild(wallSprite);
      spatterContainer.addChild(spatterSprite);

      renderer.render(spatterContainer, renderTexture);

      return renderTexture;
    });

    for (let i = 0; i < frame.w; i += 1) {
      const spatteredSlice = new Rectangle(i, 0, 1, frame.h);
      const clearSlice = new Rectangle(frame.x + i, frame.y, 1, frame.h);

      wallTextures[image].push([
        new Texture(wallTexture, clearSlice),
        ...spatterTextures.map(texture => new Texture(texture, spatteredSlice)),
      ]);
    }
  });

  for (let i = 0; i < SCREEN.WIDTH; i += 1) {
    for (let j = 0; j < WALL_LAYERS; j += 1) {
      wallSprites[j].push(new WallSprite(wallTextures, i));
    }
  }

  return wallSprites;
};

const createBackgroundSprites = ({ world, frames, textures }) => {
  const backgroundImages = [];
  const backgroundTextures = {};
  const backgroundSprites = [];

  world.grid.forEach((row) => {
    row.forEach((cell) => {
      const { top, bottom } = cell;

      [top, bottom].forEach((side) => {
        if (side && !backgroundImages.includes(side.type)) {
          backgroundImages.push(side.name);
        }
      });
    });
  });

  backgroundImages.forEach((image) => {
    backgroundTextures[image] = [];

    const { frame } = frames[image];
    const texture = textures[image];

    for (let i = 0; i < CELL_SIZE; i += 1) {
      const row = [];
      for (let j = 0; j < CELL_SIZE; j += 1) {
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

const createExplosionSprites = ({ animations, textures, world }) => {
  const enemyProjectileSprites = world.enemies.reduce((memo, enemy) => {
    if (enemy.projectiles) {
      enemy.projectiles.forEach((projectile) => {
        const explosionTextures = animations[projectile.explosionType]
          .map(animation => textures[animation]);

        memo[projectile.id] = new ExplosionSprite(explosionTextures, {
          animationSpeed: 0.3,
        });
      });
    }

    return memo;
  }, {});

  const enemySpurtSprites = world.enemies.reduce((memo, enemy) => {
    const spurtTextures = animations[enemy.spurtType].map(animation => textures[animation]);

    memo[`${enemy.id}_${enemy.spurtType}`] = new ExplosionSprite(spurtTextures, {
      animationSpeed: 0.2,
    });

    return memo;
  }, {});

  const enemyExplodeSprites = world.enemies.reduce((memo, enemy) => {
    if (enemy.explosionType) {
      const explosionTextures = animations[enemy.explosionType]
        .map(animation => textures[animation]);

      memo[`${enemy.id}_${enemy.explosionType}`] = new ExplosionSprite(explosionTextures, {
        animationSpeed: 0.2,
      });
    }

    return memo;
  }, {});

  const obstacleExplodeSprites = world.obstacles.reduce((memo, obstacle) => {
    if (obstacle.explosionType) {
      const explosionTextures = animations[obstacle.explosionType]
        .map(animation => textures[animation]);

      memo[`${obstacle.id}_${obstacle.explosionType}`] = new ExplosionSprite(explosionTextures, {
        animationSpeed: 0.4,
      });
    }

    return memo;
  }, {});

  const playerBulletSprites = Object.keys(world.player.bullets).reduce((memo, key) => {
    world.player.bullets[key].forEach((bullet) => {
      const explosionTextures = animations[bullet.explosionType]
        .map(animation => textures[animation]);

      memo[bullet.id] = new ExplosionSprite(explosionTextures, {
        animationSpeed: 0.4,
      });
    });


    return memo;
  }, {});

  return {
    ...enemyProjectileSprites,
    ...playerBulletSprites,
    ...enemySpurtSprites,
    ...enemyExplodeSprites,
    ...obstacleExplodeSprites,
  };
};

const createEffectsSprites = ({ animations, textures, world }) => ({
  explosions: createExplosionSprites({ animations, textures, world }),
});

const createEntitySprites = ({ animations, textures, world }) => {
  const entitySprites = {};

  world.items.forEach((item) => {
    entitySprites[item.id] = new EntitySprite(textures[item.name]);
  });

  world.obstacles.forEach((object) => {
    if (object.isExplosive) {
      const animationTextures = animations[object.name].map(t => textures[t]);
      entitySprites[object.id] = new ExplosiveEntitySprite(animationTextures, object);
    } else if (object.animated) {
      const animationTextures = animations[object.name].map(t => textures[t]);
      entitySprites[object.id] = new AnimatedEntitySprite(animationTextures);
    } else {
      entitySprites[object.id] = new EntitySprite(textures[object.name]);
    }
  });

  world.enemies.forEach((enemy) => {
    entitySprites[enemy.id] = createEnemySprite({
      animations: animations[enemy.name],
      textures,
      enemy,
    });
  });

  world.enemies.reduce((memo, enemy) => ([
    ...memo,
    ...enemy.projectiles || [],
  ]), []).forEach((projectile) => {
    entitySprites[projectile.id] = createProjectileSprite({
      animations: animations[projectile.name],
      textures,
    });
  });

  return entitySprites;
};

const createReviewSprites = (text) => {
  const background = new RectangleSprite({
    width: SCREEN.WIDTH,
    height: SCREEN.HEIGHT,
    color: BLACK,
    alpha: 0,
  });

  const title = new TextSprite({
    fontName: GAME_FONT.NAME,
    fontSize: FONT_SIZES.LARGE,
    text: text.title,
    color: WHITE,
    anchor: 0.5,
  });

  const enemies = {
    name: new TextSprite({
      fontName: GAME_FONT.NAME,
      fontSize: FONT_SIZES.MEDIUM,
      text: text.enemies,
      color: WHITE,
      anchor: 0.5,
    }),
    value: new TextSprite({
      fontName: GAME_FONT.NAME,
      fontSize: FONT_SIZES.MEDIUM,
      text: '0',
      color: RED,
      anchor: 0.5,
    }),
  };

  const items = {
    name: new TextSprite({
      fontName: GAME_FONT.NAME,
      fontSize: FONT_SIZES.MEDIUM,
      text: text.items,
      color: WHITE,
      anchor: 0.5,
    }),
    value: new TextSprite({
      fontName: GAME_FONT.NAME,
      fontSize: FONT_SIZES.MEDIUM,
      text: '0',
      color: RED,
      anchor: 0.5,
    }),
  };

  const time = {
    name: new TextSprite({
      fontName: GAME_FONT.NAME,
      fontSize: FONT_SIZES.MEDIUM,
      text: text.time,
      color: WHITE,
      anchor: 0.5,
    }),
    value: new TextSprite({
      fontName: GAME_FONT.NAME,
      fontSize: FONT_SIZES.MEDIUM,
      text: '0',
      color: RED,
      anchor: 0.5,
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

const createHudSprites = ({ world, textures }) => {
  const healthAmount = new TextSprite({
    fontName: GAME_FONT.NAME,
    fontSize: FONT_SIZES.MEDIUM,
    text: `${world.player.health}`,
    color: WHITE,
    anchor: 0.5,
  });

  const ammoAmount = new TextSprite({
    fontName: GAME_FONT.NAME,
    fontSize: FONT_SIZES.MEDIUM,
    text: `${world.player.weapon.ammo}`,
    color: WHITE,
    anchor: 0.5,
  });

  const ammoIcon = new HUDSprite(textures.ammo, {
    maxScale: ammoAmount.height / textures.ammo.frame.height,
  });

  const healthIcon = new HUDSprite(textures.health, {
    maxScale: healthAmount.height / textures.health.frame.height,
  });

  const keys = world.items.reduce((memo, item) => {
    if (item.color) {
      const { baseTexture, frame } = textures[item.name];
      const keyTexture = new Texture(baseTexture, frame);

      return {
        ...memo,
        [item.color]: new HUDKeySprite(keyTexture),
      };
    }

    return memo;
  }, {});

  const messages = [...Array(5)].map(() => new TextSprite({
    fontName: GAME_FONT.NAME,
    fontSize: FONT_SIZES.SMALL,
    text: '',
    color: RED,
    anchor: 0.5,
  }));

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
    messages,
  };
};

const createWorldSprites = ({ world, graphics, renderer }) => {
  const { textures, data } = graphics;
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
    animations,
    frames,
    textures,
    world,
    renderer,
  });

  const background = createBackgroundSprites({
    frames,
    textures,
    world,
  });

  const hud = createHudSprites({ world, textures });

  const effects = createEffectsSprites({ animations, textures, world });

  return {
    player: {
      weapon,
      hud,
    },
    map: {
      walls,
      entities,
      effects,
    },
    background,
  };
};

/**
 * Creates the sprites for the scene.
 * @param  {World}  options.world     The world.
 * @param  {Object} options.graphics  The graphics.
 * @param  {Object} options.text      The text.
 * @param  {Object} options.renderer  The text.
 * @return {Object}                   The sprites for the scene.
 */
export const createSprites = ({
  world,
  graphics,
  text,
  renderer,
}) => ({
  world: createWorldSprites({ world, graphics, renderer }),
  review: createReviewSprites(text.review),
});
