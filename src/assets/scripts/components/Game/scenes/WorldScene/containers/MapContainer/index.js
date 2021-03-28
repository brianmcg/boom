import { SCREEN, FOV } from 'game/constants/config';
import { Container } from 'game/core/graphics';
import { degrees, castRay } from 'game/core/physics';

const ANGLE_INCREMENT = degrees(FOV) / SCREEN.WIDTH;

const DEG_360 = degrees(360);

const HALF_FOV = degrees(FOV) / 2;

class MapContainer extends Container {
  constructor({ world, sprites }) {
    super();

    Object.values(sprites.grid).forEach(sprite => this.addChild(sprite));

    sprites.lines.forEach((line, i) => !i && this.addChild(line));

    this.addChild(sprites.player);

    this.sprites = sprites;

    this.world = world;

    this.scale.set(0.3);
  }

  update() {
    const { player, grid } = this.world;

    const { player: playerSprite, grid: gridSprites, lines } = this.sprites;

    playerSprite.x = player.shape.x;
    playerSprite.y = player.shape.y;

    let angle = (player.viewAngle - HALF_FOV + DEG_360) % DEG_360;

    // for (let xIndex = 0; xIndex < SCREEN.WIDTH; xIndex += 1) {
    //   // Cast ray
    //   const rays = castRay({
    //     x: player.x,
    //     y: player.y,
    //     angle,
    //     world: this.world,
    //   });

    //   const { endPoint } = rays[rays.length - 1];


    //   lines[xIndex].update(player, endPoint);

    //   angle = (angle + ANGLE_INCREMENT) % DEG_360;
    // }

    const rays = castRay({
      x: player.x,
      y: player.y,
      angle: player.viewAngle,
      world: this.world,
    });

    const { endPoint } = rays[rays.length - 1];

    lines[0].update(player, endPoint);


    grid.forEach((row) => {
      row.forEach((sector) => {
        if (sector.isDynamic) {
          const sprite = gridSprites[sector.id];
          const { shape } = sector;
          sprite.x = shape.x;
          sprite.y = shape.y;
          sprite.width = shape.width;
          sprite.height = shape.length;
        }
      });
    });
  }
}

export default MapContainer;
