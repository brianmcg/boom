import { TIME_STEP, UPDATE_DISTANCE } from 'game/constants/config';
import AbstractEnemy from '../AbstractEnemy';
import Projectile from '../Projectile';

/**
 * Abstract class representing a gun enemy.
 * @extends {AbstractEnemy}
 */
class ProjectileEnemy extends AbstractEnemy {
  constructor({
    projectiles,
    projectile,
    clipSize,
    ...other
  }) {
    super(other);

    this.projectiles = [...Array(projectiles).keys()]
      .map(() => new Projectile({
        ...projectile,
        source: this,
      }));

    this.clipSize = clipSize;
    this.ammo = clipSize;

    this.numberOfAttacks = projectiles;
  }

  /**
   * Update the enemy.
   * @param  {Number} delta The delta time.
   */
  update(delta) {
    const { player } = this.world;

    this.distanceToPlayer = this.distanceTo(player);

    if (this.distanceToPlayer < UPDATE_DISTANCE) {
      this.face(player);

      super.update(delta);
    }
  }

  updateAlerted(delta) {
    if (this.findPlayer()) {
      this.alertTimer += TIME_STEP * delta;

      if (this.alertTimer >= this.alertTime) {
        if (this.distanceToPlayer <= this.attackRange) {
          this.setAttacking();
        } else {
          this.setChasing();
        }
      }
    } else {
      this.setPatrolling();
    }
  }

  /**
   * Update enemy in chasing state
   */
  updateChasing() {
    if (this.findPlayer()) {
      if (this.distanceToPlayer <= this.attackRange) {
        this.setAttacking();
      }
    } else {
      this.setPatrolling();
    }
  }

  /**
   * Update enemy in attacking state
   * @param  {Number} delta The delta time.
   */
  updateAttacking(delta) {
    if (this.findPlayer()) {
      if (this.distanceToPlayer <= this.attackRange) {
        this.attackTimer += TIME_STEP * delta;

        if (this.attackTimer >= this.attackTime) {
          if (this.ammo === 0) {
            this.ammo = this.clipSize;
            this.setPatrolling();
          } else {
            this.setIdle();
            this.setAttacking();
          }
        }
      } else {
        this.setChasing();
      }
    } else {
      this.setPatrolling();
    }
  }

  /**
   * Update enemy in hurt state
   * @param  {Number} delta The delta time.
   */
  updateHurting(delta) {
    this.hurtTimer += TIME_STEP * delta;

    if (this.hurtTimer >= this.hurtTime) {
      this.setPatrolling();
    }
  }

  /**
   * Attack a target.
   */
  attack() {
    if (this.projectiles.length) {
      const projectile = this.projectiles.pop();

      projectile.initialize();

      this.ammo -= 1;

      this.world.add(projectile);
    }
  }
}

export default ProjectileEnemy;
