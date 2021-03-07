import {
  Rectangle,
  Texture,
  RenderTexture,
  TextSprite,
  RectangleSprite,
  Sprite,
  Container,
  ColorMatrixFilter,
  BLEND_MODES,
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
import EffectSprite from '../sprites/EffectSprite';
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
  const textureCollection = player.weapons.reduce((weaponMemo, { name }) => ({
    ...weaponMemo,
    [name]: Object.keys(animations[name]).reduce((stateMemo, stateKey) => ({
      ...stateMemo,
      [stateKey]: animations[name][stateKey].frames.map(frame => textures[frame]),
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

  const sprite = new Sprite(renderTexture);

  sprite.blendMode = BLEND_MODES.MULTIPLY;

  return sprite;
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

  const spatterTypes = world.enemies.reduce((memo, { effects }) => {
    if (effects.spatter && !memo.includes(effects.spatter)) {
      memo.push(effects.spatter);
    }
    return memo;
  }, []);

  const spatters = spatterTypes.reduce((memo, spatterType) => {
    animations[spatterType].forEach((spatter) => {
      memo.push(spatter);
    });
    return memo;
  }, []);

  world.grid.forEach((row) => {
    row.forEach((cell) => {
      const {
        front,
        left,
        back,
        right,
        transparency,
      } = cell;

      [front, left, back, right].forEach((side) => {
        if (side && !wallImages.some(w => w.name === side.name)) {
          wallImages.push({ name: side.name, transparent: !!transparency });
        }
      });
    });
  });

  wallImages.forEach(({ name, transparent }) => {
    wallTextures[name] = [];

    const { frame } = frames[name];
    const wallTexture = textures[name];

    for (let i = 0; i < frame.w; i += 1) {
      const clearSlice = new Rectangle(frame.x + i, frame.y, 1, frame.h);
      wallTextures[name].push([new Texture(wallTexture, clearSlice)]);
    }

    const spatterTextures = spatters.map((spatter) => {
      const renderTexture = RenderTexture.create(CELL_SIZE, CELL_SIZE);
      const spatterTexture = textures[spatter];
      const wallSprite = new Sprite(wallTexture);
      const spatterSprite = new Sprite(spatterTexture);

      spatterSprite.x = CELL_SIZE / 2;
      spatterSprite.y = CELL_SIZE / 2;
      spatterSprite.anchor.set(0.5);
      spatterSprite.rotation = Math.floor((Math.random() * 4)) * Math.PI / 2;

      if (transparent) {
        spatterSprite.mask = createWallSpriteMask(wallTexture, renderer);
      }

      spatterContainer.removeChildren();
      spatterContainer.addChild(wallSprite);
      spatterContainer.addChild(spatterSprite);

      renderer.render(spatterContainer, renderTexture);

      return renderTexture;
    });

    for (let i = 0; i < frame.w; i += 1) {
      const spatteredSlice = new Rectangle(i, 0, 1, frame.h);

      spatterTextures.forEach((texture) => {
        wallTextures[name][i].push(new Texture(texture, spatteredSlice));
      });
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

const createEffectsSprites = ({
  animations,
  textures,
  world,
}) => {
  const enemyProjectileExplosionSprites = world.enemies.reduce((memo, enemy) => {
    if (enemy.projectiles) {
      enemy.projectiles.forEach((projectile) => {
        if (projectile.effects?.impact) {
          const effectTextures = animations[projectile.effects.impact]
            .map(animation => textures[animation]);

          memo[projectile.id] = new EffectSprite(effectTextures, {
            animationSpeed: 0.3,
          });
        }

        const explode = projectile.explosion?.effects.explode;

        if (explode) {
          const effectTextures = animations[explode].map(animation => textures[animation]);

          memo[`${projectile.explosion.id}_${explode}`] = new EffectSprite(effectTextures, {
            animationSpeed: 0.2,
          });
        }
      });
    }

    return memo;
  }, {});

  const playerExplosionSprites = world.player.weapons.reduce((memo, weapon) => {
    if (weapon.projectiles) {
      weapon.projectiles.forEach((projectile) => {
        if (projectile.effects?.impact) {
          const effectTextures = animations[projectile.effects.impact]
            .map(animation => textures[animation]);

          memo[projectile.id] = new EffectSprite(effectTextures, {
            animationSpeed: 0.2,
          });
        }

        const explode = projectile.explosion?.effects.explode;

        if (explode) {
          const effectTextures = animations[explode].map(animation => textures[animation]);

          memo[`${projectile.explosion.id}_${explode}`] = new EffectSprite(effectTextures, {
            animationSpeed: 0.2,
          });
        }
      });
    }

    return memo;
  }, {});

  const enemySpurtSprites = world.enemies.reduce((memo, { id, effects }) => {
    if (effects.spurt) {
      const spurtTextures = animations[effects.spurt].map(animation => textures[animation]);

      const explosionSprite = new EffectSprite(spurtTextures, {
        animationSpeed: 0.2,
      });

      memo[`${id}_${effects.spurt}`] = explosionSprite;

      return memo;
    }

    return memo;
  }, {});

  const enemyExplosionSprites = world.enemies.reduce((memo, enemy) => {
    const { explode } = enemy.effects;

    if (explode) {
      const effectTextures = animations[explode].map(animation => textures[animation]);

      memo[`${enemy.id}_${explode}`] = new EffectSprite(effectTextures, {
        animationSpeed: 0.2,
      });
    }

    return memo;
  }, {});

  const objectExplosionSprites = world.objects.reduce((memo, object) => {
    const explode = object.explosion?.effects.explode;

    if (explode) {
      const effectTextures = animations[explode].map(animation => textures[animation]);

      memo[`${object.explosion.id}_${explode}`] = new EffectSprite(effectTextures, {
        animationSpeed: 0.4,
      });
    }

    return memo;
  }, {});

  const playerHitScanSprites = {};

  world.player.weapons.forEach((weapon) => {
    if (weapon.projectiles) {
      weapon.projectiles.forEach(({ id, effect }) => {
        if (effect) {
          const effectTextures = animations[effect].map(animation => textures[animation]);

          playerHitScanSprites[id] = new EffectSprite(effectTextures, {
            animationSpeed: 0.4,
          });
        }
      });
    }
  });

  const playerSpurtSprites = {};

  const { id, effects } = world.player;

  if (effects.spurt) {
    const playerSpurtTextures = animations[effects.spurt].map(animation => textures[animation]);
    playerSpurtSprites[`${id}_${effects.spurt}`] = new EffectSprite(playerSpurtTextures, {
      animationSpeed: 0.2,
    });
  }

  return {
    ...playerExplosionSprites,
    ...enemyProjectileExplosionSprites,
    ...playerHitScanSprites,
    ...enemySpurtSprites,
    ...enemyExplosionSprites,
    ...objectExplosionSprites,
    ...playerSpurtSprites,
  };
};

const createEntitySprites = ({ animations, textures, world }) => {
  const entitySprites = {};

  world.items.forEach((item) => {
    entitySprites[item.id] = new EntitySprite(textures[item.name]);
  });

  world.objects.forEach((object) => {
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
    if (projectile.name) {
      entitySprites[projectile.id] = createProjectileSprite({
        animations: animations[projectile.name],
        textures,
      });
    }
  });

  world.player.weapons.reduce((memo, weapon) => ([
    ...memo,
    ...weapon.projectiles || [],
  ]), []).forEach((projectile) => {
    if (projectile.name) {
      entitySprites[projectile.id] = createProjectileSprite({
        animations: animations[projectile.name],
        textures,
      });
    }
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
    text: `${world.player.weapon.ammo !== null ? world.player.weapon.ammo : '-'}`,
    color: WHITE,
    anchor: 0.5,
  });

  const ammoIcon = new HUDSprite(textures.ammo, {
    maxScale: healthAmount.height / textures.ammo.frame.height,
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

  const effects = createEffectsSprites({
    animations,
    textures,
    world,
  });

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
