import {
  ColorMatrixFilter,
  Container,
  GraphicsCache,
  Line,
  Rectangle,
  Sprite,
} from '@game/core/graphics';
import { RetractableCell, TransparentCell } from '@game/core/physics';
import {
  AbstractDestroyableEntity,
  AbstractEnemy,
  AbstractItem,
  Player,
} from '@game/engine';
import { GAME_FONT } from '@constants/assets';
import { FONT_SIZES } from '@constants/fonts';
import { CELL_SIZE, SCREEN, WALL_LAYERS } from '@constants/config';
import {
  BLACK,
  BLUE,
  GREEN,
  GREY,
  ORANGE,
  PINK,
  PURPLE,
  RED,
  WHITE,
} from '@constants/colors';
import {
  EXPLOSION_SPEED,
  IMPACT_SPEED,
  SPLASH_SPEED,
  SPURT_SPEED,
  TAIL_SPEED,
} from '@constants/sprites';
import { SceneGraphics } from '../../Scene';
import TopDownContainer from '../containers/TopDownContainer';
import ReviewContainer, { StatContainer } from '../containers/ReviewContainer';

import POVContainer, {
  OuterContainer,
  InnerContainer,
  MapContainer,
  PlayerContainer,
  HUDContainer,
} from '../containers/POVContainer';

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

export default class WorldGraphics extends SceneGraphics {
  static createWallSprite(options) {
    const container = new WallSprite(options);
    GraphicsCache.addSprite(container);
    return container;
  }

  static createEntitySprite(options) {
    const container = new EntitySprite(options);
    GraphicsCache.addSprite(container);
    return container;
  }

  static createAnimatedEntitySprite(options) {
    const container = new AnimatedEntitySprite(options);
    GraphicsCache.addSprite(container);
    return container;
  }

  static createBackgroundParticle(options) {
    return new BackgroundSprite(options);
  }

  static createEnemySprite(options) {
    const container = new EnemySprite(options);
    GraphicsCache.addSprite(container);
    return container;
  }

  static createWeaponSprite(options) {
    const container = new WeaponSprite(options);
    GraphicsCache.addSprite(container);
    return container;
  }

  static createHUDKeySprite(options) {
    const container = new HUDKeySprite(options);
    GraphicsCache.addSprite(container);
    return container;
  }

  static createHUDSprite(options) {
    const container = new HUDSprite(options);
    GraphicsCache.addSprite(container);
    return container;
  }

  static createEffectSprite(options) {
    const container = new EffectSprite(options);
    GraphicsCache.addSprite(container);
    return container;
  }

  static createExplosiveEntitySprite(options) {
    const container = new ExplosiveEntitySprite(options);
    GraphicsCache.addSprite(container);
    return container;
  }

  static createProjectileSprite(options) {
    const container = new ProjectileSprite(options);
    GraphicsCache.addSprite(container);
    return container;
  }

  static createReviewContainer(options) {
    const container = new ReviewContainer(options);
    GraphicsCache.addContainer(container);
    return container;
  }

  static createPOVContainer(options) {
    const container = new POVContainer(options);
    GraphicsCache.addContainer(container);
    return container;
  }

  static createTopDownContainer(options) {
    const container = new TopDownContainer(options);
    GraphicsCache.addContainer(container);
    return container;
  }

  static createStatContainer(options) {
    const container = new StatContainer(options);
    GraphicsCache.addContainer(container);
    return container;
  }

  static createOuterContainer(options) {
    const container = new OuterContainer(options);
    GraphicsCache.addContainer(container);
    return container;
  }

  static createInnerContainer(options) {
    const container = new InnerContainer(options);
    GraphicsCache.addContainer(container);
    return container;
  }

  static createMapContainer(options) {
    const container = new MapContainer(options);
    GraphicsCache.addContainer(container);
    return container;
  }

  static createPlayerContainer(options) {
    const container = new PlayerContainer(options);
    GraphicsCache.addContainer(container);
    return container;
  }

  static createHUDContainer(options) {
    const container = new HUDContainer(options);
    GraphicsCache.addContainer(container);
    return container;
  }

  static createLine(options) {
    const line = new Line(options);
    GraphicsCache.addSprite(line);
    return line;
  }

  static tailSpeed() {
    return TAIL_SPEED * Math.random() * (1 - 0.05) + 0.05;
  }

  static createEnemyEntitySprite({ animations, textures, enemy, floorOffset }) {
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

    return WorldGraphics.createEnemySprite({
      textureCollection,
      enemy,
      floorOffset,
    });
  }

  static createWeaponEntitySprite({ animations, textures, player }) {
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

    return WorldGraphics.createWeaponSprite({ textureCollection, player });
  }

  static createProjectileEntitySprite({ animations, textures, rotate }) {
    return WorldGraphics.createProjectileSprite({
      textures: animations.map(animation => textures[animation]),
      rotate,
    });
  }

  static createWallSpriteMask({
    wallTexture,
    floorHeight,
    wallHeight,
    renderer,
  }) {
    const renderTexture = WorldGraphics.createRenderTexture({
      width: CELL_SIZE,
      height: wallHeight,
    });

    const maskContainer = new Container();
    const filter = new ColorMatrixFilter();
    const maskForeground = new Sprite({ texture: wallTexture });

    const maskBackground = WorldGraphics.createRectangleSprite({
      width: CELL_SIZE,
      height: wallHeight,
      cache: false,
    });

    const floorOffset = WorldGraphics.createRectangleSprite({
      width: CELL_SIZE,
      height: floorHeight,
      cache: false,
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

    const sprite = new Sprite({ texture: renderTexture });

    sprite.blendMode = 'overlay';

    maskContainer.filters = [];
    filter.destroy();

    // Sprites only, never their textures. maskForeground holds an atlas
    // texture the wall sprites are still drawing, and the two RectangleSprites
    // share the global Texture.WHITE. See the note in GraphicsCreator.
    maskForeground.destroy();
    maskBackground.destroy();
    floorOffset.destroy();
    maskContainer.destroy();

    return sprite;
  }

  static createWallSprites({
    world,
    frames,
    animations,
    textures,
    renderer,
    bloodColors,
  }) {
    const wallImages = [];
    const wallTextures = {};
    const wallSprites = [...Array(WALL_LAYERS)].map(() => []);
    const spatterContainer = new Container();
    const floorHeight = world.floorOffset
      ? CELL_SIZE * world.floorOffset - 1
      : 0;

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
        const { front, left, back, right, overlay } = cell.faces;
        const transparent = cell instanceof TransparentCell;

        [front, left, back, right].forEach(side => {
          if (
            side &&
            side.name &&
            !wallImages.some(w => w.name === side.name)
          ) {
            wallImages.push({
              name: side.name,
              transparent,
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
          WorldGraphics.createTexture(wallTexture, clearSlice),
        ]);
      }

      const spatterTextures = bloodColors.reduce((memo, bloodColor) => {
        const spatterColorTextures = spatters.map(spatter => {
          const wallHeight = wallTexture.height;

          const renderTexture = WorldGraphics.createRenderTexture({
            width: CELL_SIZE,
            height: wallHeight,
          });

          const spatterTexture = textures[spatter];
          const wallSprite = new Sprite({ texture: wallTexture });
          const spatterSprite = new Sprite({
            texture: spatterTexture,
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
            spatterSprite.mask = WorldGraphics.createWallSpriteMask({
              wallTexture,
              floorHeight: CELL_SIZE * world.floorOffset + 1,
              wallHeight,
              renderer,
            });
          }

          spatterContainer.addChild(wallSprite);

          // TODO: Don't create spatter sprites for transparent walls.
          if (!transparent) {
            spatterContainer.addChild(spatterSprite);
          }

          renderer.render({
            container: spatterContainer,
            target: renderTexture,
          });

          spatterContainer.removeChildren();
          wallSprite.destroy();

          if (spatterSprite.mask) {
            spatterSprite.mask.destroy();
          }

          spatterSprite.destroy();

          return renderTexture;
        });

        return [...memo, ...spatterColorTextures];
      }, []);

      for (let i = 0; i < frame.w; i++) {
        const spatteredSlice = new Rectangle(i, 0, 1, frame.h);

        spatterTextures.forEach(texture => {
          wallTextures[name][i].push(
            WorldGraphics.createTexture(texture, spatteredSlice)
          );
        });
      }

      wallTexture.destroy();
    });

    for (let i = 0; i < SCREEN.WIDTH; i++) {
      for (let j = 0; j < WALL_LAYERS; j++) {
        wallSprites[j].push(
          WorldGraphics.createWallSprite({
            textures: wallTextures,
            index: i,
          })
        );
      }
    }

    spatterContainer.destroy();

    return wallSprites;
  }

  static createSkySprites({ world, textures }) {
    const numberOfSprites = 2;

    if (world.sky) {
      const texture = textures[world.sky];
      const ratio = SCREEN.HEIGHT / texture.height;
      const height = texture.height * ratio;
      const width = texture.width * ratio;

      return [...Array(numberOfSprites).keys()].map(() => {
        const sprite = new Sprite({ texture, width, height });
        GraphicsCache.addSprite(sprite);
        return sprite;
      });
    }

    return [];
  }

  static createBackgroundSprites({ world, frames, textures, bloodColors }) {
    const backgroundImages = [];
    const backgroundTextures = {};
    const sprites = [];

    world.grid.forEach(col => {
      col.forEach(cell => {
        const { top, bottom } = cell.faces;

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
            col.push(WorldGraphics.createTexture(texture, pixel));
          }
          backgroundTextures[image].push(col);
        }
      }
    });

    for (let i = 0; i < SCREEN.WIDTH; i++) {
      const col = [];
      for (let j = 0; j < SCREEN.HEIGHT; j++) {
        col.push(
          WorldGraphics.createBackgroundParticle({
            textures: backgroundTextures,
            x: i,
            y: j,
          })
        );
      }

      sprites.push(col);
    }

    return sprites;
  }

  static createEffectsSprites({ animations, textures, world, renderer }) {
    const spurtContainer = new Container();

    const enemyProjectileExplosionSprites = world.enemies.reduce(
      (memo, enemy) => {
        if (enemy.projectiles) {
          enemy.projectiles.forEach(projectile => {
            if (projectile.effects?.impact) {
              const effectTextures = animations[projectile.effects.impact].map(
                animation => textures[animation]
              );

              memo[projectile.id] = WorldGraphics.createEffectSprite({
                textures: effectTextures,
                animationSpeed: EXPLOSION_SPEED,
              });
            }

            const explode = projectile.explosion?.effects.explode;

            if (explode) {
              const effectTextures = animations[explode].map(
                animation => textures[animation]
              );

              memo[`${projectile.explosion.id}_${explode}`] =
                WorldGraphics.createEffectSprite({
                  textures: effectTextures,
                  animationSpeed: EXPLOSION_SPEED,
                });
            }

            if (projectile.tail) {
              const effectTextures = animations[projectile.tail.name].map(
                animation => textures[animation]
              );

              projectile.tail.ids.forEach(id => {
                memo[id] = WorldGraphics.createEffectSprite({
                  textures: effectTextures,
                  animationSpeed: WorldGraphics.tailSpeed(),
                });
              });
            }
          });
        }

        return memo;
      },
      {}
    );

    const playerExplosionSprites = world.player.weapons.reduce(
      (memo, weapon) => {
        if (weapon.projectiles) {
          weapon.projectiles.forEach(projectile => {
            const explode = projectile.explosion?.effects.explode;

            if (explode) {
              const effectTextures = animations[explode].map(
                animation => textures[animation]
              );

              memo[`${projectile.explosion.id}_${explode}`] =
                WorldGraphics.createEffectSprite({
                  textures: effectTextures,
                  animationSpeed: EXPLOSION_SPEED,
                });
            }

            if (projectile.tail) {
              const effectTextures = animations[projectile.tail.name].map(
                animation => textures[animation]
              );

              projectile.tail.ids.forEach(id => {
                memo[id] = WorldGraphics.createEffectSprite({
                  textures: effectTextures,
                  animationSpeed: WorldGraphics.tailSpeed(),
                });
              });
            }
          });
        }

        return memo;
      },
      {}
    );

    const enemySpurtSprites = world.enemies.reduce((memo, enemy) => {
      const { id, effects, bloodColor } = enemy;

      if (effects.spurt) {
        const spurtTextures = animations[effects.spurt].map(animation => {
          const spurtSprite = new Sprite({
            texture: textures[animation],
            tint: parseInt(bloodColor, 16),
          });

          const renderTexture = WorldGraphics.createRenderTexture({
            width: spurtSprite.width,
            height: spurtSprite.height,
          });

          spurtContainer.addChild(spurtSprite);

          renderer.render({
            container: spurtContainer,
            target: renderTexture,
          });

          spurtContainer.removeChildren();
          spurtSprite.destroy();

          return renderTexture;
        });

        const explosionSprite = WorldGraphics.createEffectSprite({
          textures: spurtTextures,
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

        memo[`${enemy.id}_${enemy.splash}`] = WorldGraphics.createEffectSprite({
          textures: splashTextures,
          rotate: false,
          animationSpeed: SPLASH_SPEED,
        });
      }

      if (enemy.ripple) {
        const rippleTextures = animations[enemy.ripple].map(
          animation => textures[animation]
        );

        memo[`${enemy.id}_${enemy.ripple}`] = WorldGraphics.createEffectSprite({
          textures: rippleTextures,
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

          memo[`${enemy.explosion.id}_${explode}`] =
            WorldGraphics.createEffectSprite({
              textures: effectTextures,
              animationSpeed: EXPLOSION_SPEED,
              rotate: false,
            });
        }

        if (enemy.tail) {
          const effectTextures = animations[enemy.tail.name].map(
            animation => textures[animation]
          );

          enemy.tail.ids.forEach(id => {
            memo[id] = WorldGraphics.createEffectSprite({
              textures: effectTextures,
              animationSpeed: WorldGraphics.tailSpeed(),
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

        memo[`${object.explosion.id}_${explode}`] =
          WorldGraphics.createEffectSprite({
            textures: effectTextures,
            animationSpeed: EXPLOSION_SPEED,
            rotate: false,
          });
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

            playerHitScanSprites[id] = WorldGraphics.createEffectSprite({
              textures: effectTextures,
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
        const spurtSprite = new Sprite({
          texture: textures[animation],
          tint: parseInt(bloodColor, 16),
        });

        const renderTexture = WorldGraphics.createRenderTexture({
          width: spurtSprite.width,
          height: spurtSprite.height,
        });

        spurtContainer.addChild(spurtSprite);

        renderer.render({
          container: spurtContainer,
          target: renderTexture,
        });

        spurtContainer.removeChildren();
        spurtSprite.destroy();

        return renderTexture;
      });

      playerSpurtSprites[`${id}_${effects.spurt}`] =
        WorldGraphics.createEffectSprite({
          textures: playerSpurtTextures,
          animationSpeed: SPURT_SPEED,
          rotate: false,
        });
    }

    spurtContainer.destroy();

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
  }

  static createEntitySprites({ animations, textures, world }) {
    const entitySprites = {};

    world.items.forEach(item => {
      entitySprites[item.id] = WorldGraphics.createAnimatedEntitySprite({
        textures: animations[item.name].map(t => textures[t]),
        floorOffset: world.floorOffset,
      });
    });

    world.objects.forEach(object => {
      if (object.explosion) {
        entitySprites[object.id] = WorldGraphics.createExplosiveEntitySprite({
          textures: animations[object.name].map(t => textures[t]),
          entity: object,
        });
      } else if (object.animated) {
        entitySprites[object.id] = WorldGraphics.createAnimatedEntitySprite({
          textures: animations[object.name].map(t => textures[t]),
          animationSpeed: object.animationSpeed,
        });
      } else {
        entitySprites[object.id] = WorldGraphics.createEntitySprite({
          texture: textures[object.name],
        });
      }
    });

    world.enemies.forEach(enemy => {
      const { spawnItem } = enemy;

      if (spawnItem) {
        entitySprites[spawnItem.id] = WorldGraphics.createAnimatedEntitySprite({
          textures: animations[spawnItem.name].map(t => textures[t]),
          floorOffset: world.floorOffset,
        });
      }

      entitySprites[enemy.id] = WorldGraphics.createEnemyEntitySprite({
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
          entitySprites[projectile.id] =
            WorldGraphics.createProjectileEntitySprite({
              animations: animations[projectile.name],
              textures,
            });
        }
      });

    world.player.weapons
      .reduce((memo, weapon) => [...memo, ...(weapon.projectiles || [])], [])
      .forEach(projectile => {
        if (projectile.name) {
          entitySprites[projectile.id] =
            WorldGraphics.createProjectileEntitySprite({
              animations: animations[projectile.name],
              textures,
              rotate: projectile.rotate,
            });
        }
      });

    return entitySprites;
  }

  static createReviewSprites(text) {
    const background = WorldGraphics.createRectangleSprite({
      x: -SCREEN.WIDTH / 2,
      y: -SCREEN.HEIGHT / 2,
      width: SCREEN.WIDTH * 2,
      height: SCREEN.HEIGHT * 2,
      color: BLACK,
      alpha: 0,
    });

    const title = WorldGraphics.createTextSprite({
      fontFamily: GAME_FONT.NAME,
      fontSize: FONT_SIZES.LARGE,
      text: text.title,
      color: WHITE,
      anchor: 0.5,
    });

    const enemies = {
      name: WorldGraphics.createTextSprite({
        fontFamily: GAME_FONT.NAME,
        fontSize: FONT_SIZES.MEDIUM,
        text: text.enemies,
        color: WHITE,
        anchor: 0.5,
      }),
      value: WorldGraphics.createTextSprite({
        fontFamily: GAME_FONT.NAME,
        fontSize: FONT_SIZES.MEDIUM,
        text: '0',
        color: RED,
        anchor: 0.5,
      }),
    };

    const items = {
      name: WorldGraphics.createTextSprite({
        fontFamily: GAME_FONT.NAME,
        fontSize: FONT_SIZES.MEDIUM,
        text: text.items,
        color: WHITE,
        anchor: 0.5,
      }),
      value: WorldGraphics.createTextSprite({
        fontFamily: GAME_FONT.NAME,
        fontSize: FONT_SIZES.MEDIUM,
        text: '0',
        color: RED,
        anchor: 0.5,
      }),
    };

    const secrets = {
      name: WorldGraphics.createTextSprite({
        fontFamily: GAME_FONT.NAME,
        fontSize: FONT_SIZES.MEDIUM,
        text: text.secrets,
        color: WHITE,
        anchor: 0.5,
      }),
      value: WorldGraphics.createTextSprite({
        fontFamily: GAME_FONT.NAME,
        fontSize: FONT_SIZES.MEDIUM,
        text: '0',
        color: RED,
        anchor: 0.5,
      }),
    };

    const time = {
      name: WorldGraphics.createTextSprite({
        fontFamily: GAME_FONT.NAME,
        fontSize: FONT_SIZES.MEDIUM,
        text: text.time,
        color: WHITE,
        anchor: 0.5,
      }),
      value: WorldGraphics.createTextSprite({
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
  }

  static createHudSprites({ world, textures, animations }) {
    const healthAmount = WorldGraphics.createTextSprite({
      fontFamily: GAME_FONT.NAME,
      fontSize: FONT_SIZES.MEDIUM,
      color: WHITE,
      anchor: 0.5,
    });

    const ammoAmount = WorldGraphics.createTextSprite({
      fontFamily: GAME_FONT.NAME,
      fontSize: FONT_SIZES.MEDIUM,
      color: WHITE,
      anchor: 0.5,
    });

    const ammoIcon = WorldGraphics.createHUDSprite({
      texture: textures.ammo,
      maxScale: healthAmount.height / textures.ammo.frame.height,
      anchor: 0.5,
    });

    const healthIcon = WorldGraphics.createHUDSprite({
      texture: textures.health,
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
        const keyTexture = WorldGraphics.createTexture(source, frame);

        return {
          ...memo,
          [item.color]: WorldGraphics.createHUDKeySprite(keyTexture),
        };
      }

      return memo;
    }, {});

    const foreground = WorldGraphics.createRectangleSprite({
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
  }

  static createWorldSprites({ world, graphics, renderer }) {
    const { textures, data } = graphics;
    const { frames, animations } = data;
    const { player, enemies } = world;

    const bloodColors = [player, ...enemies].reduce((memo, { bloodColor }) => {
      if (bloodColor && !memo.includes(bloodColor)) {
        return [...memo, bloodColor];
      }

      return memo;
    }, []);

    const entities = WorldGraphics.createEntitySprites({
      animations,
      textures,
      world,
    });

    const weapon = WorldGraphics.createWeaponEntitySprite({
      animations,
      textures,
      player,
    });

    const walls = WorldGraphics.createWallSprites({
      animations,
      frames,
      textures,
      world,
      renderer,
      bloodColors,
    });

    const background = WorldGraphics.createBackgroundSprites({
      frames,
      textures,
      world,
      bloodColors,
    });

    const sky = WorldGraphics.createSkySprites({ world, textures });

    const hud = WorldGraphics.createHudSprites({ world, textures, animations });

    const effects = WorldGraphics.createEffectsSprites({
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
  }

  static createTopDownGraphics({ world }) {
    const color = body => {
      if (body instanceof Player) {
        return GREEN;
      }

      if (body instanceof RetractableCell) {
        return WHITE;
      }

      if (body instanceof AbstractItem) {
        return BLUE;
      }

      if (body instanceof AbstractEnemy) {
        return PINK;
      }

      if (body instanceof AbstractDestroyableEntity) {
        return PURPLE;
      }

      return GREY;
    };

    const alpha = body => {
      if (body instanceof TransparentCell) {
        return 1 - 0.5 / body.transparency;
      }

      return 1;
    };

    const lines = [...Array(SCREEN.WIDTH).keys()].map(() =>
      WorldGraphics.createLine({
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
              [sector.id]: WorldGraphics.createRectangleSprite({
                color: color(sector),
                alpha: alpha(sector),
                width: sector.width,
                height: sector.length,
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
          rectangle: WorldGraphics.createRectangleSprite({
            color: color(body),
            width: body.width,
            height: body.length,
            anchor: 0.5,
          }),
          line: WorldGraphics.createLine({ color: WHITE }),
        },
      }),
      {}
    );

    const objects = world.objects.reduce((memo, body) => {
      if (body.blocking) {
        return {
          ...memo,
          [body.id]: WorldGraphics.createRectangleSprite({
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
        [body.id]: WorldGraphics.createRectangleSprite({
          color: color(body),
          width: body.width,
          height: body.length,
          anchor: 0.5,
        }),
      }),
      {}
    );

    const player = {
      rectangle: WorldGraphics.createRectangleSprite({
        color: color(world.player),
        width: world.player.width,
        height: world.player.length,
        anchor: 0.5,
      }),
      line: WorldGraphics.createLine({ color: WHITE }),
    };

    const projectiles = {};

    world.enemies.forEach(enemy => {
      (enemy.projectiles || []).forEach(projectile => {
        if (projectile.name) {
          projectiles[projectile.id] = WorldGraphics.createRectangleSprite({
            color: ORANGE,
            width: projectile.width,
            height: projectile.length,
            anchor: 0.5,
          });
        }
      });
    });

    world.player.weapons.forEach(weapon => {
      (weapon.projectiles || []).forEach(projectile => {
        if (projectile.name) {
          projectiles[projectile.id] = WorldGraphics.createRectangleSprite({
            color: ORANGE,
            width: projectile.width,
            height: projectile.length,
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
  }

  static createSprites({ world, graphics, text, renderer, isMapView }) {
    return {
      world: isMapView
        ? WorldGraphics.createTopDownGraphics({ world })
        : WorldGraphics.createWorldSprites({ world, graphics, renderer }),
      review: WorldGraphics.createReviewSprites(text.review),
    };
  }
}
