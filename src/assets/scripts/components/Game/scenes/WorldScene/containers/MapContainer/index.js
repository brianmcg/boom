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

class MapContainer extends Container {
  constructor({ world, sprites }) {
    super();

    // console.log(sprites);

    const { player, enemies, lines, grid } = sprites;

    Object.values(grid).forEach(sprite => this.addChild(sprite));

    lines.forEach(line => this.addChild(line));

    Object.values(enemies).forEach(({ rectangle, line }) => {
      this.addChild(rectangle);
      this.addChild(line);
    });

    player.rectangle.x =  CENTER.X;
    player.rectangle.y =  CENTER.Y;

    this.addChild(player.rectangle);
    this.addChild(player.line);


    this.sprites = sprites;

    this.world = world;

    this.scale.set(SCALE);
  }

  update(delta) {
    const { player, enemies, grid } = this.world;
    const {
      player: playerSprite,
      grid: gridSprites,
      enemies: enemySprites,
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
          sprite.x = (CENTER.X) - (player.x - sector.x);
          sprite.y = (CENTER.Y) - (player.y - sector.y);
          sprite.width = shape.width;
          sprite.height = shape.length;
        }
      });
    });

    // Update player
    const endPoint = {
      x: player.x + Math.cos(player.angle) * CELL_SIZE * delta,
      y: player.y + Math.sin(player.angle) * CELL_SIZE * delta,
    };

    playerSprite.line.update({
      x: CENTER.X,
      y: CENTER.Y,
    }, {
      x: (CENTER.X) - (player.x - endPoint.x),
      y: (CENTER.Y) - (player.y - endPoint.y),
    });

    enemies.forEach((enemy) => {
      const { rectangle, line } = enemySprites[enemy.id];
      rectangle.x = (CENTER.X) - (player.x - enemy.x);
      rectangle.y = (CENTER.Y) - (player.y - enemy.y);

      if (enemy.isDead()) {
        rectangle.alpha = 0.25;
      }
    });
  }
}

export default MapContainer;
