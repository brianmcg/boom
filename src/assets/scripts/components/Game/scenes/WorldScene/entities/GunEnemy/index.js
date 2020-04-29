import { CELL_SIZE } from 'game/constants/config';
import { degrees } from 'game/core/physics';
import AbstractEnemy from '../AbstractEnemy';

const DEG_360 = degrees(360);

/**
 * Abstract class representing a gun enemy.
 * @extends {AbstractEnemy}
 */
class GunEnemy extends AbstractEnemy {
  /**
   * Creates a gun enemy.
   * @param  {Number} options.x               The x coordinate of the character.
   * @param  {Number} options.y               The y coordinate of the character
   * @param  {Number} options.width           The width of the character.
   * @param  {Number} options.height          The height of the character.
   * @param  {Number} options.angle           The angle of the character.
   * @param  {Number} options.maxHealth       The maximum health of the character.
   * @param  {Number} options.speed           The maximum speed of the enemy.
   * @param  {Number} options.attackRange     The attack range of the enemy.
   * @param  {Number} options.attackTime      The time between attacks.
   * @param  {Number} options.hurtTime        The time the enemy remains hurt when hit.
   * @param  {Number} options.alerTime        The time before attacking adter alert.
   * @param  {Number} options.acceleration    The acceleration of the enemy.
   */
  constructor({ primaryAttack, attackRange, ...other }) {
    super({ primaryAttack, attackRange, ...other });

    this.primaryAttack = {
      ...this.primaryAttack,
      spread: [...Array(primaryAttack.spread).keys()].map(i => i),
      spreadAngle: primaryAttack.spread > 1
        ? Math.atan2(CELL_SIZE, CELL_SIZE * attackRange) / 2
        : 0,
      pelletAngle: primaryAttack.spread > 1
        ? Math.atan2(CELL_SIZE, CELL_SIZE * attackRange) / primaryAttack.spread
        : 0,
    };
  }

  /**
   * Execute completed attack behavior.
   */
  onAttackComplete() {
    this.setIdle();
    this.setAttacking();
  }

  /**
   * Execute recovery behaviour.
   */
  onHurtComplete() {
    this.setPatrolling();
  }

  /**
   * Attack a target.
   */
  attack() {
    const { player } = this.parent;
    const { spreadAngle, pelletAngle, spread } = this.primaryAttack;

    let rayAngle = (this.angle - spreadAngle + DEG_360) % DEG_360;
    let damage = 0;

    for (let i = 0; i < spread.length; i += 1) {
      if (player.isRayCollision(this.castRay(rayAngle))) {
        damage += this.attackDamage();
      }

      rayAngle = (rayAngle + pelletAngle) % DEG_360;
    }

    this.emitSound(this.sounds.attack);

    player.hurt(damage);
  }
}

export default GunEnemy;
