import { SCREEN, FOV, CELL_SIZE } from '@constants/config';
import { Container } from '@game/core/graphics';
import { degrees, castRay } from '@game/core/physics';

const ANGLE_INCREMENT = degrees(FOV) / SCREEN.WIDTH;

const DEG_360 = degrees(360);

const HALF_FOV = degrees(FOV) / 2;

const SCALE = 0.25;

const CENTER = {
  X: SCREEN.WIDTH / 2 / SCALE,
  Y: SCREEN.HEIGHT / 2 / SCALE,
};

const ANGLE_SPRITE_LENGTH = CELL_SIZE / 2;

// TODO: Change weapons and remove explosive barrels.
export default class MapContainer extends Container {
  constructor({ world, sprites }) {
    super();

    const { player, enemies, lines, grid, items, objects } = sprites;

    Object.values(items).forEach(sprite => {
      this.addChild(sprite);
    });

    Object.values(objects).forEach(sprite => {
      this.addChild(sprite);
    });

    Object.values(grid).forEach(sprite => this.addChild(sprite));

    lines.forEach(line => this.addChild(line));

    Object.values(enemies).forEach(({ rectangle, line }) => {
      this.addChild(rectangle);
      this.addChild(line);
    });

    player.rectangle.x = CENTER.X;
    player.rectangle.y = CENTER.Y;

    this.addChild(player.rectangle);
    this.addChild(player.line);

    this.sprites = sprites;
    this.world = world;
    this.scale.set(SCALE);

    this.projectiles = [];

    world.enemies.forEach(enemy => {
      (enemy.projectiles || []).forEach(projectile => {
        if (projectile.name) {
          this.projectiles.push(projectile);
        }
      });
    });

    world.player.weapons.forEach(weapon => {
      (weapon.projectiles || []).forEach(projectile => {
        if (projectile.name) {
          this.projectiles.push(projectile);
        }
      });
    });
  }

  update({ deltaTime }) {
    const { player, enemies, grid, items, objects, bodies } = this.world;

    const {
      player: playerSprite,
      grid: gridSprites,
      enemies: enemySprites,
      items: itemSprites,
      objects: objectSprites,
      projectiles: projectileSprites,
      lines,
    } = this.sprites;

    this.projectiles.forEach(projectile => {
      const sprite = projectileSprites[projectile.id];

      if (projectile.parent) {
        this.addChild(sprite);

        sprite.x = CENTER.X - (player.x - projectile.x);
        sprite.y = CENTER.Y - (player.y - projectile.y);
      } else {
        this.removeChild(sprite);
      }
    });

    let angle = (player.viewAngle - HALF_FOV + DEG_360) % DEG_360;

    // Update FOV
    for (let xIndex = 0; xIndex < SCREEN.WIDTH; xIndex++) {
      // Cast ray
      const rays = castRay({
        x: player.x,
        y: player.y,
        angle,
        world: this.world,
      });

      const { endPoint } = rays[rays.length - 1];

      lines[xIndex].update(
        {
          x: CENTER.X,
          y: CENTER.Y,
        },
        {
          x: CENTER.X - (player.x - endPoint.x),
          y: CENTER.Y - (player.y - endPoint.y),
        }
      );

      angle = (angle + ANGLE_INCREMENT) % DEG_360;
    }

    // Update cells
    grid.forEach(col => {
      col.forEach(sector => {
        if (sector.isDoor || (sector.blocking && !sector.edge)) {
          const sprite = gridSprites[sector.id];
          const { shape } = sector;
          sprite.x = CENTER.X - (player.x - (shape.x + shape.width / 2));
          sprite.y = CENTER.Y - (player.y - (shape.y + shape.length / 2));
          sprite.width = shape.width;
          sprite.height = shape.length;
        }
      });
    });

    // Update player
    const endPoint = {
      x:
        player.x + Math.cos(player.viewAngle) * ANGLE_SPRITE_LENGTH * deltaTime,
      y:
        player.y + Math.sin(player.viewAngle) * ANGLE_SPRITE_LENGTH * deltaTime,
    };

    playerSprite.line.update(
      {
        x: CENTER.X,
        y: CENTER.Y,
      },
      {
        x: CENTER.X - (player.x - endPoint.x),
        y: CENTER.Y - (player.y - endPoint.y),
      }
    );

    objects.forEach(object => {
      const sprite = objectSprites[object.id];

      if (sprite) {
        sprite.x = CENTER.X - (player.x - object.x);
        sprite.y = CENTER.Y - (player.y - object.y);

        if (object.isExploding) {
          this.removeChild(sprite);
        }
      }
    });

    items.forEach(item => {
      const sprite = itemSprites[item.id];

      sprite.x = CENTER.X - (player.x - item.x);
      sprite.y = CENTER.Y - (player.y - item.y);

      if (this.world.bodies[item.id]) {
        this.addChild(sprite);
      } else {
        this.removeChild(sprite);
      }
    });

    enemies.forEach(enemy => {
      const { rectangle, line } = enemySprites[enemy.id];

      const ep = {
        x: enemy.x + Math.cos(enemy.angle) * ANGLE_SPRITE_LENGTH * deltaTime,
        y: enemy.y + Math.sin(enemy.angle) * ANGLE_SPRITE_LENGTH * deltaTime,
      };

      line.update(
        {
          x: CENTER.X - (player.x - enemy.x),
          y: CENTER.Y - (player.y - enemy.y),
        },
        {
          x: CENTER.X - (player.x - ep.x),
          y: CENTER.Y - (player.y - ep.y),
        }
      );

      rectangle.x = CENTER.X - (player.x - enemy.x);
      rectangle.y = CENTER.Y - (player.y - enemy.y);

      if (enemy.isDead()) {
        rectangle.scale.x -= 0.1 * deltaTime;
        rectangle.scale.y -= 0.1 * deltaTime;

        if (rectangle.scale.x <= 0) {
          this.removeChild(rectangle);
        }

        this.removeChild(line);
      }
    });

    items.forEach(item => {
      const sprite = itemSprites[item.id];

      if (bodies[item.id]) {
        this.addChild(sprite);
      } else {
        this.removeChild(sprite);
      }
    });
  }
}
