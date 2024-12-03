import {
  ORANGE,
  BLUE,
  PURPLE,
  GREEN,
  PINK,
  GREY,
  BLACK,
  WHITE,
  RED,
} from '@constants/colors';

import {
  ColorMatrixFilter,
  Container,
  GraphicsCreator,
  Line,
  Rectangle,
  Sprite,
  TextSprite,
} from '@game/core/graphics';

import { CELL_SIZE, SCREEN, WALL_LAYERS } from '@constants/config';
import { GAME_FONT } from '@constants/assets';
import { FONT_SIZES } from '@constants/fonts';
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
import ProjectileSprite from '../sprites/ProjectileSprite';

const SPURT_SPEED = 0.4;

const TAIL_SPEED = 0.05;

const EXPLOSION_SPEED = 0.25;

const SPLASH_SPEED = 0.4;

const IMPACT_SPEED = 0.4;

const tailSpeed = () => TAIL_SPEED * Math.random() * (1 - 0.05) + 0.05;

const createEnemySprite = ({ animations, textures, enemy, floorOffset }) => {
  const textureCollection = Object.keys(animations).reduce(
    (animationMemo, state) => ({
      ...animationMemo,
      [state]: {
        ...animations[state],
        textures: animations[state].frames.map(image => textures[image]),
      },
    }),
    {}
  );

  return new EnemySprite(textureCollection, { enemy, floorOffset });
};

const createWeaponSprite = ({ animations, textures, player }) => {
  const textureCollection = player.weapons.reduce(
    (weaponMemo, { name }) => ({
      ...weaponMemo,
      [name]: Object.keys(animations[name]).reduce(
        (stateMemo, stateKey) => ({
          ...stateMemo,
          [stateKey]: animations[name][stateKey].frames.map(
            frame => textures[frame]
          ),
        }),
        {}
      ),
    }),
    {}
  );

  return new WeaponSprite(textureCollection, player);
};

const createProjectileSprite = ({ animations, textures, rotate }) => {
  const projectileTextures = animations.map(animation => textures[animation]);

  return new ProjectileSprite(projectileTextures, { rotate });
};

const createWallSpriteMask = ({
  wallTexture,
  floorHeight,
  wallHeight,
  renderer,
}) => {
  const renderTexture = GraphicsCreator.createRenderTexture({
    width: CELL_SIZE,
    height: wallHeight,
  });

  const maskContainer = new Container();
  const filter = new ColorMatrixFilter();
  const maskForeground = new Sprite(wallTexture);

  const maskBackground = GraphicsCreator.createRectangleSprite({
    width: CELL_SIZE,
    height: wallHeight,
  });

  const floorOffset = GraphicsCreator.createRectangleSprite({
    width: CELL_SIZE,
    height: floorHeight,
  });

  floorOffset.y = wallHeight - floorHeight;

  maskForeground.tint = BLACK;
  maskContainer.addChild(maskBackground);
  maskContainer.addChild(maskForeground);
  maskContainer.addChild(floorOffset);
  maskContainer.filters = [filter];

  filter.negative();

  renderer.render({
    container: maskContainer,
    target: renderTexture,
  });

  const sprite = new Sprite(renderTexture);

  sprite.blendMode = 'overlay';

  return sprite;
};

const createWallSprites = ({
  world,
  frames,
  animations,
  textures,
  renderer,
  bloodColors,
}) => {
  const wallImages = [];
  const wallTextures = {};
  const wallSprites = [...Array(WALL_LAYERS)].map(() => []);
  const spatterContainer = new Container();
  const floorHeight = world.floorOffset ? CELL_SIZE * world.floorOffset - 1 : 0;

  const spatterTypes = [...world.enemies, world.player].reduce(
    (memo, { effects }) => {
      if (effects.spatter && !memo.includes(effects.spatter)) {
        memo.push(effects.spatter);
      }
      return memo;
    },
    []
  );

  const spatters = spatterTypes.reduce((memo, spatterType) => {
    animations[spatterType].forEach(spatter => {
      memo.push(spatter);
    });
    return memo;
  }, []);

  world.grid.forEach(col => {
    col.forEach(cell => {
      const { front, left, back, right, transparency, overlay } = cell;

      [front, left, back, right].forEach(side => {
        if (side && side.name && !wallImages.some(w => w.name === side.name)) {
          wallImages.push({
            name: side.name,
            transparent: !!transparency,
            rotate: !overlay,
            height: cell.height,
          });
        }
      });

      if (
        overlay &&
        overlay.name &&
        !wallImages.some(w => w.name === overlay.name)
      ) {
        wallImages.push({
          name: overlay.name,
          transparent: true,
          rotate: false,
          height: cell.height,
        });
      }
    });
  });

  wallImages.forEach(({ name, transparent, rotate, height }) => {
    wallTextures[name] = [];

    const { frame } = frames[name];
    const wallTexture = textures[name];

    for (let i = 0; i < frame.w; i++) {
      const clearSlice = new Rectangle(frame.x + i, frame.y, 1, frame.h);
      wallTextures[name].push([
        GraphicsCreator.createTexture(wallTexture, clearSlice),
      ]);
    }

    const spatterTextures = bloodColors.reduce((memo, bloodColor) => {
      const spatterColorTextures = spatters.map(spatter => {
        const wallHeight = wallTexture.height;

        const renderTexture = GraphicsCreator.createRenderTexture({
          width: CELL_SIZE,
          height: wallHeight,
        });

        const spatterTexture = textures[spatter];
        const wallSprite = new Sprite(wallTexture);
        const spatterSprite = new Sprite(spatterTexture, {
          tint: parseInt(bloodColor, 16),
        });

        wallSprite.y = wallTexture.frame.height - wallHeight + floorHeight;
        spatterSprite.x = CELL_SIZE / 2;
        spatterSprite.y = height - spatterSprite.height / 2;

        spatterSprite.anchor.set(0.5);
        spatterSprite.rotation = rotate
          ? (Math.floor(Math.random() * 4) * Math.PI) / 2
          : 0;

        if (world.floorOffset) {
          spatterSprite.mask = createWallSpriteMask({
            wallTexture,
            floorHeight: CELL_SIZE * world.floorOffset + 1,
            wallHeight,
            renderer,
          });
        }

        spatterContainer.removeChildren();
        spatterContainer.addChild(wallSprite);

        // TODO: Don't create spatter sprites for transparent walls.
        if (!transparent) {
          spatterContainer.addChild(spatterSprite);
        }

        renderer.render({
          container: spatterContainer,
          target: renderTexture,
        });

        return renderTexture;
      });

      return [...memo, ...spatterColorTextures];
    }, []);

    for (let i = 0; i < frame.w; i++) {
      const spatteredSlice = new Rectangle(i, 0, 1, frame.h);

      spatterTextures.forEach(texture => {
        wallTextures[name][i].push(
          GraphicsCreator.createTexture(texture, spatteredSlice)
        );
      });
    }
  });

  for (let i = 0; i < SCREEN.WIDTH; i++) {
    for (let j = 0; j < WALL_LAYERS; j++) {
      wallSprites[j].push(new WallSprite(wallTextures, i));
    }
  }

  return wallSprites;
};

const createSkySprites = ({ world, textures }) => {
  const numberOfSprites = 2;

  if (world.sky) {
    const texture = textures[world.sky];
    const ratio = SCREEN.HEIGHT / texture.height;
    const height = texture.height * ratio;
    const width = texture.width * ratio;

    return [...Array(numberOfSprites).keys()].map(
      () =>
        new Sprite(texture, {
          width,
          height,
        })
    );
  }

  return [];
};

const createBackgroundSprites = ({ world, frames, textures, bloodColors }) => {
  const backgroundImages = [];
  const backgroundTextures = {};
  const sprites = [];

  world.grid.forEach(col => {
    col.forEach(cell => {
      const { top, bottom } = cell;

      if (top && !backgroundImages.includes(top.name)) {
        backgroundImages.push(top.name);
      }

      if (bottom && !backgroundImages.includes(bottom.name)) {
        backgroundImages.push(bottom.name);

        bloodColors.forEach(bloodColor => {
          const colorName = `${bloodColor}_${bottom.name}`;

          if (!backgroundImages.includes(colorName)) {
            backgroundImages.push(colorName);
          }
        });
      }
    });
  });

  backgroundImages.forEach(image => {
    const texture = textures[image];

    if (texture) {
      const { frame } = frames[image];
      backgroundTextures[image] = [];

      for (let i = 0; i < CELL_SIZE; i++) {
        const col = [];
        for (let j = 0; j < CELL_SIZE; j++) {
          const pixel = new Rectangle(frame.x + i, frame.y + j, 1, 1);
          col.push(GraphicsCreator.createTexture(texture, pixel));
        }
        backgroundTextures[image].push(col);
      }
    }
  });

  for (let i = 0; i < SCREEN.WIDTH; i++) {
    const col = [];
    for (let j = 0; j < SCREEN.HEIGHT; j++) {
      col.push(new BackgroundSprite(backgroundTextures, i, j));
    }

    sprites.push(col);
  }

  return sprites;
};

const createEffectsSprites = ({ animations, textures, world, renderer }) => {
  const spurtContainer = new Container();

  const enemyProjectileExplosionSprites = world.enemies.reduce(
    (memo, enemy) => {
      if (enemy.projectiles) {
        enemy.projectiles.forEach(projectile => {
          if (projectile.effects?.impact) {
            const effectTextures = animations[projectile.effects.impact].map(
              animation => textures[animation]
            );

            memo[projectile.id] = new EffectSprite(effectTextures, {
              animationSpeed: EXPLOSION_SPEED,
            });
          }

          const explode = projectile.explosion?.effects.explode;

          if (explode) {
            const effectTextures = animations[explode].map(
              animation => textures[animation]
            );

            memo[`${projectile.explosion.id}_${explode}`] = new EffectSprite(
              effectTextures,
              {
                animationSpeed: EXPLOSION_SPEED,
              }
            );
          }

          if (projectile.tail) {
            const effectTextures = animations[projectile.tail.name].map(
              animation => textures[animation]
            );

            projectile.tail.ids.forEach(id => {
              memo[id] = new EffectSprite(effectTextures, {
                animationSpeed: tailSpeed(),
              });
            });
          }
        });
      }

      return memo;
    },
    {}
  );

  const playerExplosionSprites = world.player.weapons.reduce((memo, weapon) => {
    if (weapon.projectiles) {
      weapon.projectiles.forEach(projectile => {
        const explode = projectile.explosion?.effects.explode;

        if (explode) {
          const effectTextures = animations[explode].map(
            animation => textures[animation]
          );

          memo[`${projectile.explosion.id}_${explode}`] = new EffectSprite(
            effectTextures,
            {
              animationSpeed: EXPLOSION_SPEED,
            }
          );
        }

        if (projectile.tail) {
          const effectTextures = animations[projectile.tail.name].map(
            animation => textures[animation]
          );

          projectile.tail.ids.forEach(id => {
            memo[id] = new EffectSprite(effectTextures, {
              animationSpeed: tailSpeed(),
            });
          });
        }
      });
    }

    return memo;
  }, {});

  const enemySpurtSprites = world.enemies.reduce((memo, enemy) => {
    const { id, effects, bloodColor } = enemy;

    if (effects.spurt) {
      const spurtTextures = animations[effects.spurt].map(animation => {
        const spurtSprite = new Sprite(textures[animation], {
          tint: parseInt(bloodColor, 16),
        });

        const renderTexture = GraphicsCreator.createRenderTexture({
          width: spurtSprite.width,
          height: spurtSprite.height,
        });

        spurtContainer.removeChildren();
        spurtContainer.addChild(spurtSprite);

        renderer.render({
          container: spurtContainer,
          target: renderTexture,
        });

        return renderTexture;
      });

      const explosionSprite = new EffectSprite(spurtTextures, {
        animationSpeed: SPURT_SPEED,
        rotate: false,
      });

      memo[`${id}_${effects.spurt}`] = explosionSprite;

      return memo;
    }

    return memo;
  }, {});

  const enemySplashSprites = world.enemies.reduce((memo, enemy) => {
    if (enemy.splash) {
      const splashTextures = animations[enemy.splash].map(
        animation => textures[animation]
      );

      memo[`${enemy.id}_${enemy.splash}`] = new EffectSprite(splashTextures, {
        rotate: false,
        animationSpeed: SPLASH_SPEED,
      });
    }

    if (enemy.ripple) {
      const rippleTextures = animations[enemy.ripple].map(
        animation => textures[animation]
      );

      memo[`${enemy.id}_${enemy.ripple}`] = new EffectSprite(rippleTextures, {
        rotate: false,
        animationSpeed: SPLASH_SPEED,
      });
    }

    return memo;
  }, {});

  const enemyExplosionSprites = world.enemies.reduce((memo, enemy) => {
    if (enemy.explosion) {
      const explode = enemy.explosion?.effects.explode;

      if (explode) {
        const effectTextures = animations[explode].map(
          animation => textures[animation]
        );

        memo[`${enemy.explosion.id}_${explode}`] = new EffectSprite(
          effectTextures,
          {
            animationSpeed: EXPLOSION_SPEED,
            rotate: false,
          }
        );
      }

      if (enemy.tail) {
        const effectTextures = animations[enemy.tail.name].map(
          animation => textures[animation]
        );

        enemy.tail.ids.forEach(id => {
          memo[id] = new EffectSprite(effectTextures, {
            animationSpeed: tailSpeed(),
          });
        });
      }
    }

    return memo;
  }, {});

  const objectExplosionSprites = world.objects.reduce((memo, object) => {
    const explode = object.explosion?.effects.explode;

    if (explode) {
      const effectTextures = animations[explode].map(
        animation => textures[animation]
      );

      memo[`${object.explosion.id}_${explode}`] = new EffectSprite(
        effectTextures,
        {
          animationSpeed: EXPLOSION_SPEED,
          rotate: false,
        }
      );
    }

    return memo;
  }, {});

  const playerHitScanSprites = {};

  world.player.weapons.forEach(weapon => {
    if (weapon.projectiles) {
      weapon.projectiles.forEach(({ id, effect }) => {
        if (effect) {
          const effectTextures = animations[effect].map(
            animation => textures[animation]
          );

          playerHitScanSprites[id] = new EffectSprite(effectTextures, {
            animationSpeed: IMPACT_SPEED,
          });
        }
      });
    }
  });

  const playerSpurtSprites = {};

  const { id, effects, bloodColor } = world.player;

  if (effects.spurt) {
    const playerSpurtTextures = animations[effects.spurt].map(animation => {
      const spurtSprite = new Sprite(textures[animation], {
        tint: parseInt(bloodColor, 16),
      });

      const renderTexture = GraphicsCreator.createRenderTexture({
        width: spurtSprite.width,
        height: spurtSprite.height,
      });

      spurtContainer.removeChildren();
      spurtContainer.addChild(spurtSprite);

      renderer.render({
        container: spurtContainer,
        target: renderTexture,
      });

      return renderTexture;
    });

    playerSpurtSprites[`${id}_${effects.spurt}`] = new EffectSprite(
      playerSpurtTextures,
      {
        animationSpeed: SPURT_SPEED,
        rotate: false,
      }
    );
  }

  return {
    ...playerExplosionSprites,
    ...enemyProjectileExplosionSprites,
    ...playerHitScanSprites,
    ...enemySpurtSprites,
    ...enemyExplosionSprites,
    ...objectExplosionSprites,
    ...playerSpurtSprites,
    ...enemySplashSprites,
  };
};

const createEntitySprites = ({ animations, textures, world }) => {
  const entitySprites = {};

  world.items.forEach(item => {
    const animationTextures = animations[item.name].map(t => textures[t]);
    entitySprites[item.id] = new AnimatedEntitySprite(animationTextures, {
      floorOffset: world.floorOffset,
    });
  });

  world.objects.forEach(object => {
    if (object.explosion) {
      const animationTextures = animations[object.name].map(t => textures[t]);
      entitySprites[object.id] = new ExplosiveEntitySprite(animationTextures, {
        entity: object,
      });
    } else if (object.animated) {
      const animationTextures = animations[object.name].map(t => textures[t]);
      entitySprites[object.id] = new AnimatedEntitySprite(animationTextures, {
        animationSpeed: object.animationSpeed,
      });
    } else {
      entitySprites[object.id] = new EntitySprite(textures[object.name]);
    }
  });

  world.enemies.forEach(enemy => {
    const { spawnItem } = enemy;

    if (spawnItem) {
      const animationTextures = animations[spawnItem.name].map(
        t => textures[t]
      );

      entitySprites[spawnItem.id] = new AnimatedEntitySprite(
        animationTextures,
        {
          floorOffset: world.floorOffset,
        }
      );
    }

    entitySprites[enemy.id] = createEnemySprite({
      animations: animations[enemy.name],
      textures,
      enemy,
      floorOffset: enemy.submerged ? 0 : world.floorOffset,
    });
  });

  world.enemies
    .reduce((memo, enemy) => [...memo, ...(enemy.projectiles || [])], [])
    .forEach(projectile => {
      if (projectile.name) {
        entitySprites[projectile.id] = createProjectileSprite({
          animations: animations[projectile.name],
          textures,
        });
      }
    });

  world.player.weapons
    .reduce((memo, weapon) => [...memo, ...(weapon.projectiles || [])], [])
    .forEach(projectile => {
      if (projectile.name) {
        entitySprites[projectile.id] = createProjectileSprite({
          animations: animations[projectile.name],
          textures,
          rotate: projectile.rotate,
        });
      }
    });

  return entitySprites;
};

const createReviewSprites = text => {
  const background = GraphicsCreator.createRectangleSprite({
    x: -SCREEN.WIDTH / 2,
    y: -SCREEN.HEIGHT / 2,
    width: SCREEN.WIDTH * 2,
    height: SCREEN.HEIGHT * 2,
    color: BLACK,
    alpha: 0,
  });

  const title = new TextSprite({
    fontFamily: GAME_FONT.NAME,
    fontSize: FONT_SIZES.LARGE,
    text: text.title,
    color: WHITE,
    anchor: 0.5,
  });

  const enemies = {
    name: new TextSprite({
      fontFamily: GAME_FONT.NAME,
      fontSize: FONT_SIZES.MEDIUM,
      text: text.enemies,
      color: WHITE,
      anchor: 0.5,
    }),
    value: new TextSprite({
      fontFamily: GAME_FONT.NAME,
      fontSize: FONT_SIZES.MEDIUM,
      text: '0',
      color: RED,
      anchor: 0.5,
    }),
  };

  const items = {
    name: new TextSprite({
      fontFamily: GAME_FONT.NAME,
      fontSize: FONT_SIZES.MEDIUM,
      text: text.items,
      color: WHITE,
      anchor: 0.5,
    }),
    value: new TextSprite({
      fontFamily: GAME_FONT.NAME,
      fontSize: FONT_SIZES.MEDIUM,
      text: '0',
      color: RED,
      anchor: 0.5,
    }),
  };

  const secrets = {
    name: new TextSprite({
      fontFamily: GAME_FONT.NAME,
      fontSize: FONT_SIZES.MEDIUM,
      text: text.secrets,
      color: WHITE,
      anchor: 0.5,
    }),
    value: new TextSprite({
      fontFamily: GAME_FONT.NAME,
      fontSize: FONT_SIZES.MEDIUM,
      text: '0',
      color: RED,
      anchor: 0.5,
    }),
  };

  const time = {
    name: new TextSprite({
      fontFamily: GAME_FONT.NAME,
      fontSize: FONT_SIZES.MEDIUM,
      text: text.time,
      color: WHITE,
      anchor: 0.5,
    }),
    value: new TextSprite({
      fontFamily: GAME_FONT.NAME,
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
      secrets,
      time,
    },
  };
};

const createHudSprites = ({ world, textures, animations }) => {
  const healthAmount = new TextSprite({
    fontFamily: GAME_FONT.NAME,
    fontSize: FONT_SIZES.MEDIUM,
    color: WHITE,
    anchor: 0.5,
  });

  const ammoAmount = new TextSprite({
    fontFamily: GAME_FONT.NAME,
    fontSize: FONT_SIZES.MEDIUM,
    color: WHITE,
    anchor: 0.5,
  });

  const ammoIcon = new HUDSprite(textures.ammo, {
    maxScale: healthAmount.height / textures.ammo.frame.height,
    anchor: 0.5,
  });

  const healthIcon = new HUDSprite(textures.health, {
    maxScale: healthAmount.height / textures.health.frame.height,
    anchor: 0.5,
  });

  const items = world.enemies.reduce(
    (memo, { spawnItem }) => {
      if (spawnItem) {
        memo.push(spawnItem);
      }

      return memo;
    },
    [...world.items]
  );

  const keys = items.reduce((memo, item) => {
    if (item.color) {
      const [name] = animations[item.name];
      const { source, frame } = textures[name];
      const keyTexture = GraphicsCreator.createTexture(source, frame);

      return {
        ...memo,
        [item.color]: new HUDKeySprite(keyTexture),
      };
    }

    return memo;
  }, {});

  const foreground = GraphicsCreator.createRectangleSprite({
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
  const { player, enemies } = world;

  const bloodColors = [player, ...enemies].reduce((memo, { bloodColor }) => {
    if (bloodColor && !memo.includes(bloodColor)) {
      return [...memo, bloodColor];
    }

    return memo;
  }, []);

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
    bloodColors,
  });

  const background = createBackgroundSprites({
    frames,
    textures,
    world,
    bloodColors,
  });

  const sky = createSkySprites({ world, textures });

  const hud = createHudSprites({ world, textures, animations });

  const effects = createEffectsSprites({
    animations,
    textures,
    world,
    renderer,
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
    sky,
    background,
  };
};

const createWorldGraphics = ({ world }) => {
  const color = body => {
    if (body.isPlayer) {
      return GREEN;
    }

    if (body.isDoor) {
      return WHITE;
    }

    if (body.isItem) {
      return BLUE;
    }

    if (body.isEnemy) {
      return PINK;
    }

    if (body.isDestroyable) {
      return PURPLE;
    }

    return GREY;
  };

  const alpha = body => {
    if (body.transparency) {
      return 1 - 0.5 / body.transparency;
    }

    return 1;
  };

  const lines = [...Array(SCREEN.WIDTH).keys()].map(
    () =>
      new Line({
        color: 0xe6db74,
        alpha: 0.25,
      })
  );

  const grid = world.grid.reduce(
    (colMemo, col) => ({
      ...colMemo,
      ...col.reduce((sectorMemo, sector) => {
        if (sector.blocking && !sector.edge) {
          return {
            ...sectorMemo,
            [sector.id]: GraphicsCreator.createRectangleSprite({
              color: color(sector),
              alpha: alpha(sector),
              width: sector.shape.width,
              height: sector.shape.length,
              anchor: 0.5,
            }),
          };
        }

        return sectorMemo;
      }, {}),
    }),
    {}
  );

  const enemies = world.enemies.reduce(
    (memo, body) => ({
      ...memo,
      [body.id]: {
        rectangle: GraphicsCreator.createRectangleSprite({
          color: color(body),
          width: body.width,
          height: body.length,
          anchor: 0.5,
        }),
        line: new Line({ color: WHITE }),
      },
    }),
    {}
  );

  const objects = world.objects.reduce((memo, body) => {
    if (body.blocking) {
      return {
        ...memo,
        [body.id]: GraphicsCreator.createRectangleSprite({
          color: color(body),
          width: body.width,
          height: body.length,
          anchor: 0.5,
        }),
      };
    }

    return memo;
  }, {});

  const items = world.items.reduce(
    (memo, body) => ({
      ...memo,
      [body.id]: GraphicsCreator.createRectangleSprite({
        color: color(body),
        width: body.width,
        height: body.length,
        anchor: 0.5,
      }),
    }),
    {}
  );

  const player = {
    rectangle: GraphicsCreator.createRectangleSprite({
      color: color(world.player),
      width: world.player.shape.width,
      height: world.player.shape.length,
      anchor: 0.5,
    }),
    line: new Line({ color: WHITE }),
  };

  const projectiles = {};

  world.enemies.forEach(enemy => {
    (enemy.projectiles || []).forEach(projectile => {
      if (projectile.name) {
        projectiles[projectile.id] = GraphicsCreator.createRectangleSprite({
          color: ORANGE,
          width: projectile.shape.width,
          height: projectile.shape.length,
          anchor: 0.5,
        });
      }
    });
  });

  world.player.weapons.forEach(weapon => {
    (weapon.projectiles || []).forEach(projectile => {
      if (projectile.name) {
        projectiles[projectile.id] = GraphicsCreator.createRectangleSprite({
          color: ORANGE,
          width: projectile.shape.width,
          height: projectile.shape.length,
          anchor: 0.5,
        });
      }
    });
  });

  return {
    grid,
    player,
    lines,
    enemies,
    items,
    objects,
    projectiles,
  };
};

export const createSprites = ({
  world,
  graphics,
  text,
  renderer,
  mapView,
}) => ({
  world: mapView
    ? createWorldGraphics({ world })
    : createWorldSprites({ world, graphics, renderer }),
  review: createReviewSprites(text.review),
});
