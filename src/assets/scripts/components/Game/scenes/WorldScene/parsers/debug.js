import { SCREEN } from 'game/constants/config';
import {
  BROWN,
  RED,
  YELLOW,
  BLUE,
  WHITE,
} from 'game/constants/colors';
import { RectangleSprite, Line } from 'game/core/graphics';
import Player from '../entities/Player';
import Door from '../entities/Door';
import Item from '../entities/Item';
import Amp from '../entities/Amp';

/**
 * Create the debug container sprites.
 * @param  {World} world  The world.
 */
export const createDebugSprites = (world) => {
  const bodySprites = {};
  const { bodies } = world;

  let color;

  const raySprites = [];

  for (let i = 0; i < SCREEN.WIDTH; i += 1) {
    raySprites.push(new Line({ color: YELLOW }));
  }

  Object.values(bodies).forEach((body) => {
    if (body.blocking || body instanceof Item) {
      if (body instanceof Player) {
        color = 0x00FF00;
      } else if (body instanceof Item) {
        color = BLUE;
      } else if (body instanceof Amp) {
        color = RED;
      } else if (body instanceof Door) {
        color = BROWN;
      } else {
        color = WHITE;
      }

      bodySprites[body.id] = new RectangleSprite({
        width: body.shape.width,
        height: body.shape.width,
        color,
      });
    }
  });

  return { bodySprites, raySprites };
};
