import { degrees } from '@game/core/physics';
import AbstractEnemy from './AbstractEnemy';

const DEG_180 = degrees(180);

const DEG_360 = degrees(360);

export default class ChaseEnemy extends AbstractEnemy {
  onAttackComplete() {
    this.setChasing();
  }

  onHurtComplete() {
    this.target = this.parent.player;
    this.setChasing();
  }

  attack() {
    const { player } = this.parent;

    this.emitSound(this.sounds.attack);

    const angle = (this.getAngleTo(player) - DEG_180 + DEG_360) % DEG_360;
    const damage = this.attackDamage();

    player.hit({ damage, angle });
  }
}
