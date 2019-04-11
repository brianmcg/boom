import Character from '../Character';
import { DEG } from '~/core/physics';

export default class Enemy extends Character {
  constructor(options) {
    super(options);
    this.velocity = 1;
    this.rotVelocity = DEG[1];
  }
}
