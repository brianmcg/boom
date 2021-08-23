import { SCREEN, FOV, CELL_SIZE } from 'game/constants/config';
import { Container } from 'game/core/graphics';
import { degrees, castRay } from 'game/core/physics';

const ANGLE_INCREMENT = degrees(FOV) / SCREEN.WIDTH;

const DEG_360 = degrees(360);

const HALF_FOV = degrees(FOV) / 2;

const SCALE = 0.25;

const CENTER = {
  X: SCREEN.WIDTH / 2 / SCALE,
  Y: SCREEN.HEIGHT / 2 / SCALE,
};

const ANGLE_SPRITE_LENGTH = CELL_SIZE / 2;

class MapContainer extends Container {
  constructor({ world, sprites }) {
    super();

    const {
      player,
      enemies,
      lines,
      grid,
      items,
      objects,
    } = sprites;

    Object.values(items).forEach((sprite) => {
      this.addChild(sprite);
    });

    Object.values(objects).forEach((sprite) => {
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
  }

  update(delta) {
    const {
      player,
      enemies,
      grid,
      items,
      objects,
    } = this.world;

    const {
      player: playerSprite,
      grid: gridSprites,
      enemies: enemySprites,
      items: itemSprites,
      objects: objectSprites,
      lines,
    } = this.sprites;

    let angle = (player.viewAngle - HALF_FOV + DEG_360) % DEG_360;

    // Update FOV
    for (let xIndex = 0; xIndex < SCREEN.WIDTH; xIndex += 1) {
      // Cast ray
      const rays = castRay({
        x: player.x,
        y: player.y,
        angle,
        world: this.world,
      });

      const { endPoint } = rays[rays.length - 1];

      lines[xIndex].update({
        x: CENTER.X,
        y: CENTER.Y,
      }, {
        x: (CENTER.X) - (player.x - endPoint.x),
        y: (CENTER.Y) - (player.y - endPoint.y),
      });

      angle = (angle + ANGLE_INCREMENT) % DEG_360;
    }

    // Update cells
    grid.forEach((col) => {
      col.forEach((sector) => {
        if (sector.isDoor || (sector.blocking && !sector.edge)) {
          const sprite = gridSprites[sector.id];
          const { shape } = sector;
          sprite.x = (CENTER.X) - (player.x - (shape.x + shape.width / 2));
          sprite.y = (CENTER.Y) - (player.y - (shape.y + shape.length / 2));
          sprite.width = shape.width;
          sprite.height = shape.length;
        }
      });
    });

    // Update player
    const endPoint = {
      x: player.x + Math.cos(player.viewAngle) * ANGLE_SPRITE_LENGTH * delta,
      y: player.y + Math.sin(player.viewAngle) * ANGLE_SPRITE_LENGTH * delta,
    };

    playerSprite.line.update({
      x: CENTER.X,
      y: CENTER.Y,
    }, {
      x: (CENTER.X) - (player.x - endPoint.x),
      y: (CENTER.Y) - (player.y - endPoint.y),
    });

    objects.forEach((object) => {
      if (object.blocking) {
        const sprite = objectSprites[object.id];

        sprite.x = (CENTER.X) - (player.x - object.x);
        sprite.y = (CENTER.Y) - (player.y - object.y);
      }
    });

    items.forEach((item) => {
      const sprite = itemSprites[item.id];

      sprite.x = (CENTER.X) - (player.x - item.x);
      sprite.y = (CENTER.Y) - (player.y - item.y);

      if (this.world.bodies[item.id]) {
        this.addChild(sprite);
      } else {
        this.removeChild(sprite);
      }
    });

    enemies.forEach((enemy) => {
      const { rectangle, line } = enemySprites[enemy.id];

      const ep = {
        x: enemy.x + Math.cos(enemy.angle) * ANGLE_SPRITE_LENGTH * delta,
        y: enemy.y + Math.sin(enemy.angle) * ANGLE_SPRITE_LENGTH * delta,
      };

      line.update({
        x: (CENTER.X) - (player.x - enemy.x),
        y: (CENTER.Y) - (player.y - enemy.y),
      }, {
        x: (CENTER.X) - (player.x - ep.x),
        y: (CENTER.Y) - (player.y - ep.y),
      });

      rectangle.x = (CENTER.X) - (player.x - enemy.x);
      rectangle.y = (CENTER.Y) - (player.y - enemy.y);

      if (enemy.isDead()) {
        rectangle.scale.x -= 0.1 * delta;
        rectangle.scale.y -= 0.1 * delta;

        if (rectangle.scale.x <= 0) {
          this.removeChild(rectangle);
        }

        this.removeChild(line);
      }
    });
  }
}

export default MapContainer;
