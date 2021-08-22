import { SCREEN, FOV } from 'game/constants/config';
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

    const { player, lines, grid } = sprites;

    Object.values(grid).forEach(sprite => this.addChild(sprite));

    lines.forEach(line => this.addChild(line));

    player.x =  CENTER.X;
    player.y =  CENTER.Y;

    this.addChild(player);

    this.sprites = sprites;

    this.world = world;

    this.scale.set(SCALE);
  }

  update() {
    const { player, grid } = this.world;
    const { player: playerSprite, grid: gridSprites, lines } = this.sprites;
    let angle = (player.viewAngle - HALF_FOV + DEG_360) % DEG_360;



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
        x: (CENTER.X) + (player.width / 2),
        y: (CENTER.Y) + (player.width / 2),
      }, {
        x: (CENTER.X) - (player.shape.x - endPoint.x),
        y: (CENTER.Y) - (player.shape.y - endPoint.y),
      });

      angle = (angle + ANGLE_INCREMENT) % DEG_360;
    }

    grid.forEach((col) => {
      col.forEach((sector) => {
        if (sector.isDoor || (sector.blocking && !sector.edge)) {
          const sprite = gridSprites[sector.id];
          const { shape } = sector;
          sprite.x = (CENTER.X) - (player.shape.x - shape.x);
          sprite.y = (CENTER.Y) - (player.shape.y - shape.y);
          sprite.width = shape.width;
          sprite.height = shape.length;
        }
      });
    });
  }
}

export default MapContainer;
