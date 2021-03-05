import { CELL_SIZE } from 'game/constants/config';
import { degrees } from 'game/core/physics';
import AbstractEnemy from '../AbstractEnemy';
import HitScan from '../HitScan';

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
   * @param  {Number} options.stateDurations  The time to stay in a state.
   * @param  {Number} options.acceleration    The acceleration of the enemy.
   */
  constructor({ primaryAttack, ...other }) {
    super({ primaryAttack, ...other });

    const { pellets, spread } = primaryAttack;

    this.primaryAttack = {
      ...this.primaryAttack,
      pellets: [...Array(pellets).keys()].map(i => i),
      spreadAngle: pellets > 1 ? Math.atan2(CELL_SIZE, CELL_SIZE * spread) / 2 : 0,
      pelletAngle: pellets > 1 ? Math.atan2(CELL_SIZE, CELL_SIZE * spread) / pellets : 0,
    };

    this.projectiles = [...Array(pellets).keys()].map(() => new HitScan());
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
    const {
      spreadAngle,
      pelletAngle,
      pellets,
      power,
      range,
    } = this.primaryAttack;

    let rayAngle = (this.angle - spreadAngle + DEG_360) % DEG_360;

    for (let i = 0; i < pellets.length; i += 1) {
      const projectile = this.projectiles.shift();

      if (projectile) {
        projectile.execute({
          ray: this.castRay(rayAngle),
          damage: this.attackDamage(),
          parent: this.parent,
          range,
          power,
        });

        this.projectiles.push(projectile);
      }

      rayAngle = (rayAngle + pelletAngle) % DEG_360;
    }

    this.emitSound(this.sounds.attack);
  }
}

export default GunEnemy;
