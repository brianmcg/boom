import { degrees } from 'game/core/physics';
import { CELL_SIZE, UPDATE_DISTANCE } from 'game/constants/config';
import AbstractActor from '../AbstractActor';
import TransparentCell from '../TransparentCell';
import Explosion from '../Explosion';

const STATES = {
  IDLE: 'enemy:idle',
  ALERTED: 'enemy:alerted',
  EVADING: 'enemy:evading',
  CHASING: 'enemy:chasing',
  RETREATING: 'enemy:retreating',
  AIMING: 'enemy:aiming',
  ATTACKING: 'enemy:attacking',
  HURTING: 'enemy:hurting',
  DEAD: 'enemy:dead',
};

const FLOAT_INCREMENT = 0.075;

const FLOAT_BOUNDARY = 4;

const FORCE_FADE = 0.85;

const MIN_FORCE = 0.1;

const NEARBY = CELL_SIZE * 6;

const GROWL_INTERVAL = 8000;

const DEAD_VELOCITY_MULTIPLIER = 0.25;

const DEG_90 = degrees(90);

const DEG_360 = degrees(360);

const MAX_STAIN_RADIUS = CELL_SIZE / 4;

const STAIN_INTERVAL = 50;

const MAX_PATH_INDEX = 2;

/**
 * Abstract class representing an enemy.
 * @extends {AbstractActor}
 */
class AbstractEnemy extends AbstractActor {
  /**
   * Creates an abstract enemy.
   * @param  {Number}  options.x              The x coordinate of the enemy.
   * @param  {Number}  options.y              The y coordinate of the enemy.
   * @param  {Number}  options.z              The z coordinate of the enemy.
   * @param  {Number}  options.width          The width of the enemy.
   * @param  {Number}  options.height         The length of the enemy.
   * @param  {Number}  options.height         The height of the enemy.
   * @param  {Boolean} options.blocking       The blocking value of the enemy.
   * @param  {Number}  options.anchor         The anchor of the enemy.
   * @param  {Number}  options.angle          The angle of the enemy.
   * @param  {Number}  options.weight         The weight of the enemy.
   * @param  {Number}  options.autoPlay       The autopPlay value of the enemy.
   * @param  {String}  options.name           The name of the enemy.
   * @param  {Object}  options.sounds         The enemy sounds.
   * @param  {Object}  options.soundSprite    The enemy sound sprite.
   * @param  {Number}  options.scale          The enemy scale.
   * @param  {Object}  options.tail           The enemy tail.
   * @param  {Number}  options.health         The current health of the enemy.
   * @param  {Number}  options.maxHealth      The maximum health of the enemy.
   * @param  {Object}  options.effects        The effects of the enemy.
   * @param  {Number}  options.speed          The speed of the enemy.
   * @param  {Number}  options.acceleration   The acceleration of the enemy.
   * @param  {Array}   options.spatters       The spatter values of the enemy.
   * @param  {String}  options.bloodColor     The blood color of the enemy.
   * @param  {Number}  options.stateDurations The times to stay in each state.
   * @param  {Number}  options.maxAttacks     The max number of attacks before evading.
   * @param  {Boolean} options.float          The float enemy property.
   * @param  {Object}  options.primaryAttack  The primary attack properties.
   * @param  {Number}  options.proneHeight    The height of the enemy while prone.
   * @param  {Object}  options.explosion      The enemy explosion properties.
   * @param  {String}  options.type           The type of enemy.
   */
  constructor({
    stateDurations,
    maxAttacks,
    float,
    primaryAttack,
    proneHeight,
    explosion,
    type,
    ...other
  }) {
    super(other);

    if (this.constructor === AbstractEnemy) {
      throw new TypeError('Can not construct abstract class.');
    }

    const {
      attack: attackTime = 1000,
      hurt: hurtTime = 1000,
      alert: alertTime = 1000,
      aim: aimTime = 200,
    } = stateDurations;

    this.type = type;
    this.attackTime = attackTime;
    this.hurtTime = hurtTime;
    this.alertTime = alertTime;
    this.aimTime = aimTime;
    this.maxAttacks = maxAttacks;
    this.numberOfAttacks = maxAttacks;
    this.attackTimer = 0;
    this.hurtTimer = 0;
    this.alertTimer = 0;
    this.aimTimer = 0;
    this.isEnemy = true;
    this.float = float;
    this.floatDirection = 1;
    this.floatAmount = 0;
    this.proneHeight = proneHeight;
    this.nearbyTimer = 0;
    this.graphIndex = 0;

    this.primaryAttack = {
      ...primaryAttack,
      range: primaryAttack.range * CELL_SIZE,
    };

    if (explosion) {
      this.explosion = new Explosion({ source: this, ...explosion });
    }

    this.path = [];

    this.addTrackedCollision({
      type: AbstractEnemy,
      onStart: (enemy) => {
        // TODO: handle chasing and evading.
        if (enemy.isIdle() && this.isChasing()) {
          this.setRetreating();
        }
      },
    });

    this.addTrackedCollision({
      type: TransparentCell,
      onStart: () => {
        if (this.projectiles) {
          if (this.findPlayer()) {
            this.setRange(this.primaryAttack.range * 2);
          } else {
            this.setIdle();
          }
        }
      },
    });

    this.setIdle();
  }

  /**
   * Update the enemy.
   * @param  {Number} delta      The delta time.
   * @param  {Number} elapsedMS  The elapsed time.
   */
  update(delta, elapsedMS) {
    super.update(delta, elapsedMS);

    if (this.distanceToPlayer < UPDATE_DISTANCE) {
      if (this.float) {
        this.floatAmount += FLOAT_INCREMENT * this.floatDirection * delta;

        if (Math.abs(this.floatAmount) >= FLOAT_BOUNDARY) {
          this.floatDirection *= -1;
        }
      }

      switch (this.state) {
        case STATES.IDLE:
          this.updateIdle(delta, elapsedMS);
          break;
        case STATES.ALERTED:
          this.updateAlerted(delta, elapsedMS);
          break;
        case STATES.EVADING:
          this.updateEvading(delta, elapsedMS);
          break;
        case STATES.CHASING:
          this.updateChasing(delta, elapsedMS);
          break;
        case STATES.RETREATING:
          this.updateRetreating(delta, elapsedMS);
          break;
        case STATES.AIMING:
          this.updateAiming(delta, elapsedMS);
          break;
        case STATES.ATTACKING:
          this.updateAttacking(delta, elapsedMS);
          break;
        case STATES.HURTING:
          this.updateHurting(delta, elapsedMS);
          break;
        case STATES.DEAD:
          this.updateDead(delta, elapsedMS);
          break;
        default:
          break;
      }
    }
  }

  /**
   * Update enemy in idle state
   * @param  {Number} delta      The delta time.
   * @param  {Number} elapsedMS  The elapsed time.
   */
  updateIdle(delta, elapsedMS) {
    if (this.findPlayer()) {
      this.setAlerted();
    } else {
      this.nearbyTimer += elapsedMS;

      if (this.nearbyTimer > GROWL_INTERVAL) {
        this.nearbyTimer = 0;
      }

      if (this.nearbyTimer === 0 && this.distanceToPlayer < NEARBY) {
        this.emitSound(this.sounds.nearby);
      }
    }
  }

  /**
   * Update enemy in the alerted state.
   * @param  {Number} delta      The delta time.
   * @param  {Number} elapsedMS  The elapsed time.
   */
  updateAlerted(delta, elapsedMS) {
    this.alertTimer += elapsedMS;

    if (this.alertTimer >= this.alertTime) {
      if (this.distanceToPlayer <= this.primaryAttack.range && this.findPlayer()) {
        this.setAiming();
      } else {
        this.setChasing();
      }
    }
  }

  /**
   * Update enemy in chasing state
   */
  updateChasing() {
    const nextCell = this.path[this.pathIndex];

    if (this.distanceToPlayer <= this.primaryAttack.range && this.findPlayer()) {
      this.setAiming();
    } else if (nextCell) {
      this.face(nextCell);

      if (nextCell.isDoor) {
        nextCell.use(this);
      }

      if (this.isArrivedAt(nextCell)) {
        this.pathIndex += 1;
      }

      if (this.pathIndex === MAX_PATH_INDEX) {
        this.path = this.findPath(this.parent.player);
        this.pathIndex = 0;
      }
    } else {
      this.path = this.findPath(this.parent.player);

      if (this.path.length === 0) {
        this.setIdle();
      }
    }
  }

  /**
   * Update enemy in chasing state
   */
  updateRetreating() {
    const nextCell = this.path[this.pathIndex];

    if (this.distanceToPlayer <= this.primaryAttack.range && this.findPlayer()) {
      this.setAiming();
    } else if (nextCell) {
      this.face(nextCell);

      if (nextCell.isDoor) {
        nextCell.use(this);
      }

      if (this.isArrivedAt(nextCell)) {
        this.pathIndex += 1;
      }

      if (this.pathIndex === MAX_PATH_INDEX) {
        this.path = this.findPath(this.startCell);
        this.pathIndex = 0;
      }
    } else {
      this.path = this.findPath(this.startCell);

      if (this.path.length === 0) {
        this.setIdle();
      }
    }
  }

  /**
   * Update the enemy in the evading state.
   */
  updateEvading() {
    if (
      this.evadeDestination.bodies.some(b => b.id !== this.id && b.blocking)
        || this.cell.bodies.some(b => b.id !== this.id && b.blocking)
    ) {
      this.evadeDestination = this.findEvadeDestination();
    }

    if (this.isArrivedAt(this.evadeDestination)) {
      this.setChasing();
    } else {
      this.face(this.evadeDestination);
    }
  }

  /**
   * Update enemy in aiming state
   * @param  {Number} delta      The delta time.
   * @param  {Number} elapsedMS  The elapsed time.
   */
  updateAiming(delta, elapsedMS) {
    if (this.findPlayer()) {
      if (this.distanceToPlayer <= this.primaryAttack.range) {
        this.aimTimer += elapsedMS;

        if (this.aimTimer >= this.aimTime) {
          this.setAttacking();
        }
      } else {
        this.setChasing();
      }
    } else {
      this.setChasing();
    }
  }

  /**
   * Update enemy in attacking state
   * @param  {Number} delta      The delta time.
   * @param  {Number} elapsedMS  The elapsed time.
   */
  updateAttacking(delta, elapsedMS) {
    if (this.findPlayer()) {
      if (this.distanceToPlayer <= this.primaryAttack.range) {
        this.attackTimer += elapsedMS;

        if (this.attackTimer >= this.attackTime) {
          if (this.numberOfAttacks < 1) {
            this.numberOfAttacks = this.maxAttacks;
            this.setEvading();
          } else {
            this.onAttackComplete();
          }
        }
      } else {
        this.setChasing();
      }
    } else {
      this.setChasing();
    }
  }

  /**
   * Update enemy in hurt state
   * @param  {Number} delta      The delta time.
   * @param  {Number} elapsedMS  The elapsed time.
   */
  updateHurting(delta, elapsedMS) {
    this.hurtTimer += elapsedMS;

    if (this.hurtTimer >= this.hurtTime) {
      this.onHurtComplete();
    }
  }

  /**
   * Update enemy in hurt state
   * @param  {Number} delta      The delta time.
   * @param  {Number} elapsedMS  The elapsed time.
   */
  updateDead(delta, elapsedMS) {
    this.velocity *= FORCE_FADE;
    this.z = 0;
    this.floatAmount = 0;

    if (this.velocity <= MIN_FORCE) {
      this.velocity = 0;
    }

    if (this.parent.floorOffset) {
      if (this.velocity === 0) {
        this.stopUpdates();
      }
    } else {
      this.stainTimer += elapsedMS;

      if (this.stainTimer > STAIN_INTERVAL) {
        this.stainTimer = 0;

        if (this.stainRadius <= MAX_STAIN_RADIUS) {
          this.stain(this.stainRadius);
          this.stainRadius += 1.5;
        }
      }

      if (this.velocity === 0) {
        this.stain(MAX_STAIN_RADIUS);
        this.stopUpdates();
        this.stainTimer = STAIN_INTERVAL;
        this.stainRadius = 2;
      }
    }
  }

  /**
   * Attack a target.
   */
  attack() {
    if (this.constructor === AbstractEnemy) {
      throw new TypeError('You have to implement this method.');
    }
  }

  /**
   * Execute completed attack behavior.
   */
  onAttackComplete() {
    if (this.constructor === AbstractEnemy) {
      throw new TypeError('You have to implement this method.');
    }
  }

  /**
   * Execute recovery behaviour.
   */
  onHurtComplete() {
    if (this.constructor === AbstractEnemy) {
      throw new TypeError('You have to implement this method.');
    }
  }

  /**
   * Try and locate the player
   * @return {Cell} The cell the player was located at.
   */
  findPlayer() {
    const { player } = this.parent;

    this.face(player);

    const { distance, encounteredBodies } = this.castRay();

    if (
      encounteredBodies[player.id]
        && player.isAlive()
        && distance > this.distanceToPlayer
    ) {
      return player;
    }

    return null;
  }

  /**
   * Hurt the enemy
   * @param  {Number} damage The damage to health.
   * @param  {Number} angle  The angle the damage came from.
   */
  hurt(damage, angle = 0) {
    super.hurt(damage, angle);

    if (this.isAlive()) {
      this.health -= damage;

      if (this.health > 0) {
        this.setHurting();
      } else {
        this.angle = angle;
        this.velocity = Math.sqrt(damage);
        this.setDead();
      }
    } else {
      this.angle = angle;
      this.velocity = Math.sqrt(damage) * DEAD_VELOCITY_MULTIPLIER;
    }
  }

  /**
   * Find a free cell to move to.
   * @return {Cell} The cell to move to.
   */
  findEvadeDestination() {
    const { player } = this.parent;
    // Randomly pick an right angle to the left or right and
    // get x and y grid coordinates, to priorities lateral evasion.
    // Otherwise go to the nearest cell to the player.
    return (Math.round(Math.random()) ? [DEG_90, -DEG_90] : [-DEG_90, DEG_90])
      .reduce((memo, angleOffset) => {
        const angle = (this.getAngleTo(player) + angleOffset + DEG_360) % DEG_360;
        const x = Math.floor((this.x + Math.cos(angle) * CELL_SIZE) / CELL_SIZE);
        const y = Math.floor((this.y + Math.sin(angle) * CELL_SIZE) / CELL_SIZE);
        const cell = this.parent.getCell(x, y);

        if (cell.blocking || cell.bodies.some(b => b.id !== this.id && b.blocking)) {
          return memo;
        }

        return [...memo, cell];
      }, []).pop() || this.parent.getNeighbourCells(this)
      .reduce((memo, cell) => {
        if (cell.blocking || cell.bodies.some(b => b.id !== this.id && b.blocking)) {
          return memo;
        }

        if (!memo) {
          return cell;
        }

        if (player.getDistanceTo(cell) < player.getDistanceTo(memo)) {
          return cell;
        }

        return memo;
      }, null);
  }

  /**
   * Add a callback to the idle state change.
   * @param  {Function} callback The callback function.
   */
  onIdle(callback) {
    this.on(STATES.IDLE, callback);
  }

  /**
   * Add a callback to the alerted state change.
   * @param  {Function} callback The callback function.
   */
  onAlerted(callback) {
    this.on(STATES.ALERTED, callback);
  }

  /**
   * Add a callback to the evading state change.
   * @param  {Function} callback The callback function.
   */
  onEvading(callback) {
    this.on(STATES.EVADING, callback);
  }

  /**
   * Add a callback to the chasing state change.
   * @param  {Function} callback The callback function.
   */
  onChasing(callback) {
    this.on(STATES.CHASING, callback);
  }

  /**
   * Add a callback to the retreating change.
   * @param  {Function} callback The callback function.
   */
  onRetreating(callback) {
    this.on(STATES.RETREATING, callback);
  }

  /**
   * Add a callback to the aiming state change.
   * @param  {Function} callback The callback function.
   */
  onAiming(callback) {
    this.on(STATES.AIMING, callback);
  }

  /**
   * Add a callback to the attacking state change.
   * @param  {Function} callback The callback function.
   */
  onAttacking(callback) {
    this.on(STATES.ATTACKING, callback);
  }

  /**
   * Add a callback to the hurting state change.
   * @param  {Function} callback The callback function.
   */
  onHurting(callback) {
    this.on(STATES.HURTING, callback);
  }

  /**
   * Add a callback to the dead state change.
   * @param  {Function} callback The callback function.
   */
  onDead(callback) {
    this.on(STATES.DEAD, callback);
  }

  /**
   * Set the enemy state.
   * @return {Boolean}  State change successful.
   */
  setIdle() {
    const isStateChanged = this.setState(STATES.IDLE);

    if (isStateChanged) {
      this.velocity = 0;
    }

    return isStateChanged;
  }

  /**
   * Set the enemy to the alerted state.
   * @return {Boolean}  State change successful.
   */
  setAlerted() {
    const isStateChanged = this.setState(STATES.ALERTED);

    if (isStateChanged) {
      this.emitSound(this.sounds.alert);
    }
  }

  /**
   * Set the enemy to the evading state.
   * @return {Boolean}  State change successful.
   */
  setEvading() {
    const isStateChanged = this.setState(STATES.EVADING);

    if (isStateChanged) {
      this.evadeDestination = this.findEvadeDestination();

      if (!this.evadeDestination) {
        this.setChasing();
      }

      this.velocity = this.speed;
    }

    return isStateChanged;
  }

  /**
   * Set the enemy to the moving state.
   * @return {Boolean}  State change successful.
   */
  setChasing() {
    const isStateChanged = this.setState(STATES.CHASING);

    if (isStateChanged) {
      this.velocity = this.speed;
    }

    return isStateChanged;
  }

  setRetreating() {
    const isStateChanged = this.setState(STATES.RETREATING);

    if (isStateChanged) {
      this.velocity = this.speed;
    }

    return isStateChanged;
  }

  /**
   * Find the path to a target.
   * @param  {Body}   target The target to find a path to.
   * @return {Array}         The path to the target.
   */
  findPath(target) {
    return this.parent.findPath(this, target, this.graphIndex);
  }

  /**
   * Set the attack range.
   * @param {Number} range The range to set.
   */
  setRange(range) {
    this.primaryAttack.range = range;
  }

  /**
   * Set the enemy to the aiming state.
   * @return {Boolean}  State change successful.
   */
  setAiming() {
    const isStateChanged = this.setState(STATES.AIMING);

    if (isStateChanged) {
      this.velocity = 0;
    }

    return isStateChanged;
  }

  /**
   * Set the enemy to the attacking state.
   * @return {Boolean}  State change successful.
   */
  setAttacking() {
    const isStateChanged = this.setState(STATES.ATTACKING);

    if (isStateChanged) {
      this.attack();
      this.numberOfAttacks -= 1;
      this.velocity = 0;
    }

    return isStateChanged;
  }

  /**
   * Set the enemy to the hurting state.
   * @return {Boolean}  State change successful.
   */
  setHurting() {
    const isStateChanged = this.setState(STATES.HURTING);

    if (isStateChanged) {
      this.velocity = 0;

      if (!this.isPlaying(this.sounds.pain)) {
        this.emitSound(this.sounds.pain);
      }
    }

    return isStateChanged;
  }

  /**
   * Set the enemy to the dead state.
   * @return {Boolean}  State change successful.
   */
  setDead() {
    const isStateChanged = this.setState(STATES.DEAD);

    if (isStateChanged) {
      this.blocking = false;
      this.stainTimer = 0;
      this.stainRadius = 1;

      if (this.explosion) {
        this.explosion.run();
      } else {
        this.isProne = true;
      }

      if (this.sounds.death) {
        this.emitSound(this.sounds.death);
      }
    }

    return isStateChanged;
  }

  /**
   * Is the enemy in the idle state.
   * @return {Boolean}
   */
  isIdle() {
    return this.state === STATES.IDLE;
  }

  /**
   * Is the enemy in the alerted state.
   * @return {Boolean}
   */
  isAlerted() {
    return this.state === STATES.ALERTED;
  }

  /**
   * Is the enemy in the evading state.
   * @return {Boolean} [description]
   */
  isEvading() {
    return this.state === STATES.EVADING;
  }

  /**
   * Is the enemy in the chasing state.
   * @return {Boolean}
   */
  isChasing() {
    return this.state === STATES.CHASING;
  }

  /**
   * Is the enemy in the retreating state.
   * @return {Boolean}
   */
  isRetreating() {
    return this.state === STATES.RETREATING;
  }

  /**
   * Is the enemy in the aiming state.
   * @return {Boolean}
   */
  isAiming() {
    return this.state === STATES.AIMING;
  }

  /**
   * Is the enemy in the attacking state.
   * @return {Boolean}
   */
  isAttacking() {
    return this.state === STATES.ATTACKING;
  }

  /**
   * Is the enemy in the hurt state.
   * @return {Boolean}
   */
  isHurting() {
    return this.state === STATES.HURTING;
  }

  /**
   * Is the enemy in the dead state.
   * @return {Boolean}
   */
  isDead() {
    return this.state === STATES.DEAD;
  }

  /**
   * Is the enemy alive.
   * @return {Boolean}
   */
  isAlive() {
    return this.state !== STATES.DEAD;
  }

  /**
   * Get the generated damage of an attack.
   * @return {Number} The amount of damage.
   */
  attackDamage() {
    const { power, accuracy } = this.primaryAttack;

    return power * (Math.floor(Math.random() * accuracy) + 1);
  }

  /**
   * Set the state.
   * @param  {String} state The new state.
   * @return {Boolean}      State change succesful.
   */
  setState(state) {
    const isStateChanged = this.isAlive() && super.setState(state);

    if (isStateChanged) {
      this.path = [];
      this.pathIndex = 0;
      this.attackTimer = 0;
      this.hurtTimer = 0;
      this.alertTimer = 0;
      this.aimTimer = 0;
      this.emit(state);
    }

    return isStateChanged;
  }

  /**
   * The elavation.
   * @member {Number}
   */
  get elavation() {
    return this.z + this.floatAmount;
  }
}

export default AbstractEnemy;
