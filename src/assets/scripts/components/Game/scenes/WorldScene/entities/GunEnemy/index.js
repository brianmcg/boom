import { TIME_STEP, CELL_SIZE, UPDATE_DISTANCE } from 'game/constants/config';
import AbstractEnemy from '../AbstractEnemy';

const STATES = {
  PATROLLING: 'enemy:patrolling',
  AIMING: 'enemy:aiming',
};

const WAYPOINT_SIZE = CELL_SIZE / 4;

/**
 * Abstract class representing a gun enemy.
 * @extends {AbstractEnemy}
 */
class GunEnemy extends AbstractEnemy {
  /**
   * @param  {Number} options.x               The x coordinate of the character.
   * @param  {Number} options.y               The y coordinate of the character
   * @param  {Number} options.width           The width of the character.
   * @param  {Number} options.length          The length of the character.
   * @param  {Number} options.height          The height of the character.
   * @param  {Number} options.angle           The angle of the character.
   * @param  {Number} options.maxHealth       The maximum health of the character.
   * @param  {Number} options.maxVelocity     The maximum velocity of the enemy.
   * @param  {Number} options.attackRange     The attack range of the enemy.
   * @param  {Number} options.attackTime      The time between attacks.
   * @param  {Number} options.hurtTime        The time the enemy remains hurt when hit.
   * @param  {Number} options.acceleration    The acceleration of the enemy.
   * @param  {Number} options.aimTime         The time before attacking.
   * @param  {Number} options.clipSize        The amount of ammo in a clip.
   */
  constructor({ aimTime = 1000, clipSize = 1, ...other }) {
    super(other);

    this.aimTime = aimTime;
    this.clipSize = clipSize;
    this.ammo = clipSize;
    this.aimTimer = 0;
  }

  /**
   * Update the enemy.
   * @param  {Number} delta The delta time.
   */
  update(delta) {
    if (this.isDead()) return;

    const { player } = this.world;

    this.distanceToPlayer = this.distanceTo(player);

    if (this.distanceToPlayer < UPDATE_DISTANCE) {
      this.face(player);

      switch (this.state) {
        case STATES.PATROLLING:
          this.updatePatrolling(delta);
          break;
        case STATES.AIMING:
          this.updateAiming(delta);
          break;
        default:
          break;
      }

      super.update(delta);
    }
  }

  /**
   * Update enemy in idle state
   */
  updateIdle() {
    if (this.findPlayer()) {
      this.setAlerted();
    }
  }

  /**
   * Update enemy in the alerted state.
   * @param  {Number} delta The delta time.
   */
  updateAlerted(delta) {
    if (this.findPlayer()) {
      this.alertTimer += TIME_STEP * delta;

      if (this.alertTimer >= this.alertTime) {
        if (this.distanceToPlayer <= this.attackRange) {
          this.setAiming();
        } else {
          this.setMoving();
        }
      }
    } else {
      this.setPatrolling();
    }
  }

  /**
   * Update the enemy in the patrolling state.
   */
  updatePatrolling() {
    if (
      Math.abs(this.x - this.waypoint.x) <= WAYPOINT_SIZE
        && Math.abs(this.x - this.waypoint.x) <= WAYPOINT_SIZE
    ) {
      this.setMoving();
    } else {
      this.face(this.waypoint);
    }
  }

  /**
   * Update enemy in chasing state
   */
  updateMoving() {
    if (this.findPlayer()) {
      if (this.distanceToPlayer <= this.attackRange) {
        this.setAiming();
      }
    } else {
      this.setPatrolling();
    }
  }

  /**
   * Update enemy in aiming state
   * @param  {Number} delta The delta time.
   */
  updateAiming(delta) {
    if (this.findPlayer()) {
      if (this.distanceToPlayer <= this.attackRange) {
        this.aimTimer += TIME_STEP * delta;

        if (this.aimTimer >= this.aimTime) {
          this.setAttacking();

          this.ammo -= 1;

          if (this.ammo === 0) {
            this.ammo = this.clipSize;
            this.setPatrolling();
          }
        }
      } else {
        this.setMoving();
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
          this.setAiming();
          this.setAttacking();

          this.ammo -= 1;

          if (this.ammo === 0) {
            this.ammo = this.clipSize;
            this.setPatrolling();
          }
        }
      } else {
        this.setMoving();
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
    const { player } = this.world;
    const ray = this.castRay();

    this.emitSound(this.sounds.attack, {
      distance: this.distanceToPlayer,
    });

    if (player.rayCollision(ray)) {
      player.hurt(this.attackPower);
    }
  }

  /**
   * Add a callback to the patrolling state change.
   * @param  {Function} callback The callback function.
   */
  onPatrolling(callback) {
    this.on(STATES.PATROLLING, callback);
  }

  /**
   * Add a callback to the idle aiming change.
   * @param  {Function} callback The callback function.
   */
  onAiming(callback) {
    this.on(STATES.AIMING, callback);
  }

  /**
   * Set the enemy to the patrolling state.
   * @return {Boolean}  State change successful.
   */
  setPatrolling() {
    const cells = this.world.getAdjacentCells(this)
      .filter(s => !s.blocking && !s.bodies.length && s !== this.waypoint);

    if (cells.length) {
      const index = Math.floor(Math.random() * cells.length);
      const cell = cells[index];
      this.waypoint = cell;
    } else {
      this.waypoint = this.world.getCell(this.gridX, this.gridY);
    }

    this.velocity = this.maxVelocity;

    return this.setState(STATES.PATROLLING);
  }

  /**
   * Set the enemy to the aiming state.
   * @return {Boolean}  State change successful.
   */
  setAiming() {
    this.velocity = 0;
    return this.setState(STATES.AIMING);
  }

  /**
   * Is the enemy in the patrolling state.
   * @return {Boolean} [description]
   */
  isPatrolling() {
    return this.state === STATES.PATROLLING;
  }

  /**
   * Is the enemy in the aiming state.
   * @return {Boolean}
   */
  isAiming() {
    return this.state === STATES.AIMING;
  }

  /**
   * Set the state.
   * @param {String} state The new state.
   */
  setState(state) {
    const stateChange = super.setState(state);

    if (stateChange) {
      this.aimTimer = 0;
    }

    return stateChange;
  }
}

export default GunEnemy;
