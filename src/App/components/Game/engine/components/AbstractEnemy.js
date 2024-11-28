import { degrees, TRANSPARENCY } from '@game/core/physics';
import { CELL_SIZE, UPDATE_DISTANCE } from '@constants/config';
import AbstractActor from './AbstractActor';
import TransparentCell from './TransparentCell';
import Explosion from './Explosion';
import Door from './Door';

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

const MIN_STAIN_RADIUS = 1.5;

const STAIN_INCREMENT = 1.5;

const STAIN_INTERVAL = 50;

const MAX_PATH_INDEX = 2;

const randomizeRange = range => {
  const deviation = Math.floor(Math.random() * 3);
  return Math.max((range - deviation) * CELL_SIZE, CELL_SIZE);
};

export default class AbstractEnemy extends AbstractActor {
  constructor({
    stateDurations,
    maxAttacks,
    float,
    submerged = false,
    primaryAttack,
    proneHeight,
    explosion,
    type,
    painChance,
    isBoss,
    splash,
    ripple,
    spawnItem,
    evadeDistance = 1,
    outside,
    explode,
    alwaysRender,
    add = true,
    spawnEnemy,
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

    this.spawnEnemy = spawnEnemy;
    this.explode = explode;
    this.type = type;
    this.submerged = submerged;
    this.isBoss = isBoss;
    this.painChance = painChance;
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
    this.spawnItem = spawnItem;
    this.outside = outside;
    this.alwaysRender = alwaysRender;
    this.add = add;

    this.evadeDistance = evadeDistance * CELL_SIZE;

    this.primaryAttack = {
      ...primaryAttack,
      range: randomizeRange(primaryAttack.range),
    };

    if (explosion) {
      this.explosion = new Explosion({ source: this, ...explosion });
    }

    if (!float && !explosion) {
      this.splash = splash;
      this.ripple = ripple;
    }

    this.path = [];

    this.addTrackedCollision({
      type: AbstractEnemy,
      onStart: enemy => {
        if (enemy.isIdle() || enemy.isAiming()) {
          if (this.isEvading()) {
            this.setChasing();
          } else if (this.isChasing()) {
            this.setRetreating();
          } else if (this.isRetreating()) {
            this.setIdle();
          }
        }
      },
    });

    this.addTrackedCollision({
      type: TransparentCell,
      onStart: () => {
        if (this.isAlive() && this.projectiles) {
          if (this.findPlayer()) {
            this.setRange(Number.MAX_VALUE);
          } else {
            this.setRetreating();
          }
        }
      },
    });

    this.addTrackedCollision({
      type: Door,
      onStart: body => {
        if (!this.isDead() && !this.isHurting() && body.use) {
          body.use();
        }
      },
    });

    this.setIdle();
  }

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

  updateAlerted(delta, elapsedMS) {
    this.alertTimer += elapsedMS;

    if (this.alertTimer >= this.alertTime) {
      if (
        this.distanceToPlayer <= this.primaryAttack.range &&
        this.findPlayer()
      ) {
        this.setAiming();
      } else {
        this.setChasing();
      }
    }
  }

  updateChasing() {
    const nextCell = this.path[this.pathIndex];

    if (this.canAttack()) {
      this.setAiming();
    } else if (nextCell) {
      this.face(nextCell);

      if (nextCell.transparency === TRANSPARENCY.PARTIAL && this.projectiles) {
        if (this.findPlayer()) {
          this.setRange(Number.MAX_VALUE);
          this.setAttacking();
        } else {
          // TODO: Changed 5855f30ad8885aceea29f71bc43ed03ca9a53684
          this.path = this.findPath(this.parent.player);
          this.setChasing();
        }
      }

      if (this.isArrivedAt(nextCell)) {
        this.pathIndex += 1;

        if (this.pathIndex === MAX_PATH_INDEX) {
          this.path = this.findPath(this.parent.player);
          this.pathIndex = 0;
        }
      }
    } else {
      this.path = this.findPath(this.parent.player);

      if (this.path.length === 0) {
        this.setIdle();
      }
    }
  }

  updateRetreating() {
    const nextCell = this.path[this.pathIndex];

    if (
      this.distanceToPlayer <= this.primaryAttack.range &&
      this.findPlayer()
    ) {
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

  updateEvading() {
    if (
      this.evadeDestination.bodies.some(b => b.id !== this.id && b.blocking) ||
      this.cell.bodies.some(b => b.id !== this.id && b.blocking)
    ) {
      this.evadeDestination = this.findEvadeDestination();
    }

    if (this.speed === 0 || this.isArrivedAt(this.evadeDestination)) {
      this.setChasing();
    } else {
      this.face(this.evadeDestination);
    }
  }

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

  updateAttacking(delta, elapsedMS) {
    if (this.findPlayer()) {
      if (this.distanceToPlayer <= this.primaryAttack.range) {
        this.attackTimer += elapsedMS;

        if (this.attackTimer >= this.attackTime) {
          if (this.numberOfAttacks < 1) {
            this.numberOfAttacks = Math.max(
              this.maxAttacks - Math.round(Math.random()),
              1
            );

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

  updateHurting(delta, elapsedMS) {
    this.hurtTimer += elapsedMS;

    if (this.hurtTimer >= this.hurtTime) {
      this.onHurtComplete();
    }
  }

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
          this.stainRadius += STAIN_INCREMENT;
        }
      }

      if (this.velocity === 0) {
        this.stain(MAX_STAIN_RADIUS);
        this.stopUpdates();
        this.stainTimer = STAIN_INTERVAL;
        this.stainRadius = MIN_STAIN_RADIUS;
      }
    }
  }

  canAttack() {
    if (this.speed === 0) {
      return true;
    }

    const inRange =
      this.distanceToPlayer <= this.primaryAttack.range && this.findPlayer();

    if (this.projectiles) {
      const nextCell = this.path[this.pathIndex];

      if (nextCell) {
        return inRange && this.isArrivedAt(nextCell);
      }

      return inRange;
    }

    return inRange;
  }

  attack() {
    this.parent.addFlashLight(this.primaryAttack.flash);

    if (this.constructor === AbstractEnemy) {
      throw new TypeError('You have to implement this method.');
    }
  }

  onAttackComplete() {
    if (this.constructor === AbstractEnemy) {
      throw new TypeError('You have to implement this method.');
    }
  }

  onHurtComplete() {
    if (this.constructor === AbstractEnemy) {
      throw new TypeError('You have to implement this method.');
    }
  }

  findPlayer() {
    const { player } = this.parent;

    this.face(player);

    const { distance, encounteredBodies } = this.castRay();

    if (
      encounteredBodies[player.id] &&
      player.isAlive() &&
      distance > this.distanceToPlayer
    ) {
      return player;
    }

    return null;
  }

  hurt(damage, angle = 0, instantKill = false) {
    super.hurt(damage, angle);

    if (this.isAlive()) {
      this.health -= damage;

      if (!(!this.isBoss && instantKill) && this.health > 0) {
        if (!this.isPlaying(this.sounds.pain)) {
          this.emitSound(this.sounds.pain);
        }

        if (Math.random() < this.painChance) {
          this.setHurting();
        }
      } else {
        this.angle = angle;
        this.velocity = Math.sqrt(damage);
        this.setDead();

        if ((instantKill || this.isBoss) && this.spawnItem) {
          this.spawnItem.x = this.x;
          this.spawnItem.y = this.y;
          this.spawnItem.velocity = this.isBoss ? 0 : this.velocity * 0.5;
          this.spawnItem.angle =
            this.angle - degrees(30) + degrees(Math.floor(Math.random() * 60));
          this.parent.add(this.spawnItem);
          this.spawnItem.setSpawning();
        }
      }
    } else {
      this.angle = angle;
      this.velocity = Math.sqrt(damage) * DEAD_VELOCITY_MULTIPLIER;
    }
  }

  findEvadeDestination() {
    const { parent } = this;
    const { player } = parent;
    // Randomly pick a right angle to the left or right and
    // get x and y grid coordinates, to priorities lateral evasion.
    // Otherwise go to the nearest cell to the player.
    return (
      (Math.round(Math.random()) ? [DEG_90, -DEG_90] : [-DEG_90, DEG_90])
        .reduce((memo, angleOffset) => {
          const angle =
            (this.getAngleTo(player) + angleOffset + DEG_360) % DEG_360;
          const x = Math.floor(
            (this.x + Math.cos(angle) * this.evadeDistance) / this.evadeDistance
          );
          const y = Math.floor(
            (this.y + Math.sin(angle) * this.evadeDistance) / this.evadeDistance
          );
          const cell = parent.getCell(x, y);

          if (
            this.collisionRadius > 1 &&
            parent.getNeighbourCells(cell).some(c => c.blocking)
          ) {
            return memo;
          }

          if (
            cell.blocking ||
            cell.bodies.some(b => b.id !== this.id && b.blocking)
          ) {
            return memo;
          }

          return [...memo, cell];
        }, [])
        .pop() ||
      parent.getNeighbourCells(this).reduce((memo, cell) => {
        if (
          this.collisionRadius > 1 &&
          parent.getNeighbourCells(cell).some(c => c.blocking)
        ) {
          return memo;
        }

        if (
          cell.blocking ||
          cell.bodies.some(b => b.id !== this.id && b.blocking)
        ) {
          return memo;
        }

        if (!memo) {
          return cell;
        }

        if (player.getDistanceTo(cell) < player.getDistanceTo(memo)) {
          return cell;
        }

        return memo;
      }, null)
    );
  }

  onStartMoving() {
    const { moving } = this.sounds;

    if (moving && !this.isPlaying(moving)) {
      this.emitSound(moving, true);
    }

    this.velocity = this.speed;
  }

  onStopMoving(resetVelocity = true) {
    const { moving } = this.sounds;

    if (moving && this.isPlaying(moving)) {
      this.stopSound(moving);
    }

    if (resetVelocity || this.speed === 0) {
      this.velocity = 0;
    }
  }

  attackDamage() {
    const { power, accuracy } = this.primaryAttack;

    return power * (Math.floor(Math.random() * accuracy) + 1);
  }

  findPath(target) {
    return this.parent.findPath(
      this,
      target,
      this.graphIndex,
      this.parent.getNeighbourCells(this).every(cell => !cell.blocking)
    );
  }

  setRange(range) {
    this.primaryAttack = { ...this.primaryAttack, range };
  }

  onIdle(callback) {
    this.on(STATES.IDLE, callback);
  }

  onAlerted(callback) {
    this.on(STATES.ALERTED, callback);
  }

  onEvading(callback) {
    this.on(STATES.EVADING, callback);
  }

  onChasing(callback) {
    this.on(STATES.CHASING, callback);
  }

  onRetreating(callback) {
    this.on(STATES.RETREATING, callback);
  }

  onAiming(callback) {
    this.on(STATES.AIMING, callback);
  }

  onAttacking(callback) {
    this.on(STATES.ATTACKING, callback);
  }

  onHurting(callback) {
    this.on(STATES.HURTING, callback);
  }

  onDead(callback) {
    this.on(STATES.DEAD, callback);
  }

  setIdle() {
    const isStateChanged = this.setState(STATES.IDLE);

    if (isStateChanged) {
      this.onStopMoving();
    }

    return isStateChanged;
  }

  setAlerted() {
    const isStateChanged = this.setState(STATES.ALERTED);

    if (isStateChanged) {
      this.onStopMoving();
      this.emitSound(this.sounds.alert);
    }
  }

  setEvading() {
    const isStateChanged = this.setState(STATES.EVADING);

    if (isStateChanged) {
      this.onStartMoving();

      this.evadeDestination = this.findEvadeDestination();

      if (!this.evadeDestination) {
        this.setChasing();
      }
    }

    return isStateChanged;
  }

  setChasing() {
    const isStateChanged = this.setState(STATES.CHASING);

    if (isStateChanged) {
      this.onStartMoving();
    }

    return isStateChanged;
  }

  setRetreating() {
    const isStateChanged = this.setState(STATES.RETREATING);

    if (isStateChanged) {
      this.onStartMoving();
    }

    return isStateChanged;
  }

  setAiming() {
    const isStateChanged = this.setState(STATES.AIMING);

    if (isStateChanged) {
      this.onStopMoving();
    }

    return isStateChanged;
  }

  setAttacking() {
    const isStateChanged = this.setState(STATES.ATTACKING);

    if (isStateChanged) {
      this.onStopMoving();
      this.attack();

      this.numberOfAttacks -= 1;
    }

    return isStateChanged;
  }

  setHurting() {
    const isStateChanged = this.setState(STATES.HURTING);

    if (isStateChanged) {
      this.onStopMoving();
    }

    return isStateChanged;
  }

  setDead() {
    const isStateChanged = this.setState(STATES.DEAD);

    if (isStateChanged) {
      this.onStopMoving(false);

      this.blocking = false;
      this.stainTimer = 0;
      this.stainRadius = MIN_STAIN_RADIUS;

      if (this.explosion) {
        this.explosion.run();
      } else {
        this.isProne = true;
      }

      if (this.splash) {
        this.parent.addEffect({
          x: this.x,
          y: this.y,
          z: this.z,
          sourceId: `${this.id}_${this.splash}`,
        });
      }

      if (this.sounds.death) {
        this.emitSound(this.sounds.death);
      }
    }

    return isStateChanged;
  }

  isIdle() {
    return this.state === STATES.IDLE;
  }

  isAlerted() {
    return this.state === STATES.ALERTED;
  }

  isEvading() {
    return this.state === STATES.EVADING;
  }

  isChasing() {
    return this.state === STATES.CHASING;
  }

  isRetreating() {
    return this.state === STATES.RETREATING;
  }

  isAiming() {
    return this.state === STATES.AIMING;
  }

  isAttacking() {
    return this.state === STATES.ATTACKING;
  }

  isHurting() {
    return this.state === STATES.HURTING;
  }

  isDead() {
    return this.state === STATES.DEAD;
  }

  isAlive() {
    return this.state !== STATES.DEAD;
  }

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

  get elavation() {
    return this.z + this.floatAmount;
  }
}
