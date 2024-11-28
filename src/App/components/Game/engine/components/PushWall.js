import translate from '@util/translate';
import { CELL_SIZE } from '@constants/config';
import { AXES } from '@game/core/physics';
import DynamicCell from './DynamicCell';

const SHAKE_MULTIPLIER = 0.2;

export default class PushWall extends DynamicCell {
  constructor(options) {
    super(options);

    this.isPushWall = true;
    this.direction = { x: 0, y: 0 };
  }

  use(user) {
    if (this.axis === AXES.X) {
      this.direction = {
        x: 0,
        y: Math.sign(user.gridY - this.gridY),
      };
    } else {
      this.direction = {
        x: Math.sign(user.gridX - this.gridX),
        y: 0,
      };
    }

    if (!this.isPushed && this.canMove()) {
      this.isPushed = true;
      this.distanceToPlayer = this.getDistanceTo(user);
      this.emitSound(this.sounds.start);
      this.emitSound(this.sounds.move, true);
      const shake =
        (CELL_SIZE / this.distanceToPlayer) * this.speed * SHAKE_MULTIPLIER;

      this.parent.player.shake(shake);
      this.startUpdates();

      user.addMessage(translate('world.wall.secret'));
    }
  }

  update(delta) {
    super.update(delta);

    const { x, y, speed } = this;
    const axis = this.axis === AXES.X ? AXES.Y : AXES.X;

    this.offset[axis] += speed * delta;

    if (this.offset[axis] > CELL_SIZE) {
      const currentGridX = this.gridX;
      const currentGridY = this.gridY;
      const nextGridX = this.gridX - this.direction.x;
      const nextGridY = this.gridY - this.direction.y;
      const nextCell = this.parent.getCell(nextGridX, nextGridY);

      nextCell.x = x;
      nextCell.y = y;

      this.x = CELL_SIZE * nextGridX + CELL_SIZE / 2;
      this.y = CELL_SIZE * nextGridY + CELL_SIZE / 2;

      this.parent.setCell(currentGridX, currentGridY, nextCell);
      this.parent.setCell(nextGridX, nextGridY, this);

      if (this.canMove()) {
        this.offset[axis] = 0;
      } else {
        const shake =
          (CELL_SIZE / this.distanceToPlayer) * speed * SHAKE_MULTIPLIER;

        this.offset[axis] = 0.1 * CELL_SIZE;
        this.parent.player.shake(shake);
        this.stopSound(this.sounds.move);
        this.emitSound(this.sounds.stop);
        this.stopUpdates();
        this.isOpened = true;
      }
    }
  }

  canMove() {
    const x = this.gridX - this.direction.x;
    const y = this.gridY - this.direction.y;
    const nextCell = this.parent.getCell(x, y);

    return nextCell.id !== this.id && !nextCell.blocking;
  }
}
