import translate from 'root/translate';
import { degrees } from 'game/core/physics';
import { CELL_SIZE, TIME_STEP } from 'game/constants/config';
import AbstractActor from '../AbstractActor';
import Weapon from './components/Weapon';
import Camera from './components/Camera';
import Message from './components/Message';
import KeyCard from './components/KeyCard';
import Bullet from '../Bullet';
import Explosion from '../../effects/Explosion';

const DEG_360 = degrees(360);
const DEG_270 = degrees(270);
const DEG_180 = degrees(180);
const DEG_90 = degrees(90);
const DEATH_INTERVAL = 1500;
const SPATTER_DISTANCE = CELL_SIZE * 1.5;
const DYING_HEIGHT_FADE = 0.2;
const DYING_PITCH_INCREMENT = 10;
const HURT_VISION_AMOUNT = 0.6;
const VISION_INCREMENT = 0.02;
const HURT_RECOIL_MULTIPLIER = 1;

const STATES = {
  ALIVE: 'player:alive',
  DYING: 'player:dying',
  DEAD: 'player:dead',
};

const EVENTS = {
  HURT: 'player:hurt',
  FIRE_WEAPON: 'player:fire:weapon',
  DEATH: 'player:death',
  DYING: 'player:dying',
  CHANGE_WEAPON: 'player:change:weapon',
  MESSAGES_UPDATED: 'player:update:messages',
  PICK_UP: 'player:pick:up',
};

/**
 * Creates a player.
 * @extends {AbstractActor}
 */
class Player extends AbstractActor {
  /**
   * Creates a player.
   * @param  {Number} options.x                     The x coordinate of the player.
   * @param  {Number} options.y                     The y coordinate of the player
   * @param  {Number} options.width                 The width of the player.
   * @param  {Number} options.height                The height of the player.
   * @param  {Number} options.angle                 The angle of the player.
   * @param  {Number} options.maxHealth             The maximum health of the player.
   * @param  {Number}  options.health               The current health of the player.
   * @param  {Number} options.speed                 The maximum speed of the player.
   * @param  {Number} options.rotateSpeed         The maximum rotation speed of the player.
   * @param  {Number} options.acceleration          The acceleration of the player.
   * @param  {Number} options.rotateAcceleration  The rotation acceleration of the player.
   * @param  {Array}  options.weapons               The player weapons data.
   * @param  {Camera} options.camera                The player camera.
   */
  constructor(options = {}) {
    const {
      rotateSpeed = 1,
      rotateAcceleration = 0,
      weapons = {},
      weaponIndex = 0,
      ...other
    } = options;

    super(other);

    this.rotateSpeed = rotateSpeed;
    this.rotateAcceleration = rotateAcceleration;
    this.maxHeight = this.height;
    this.maxSpeed = this.speed;
    this.weaponIndex = weaponIndex;
    this.crouchHeight = this.height * 0.6;
    this.deadHeight = this.height * 0.45;
    this.heightVelocity = CELL_SIZE / 32;

    this.actions = {};
    this.messages = [];
    this.vision = 1;
    this.rotateAngle = 0;
    this.timer = 0;
    this.moveAngle = 0;
    this.isPlayer = true;

    this.camera = new Camera(this);
    this.weapons = weapons.map(data => new Weapon({ player: this, ...data }));
    this.weapon = this.weapons[this.weaponIndex];
    this.bullets = weapons.reduce((memo, data) => ({
      ...memo,
      [data.type]: [...Array(10).keys()].map(() => new Bullet({
        explosionType: data.explosionType,
      })),
    }), {});

    this.sounds = this.weapons.reduce((memo, weapon) => ({
      ...memo,
      [weapon.type]: weapon.sounds.fire,
    }), this.sounds);

    this.viewHeight = this.height + this.camera.height;
    this.viewAngle = (this.angle + this.camera.angle + DEG_360) % DEG_360;
    this.viewPitch = this.camera.pitch;
    this.distanceToPlayer = 0;

    this.setAlive();
  }

  /**
   * Add a callback for the message updated event.
   * @param  {Function} callback The callback function.
   */
  onMessagesUpdated(callback) {
    this.on(EVENTS.MESSAGES_UPDATED, callback);
  }

  /**
   * Add a callback for the fire weapon event.
   * @param  {Function} callback The callback function.
   */
  onFireWeapon(callback) {
    this.on(EVENTS.FIRE_WEAPON, callback);
  }

  /**
   * Add a callback for the pick up event.
   * @param  {Function} callback The callback function.
   */
  onPickUp(callback) {
    this.on(EVENTS.PICK_UP, callback);
  }

  /**
   * Add a callback for the hurt event.
   * @param  {Function} callback The callback function.
   */
  onHurt(callback) {
    this.on(EVENTS.HURT, callback);
  }

  /**
   * Add a callback for the player dying event.
   * @param  {Function} callback The callback function.
   */
  onDying(callback) {
    this.on(EVENTS.DYING, callback);
  }

  /**
   * Add a callback for the player death event.
   * @param  {Function} callback The callback function.
   */
  onDeath(callback) {
    this.on(EVENTS.DEATH, callback);
  }

  /**
   * Add a callback to the change weapon event.
   * @param  {Function} callback The callback.
   */
  onChangeWeapon(callback) {
    this.on(EVENTS.CHANGE_WEAPON, callback);
  }

  /**
   * Handle the added to world event.
   */
  initialize() {
    super.initialize();

    const { x, y } = this.parent.entrance;

    this.x = (CELL_SIZE * x) + (CELL_SIZE / 2);
    this.y = (CELL_SIZE * y) + (CELL_SIZE / 2);
    this.angle = 0;
    this.velocity = 0;

    this.keyCards = this.parent.items.reduce((memo, { isKey, color }) => {
      if (isKey) {
        return {
          ...memo,
          [color]: new KeyCard(color),
        };
      }
      return memo;
    }, {});

    // Add weapon names to player sound object.
    this.playing = this.weapons.reduce((weaponMemo, weapon) => ({
      ...weaponMemo,
      ...Object.values(weapon.sounds).reduce((soundMemo, sound) => ({
        ...soundMemo,
        [sound]: [],
      }), {}),
    }), this.playing);
  }

  /**
   * Start a world.
   * @param  {String} message The message to display.
   */
  start(message) {
    this.addMessage(message);
    this.emitSound(this.sounds.enter);
    this.actions.use = true;
  }

  /**
   * Update the player.
   * @param  {Number} delta The delta time value.
   */
  update(delta) {
    switch (this.state) {
      case STATES.ALIVE:
        this.updateAlive(delta);
        break;
      case STATES.DYING:
        this.updateDying(delta);
        break;
      case STATES.DEAD:
        this.updateDead(delta);
        break;
      default:
        break;
    }
  }

  /**
   * Update the player in the default state.
   * @param  {Number} delta The delta time value.
   */
  updateAlive(delta) {
    const {
      moveBackward,
      moveForward,
      strafeLeft,
      strafeRight,
      turnLeft,
      turnRight,
      rotate,
      crouch,
      selectWeapon,
      attack,
      stopAttack,
      use,
    } = this.actions;

    const previousMoveAngle = this.moveAngle;

    let moveX = 0;
    let moveY = 0;

    // Update speed.
    this.speed = this.maxSpeed * this.height / this.maxHeight;

    // Update rotation.
    if (rotate) {
      if (rotate < 0) {
        this.rotateAngle = Math.max(rotate, -this.rotateSpeed);
      } else if (rotate > 0) {
        this.rotateAngle = Math.min(rotate, this.rotateSpeed);
      }
    } else if (turnLeft) {
      this.rotateAngle = Math.max(
        this.rotateAngle - this.rotateAcceleration,
        this.rotateSpeed / 3 * -1,
      );
    } else if (turnRight) {
      this.rotateAngle = Math.min(
        this.rotateAngle + this.rotateAcceleration,
        this.rotateSpeed / 3,
      );
    } else {
      this.rotateAngle = 0;
    }

    // Update movement.
    this.angle = (this.angle + (this.rotateAngle * delta) + DEG_360) % DEG_360;

    if (moveForward || moveBackward || strafeLeft || strafeRight) {
      this.velocity = Math.min(this.velocity + this.acceleration, this.speed);

      if (moveForward) {
        moveX += 1;
      } else if (moveBackward) {
        moveX -= 1;
      }

      if (strafeRight) {
        moveY += 1;
      } else if (strafeLeft) {
        moveY -= 1;
      }
    } else {
      this.velocity = 0;
    }

    this.moveAngle = -Math.atan2(-moveY, moveX);

    if (this.moveAngle !== previousMoveAngle) {
      this.angle = (this.angle - previousMoveAngle + this.moveAngle + DEG_360) % DEG_360;
    }

    // Update height.
    if (crouch) {
      this.height = Math.max(
        this.height - (this.heightVelocity * delta),
        this.crouchHeight,
      );
    } else {
      this.height = Math.min(
        this.height + (this.heightVelocity * delta),
        this.maxHeight,
      );
    }

    // Update vision
    if (this.vision < 1) {
      this.vision += VISION_INCREMENT * delta;

      if (this.vision > 1) {
        this.vision = 1;
      }
    }

    // Update camera.
    this.camera.update(delta);

    // Update weapon.
    if (selectWeapon || selectWeapon === 0) {
      this.selectWeapon(selectWeapon);
    }

    if (attack && this.weapon.fire()) {
      this.attack();
    }

    if (stopAttack) {
      this.weapon.stop();
    }

    this.weapon.update(delta);

    // Update interactions
    this.parent.getAdjacentBodies(this).forEach((body) => {
      // Update item interactions
      if (body.isItem) {
        if (this.isBodyCollision(body)) {
          if (body.setColliding()) {
            if (this.pickUp(body)) {
              this.emit(EVENTS.PICK_UP, body);
              body.setRemoved();
            } else {
              this.addMessage(translate('world.player.cannot.pickup', {
                item: body.title,
              }));
            }
          }
        } else {
          body.setIdle();
        }
      } else if (body.isDoor) {
        // Update door interactions.
        if (use) {
          this.emitSound(this.sounds.use);
          if (body.keyCard) {
            const keyCard = this.keyCards[body.keyCard];

            if (keyCard && keyCard.isEquiped()) {
              if (body.open()) {
                keyCard.use();
              }
            } else {
              this.addMessage(translate('world.door.locked', {
                color: translate(`world.color.${body.keyCard}`),
              }));
            }
          } else {
            body.open();
          }
        }
      }
    });

    // Update view
    this.viewHeight = this.height + this.camera.height;
    this.viewAngle = (this.angle + this.camera.angle + DEG_360) % DEG_360;
    this.viewPitch = this.camera.pitch;

    // Update actions.
    this.actions.use = false;
    this.actions.selectWeapon = null;
    this.actions.rotate = 0;
    this.actions.stopAttack = false;

    // Update messages
    this.messages.forEach(message => message.update(delta));

    // Update parent
    super.update(delta);
  }

  /**
   * Update the player in the dead state.
   * @param  {Number} delta The delta time value.
   */
  updateDying(delta) {
    // Update camera
    const { pitch, maxPitch } = this.camera;

    this.camera.pitch = Math.min(pitch + (DYING_PITCH_INCREMENT * delta), maxPitch);

    // Update height
    this.height -= this.heightVelocity * DYING_HEIGHT_FADE * delta;

    if (this.height <= this.deadHeight) {
      this.height = this.deadHeight;
      this.setDead();
    }

    // Update vision
    if (this.vision < 1) {
      this.vision += VISION_INCREMENT * delta;

      if (this.vision > 1) {
        this.vision = 1;
      }
    }

    // Update view
    this.viewHeight = this.height + this.camera.height;
    this.viewAngle = (this.angle + this.camera.angle + DEG_360) % DEG_360;
    this.viewPitch = this.camera.pitch;

    // Update weapon
    this.weapon.update(delta);
  }

  /**
   * Update the player in the dead state.
   * @param  {Number} delta The delta time.
   */
  updateDead(delta) {
    this.timer += delta * TIME_STEP;

    if (this.timer >= DEATH_INTERVAL) {
      this.timer = 0;
      this.emit(EVENTS.DEATH);
    }
  }

  /**
   * Add a player message.
   * @param {String} text The text of the message.
   */
  addMessage(text) {
    const message = new Message(text);

    message.onExpired(() => {
      this.messages = this.messages.filter(m => m !== message);
      this.emit(EVENTS.MESSAGES_UPDATED, this.messages);
    });

    this.messages.unshift(message);

    this.emit(EVENTS.MESSAGES_UPDATED, this.messages);
  }

  /**
   * Select the next weapon to use.
   * @param  {String} type The type of weapon to use.
   */
  selectWeapon(index) {
    const weapon = this.weapons[index];

    if (weapon && weapon.isEquiped() && this.weaponIndex !== index) {
      this.weaponIndex = index;
      this.weapon = weapon;
      this.emitSound(this.sounds.weapon);
      this.emit(EVENTS.CHANGE_WEAPON);
    }
  }

  /**
   * Use the current weapon.
   */
  attack() {
    const {
      power,
      recoil,
      accuracy,
      spread,
      spreadAngle,
      pelletAngle,
    } = this.weapon;

    let rayAngle = (this.viewAngle - spreadAngle + DEG_360) % DEG_360;

    // Keep a list of accumulated damage to enemies.
    const enemyDamage = {};

    for (let i = 0; i < spread.length; i += 1) {
      const {
        startPoint,
        endPoint,
        distance,
        side,
        encounteredBodies,
      } = this.castRay(rayAngle);

      // Get sorted collisions
      const collisions = Object.values(encounteredBodies).reduce((memo, body) => {
        if (body.blocking) {
          const point = body.getRayCollision({ startPoint, endPoint });

          if (point) {
            memo.push({ body, point });
          }

          return memo;
        }
        return memo;
      }, []).sort((a, b) => {
        if (a.point.distance > b.point.distance) {
          return 1;
        }

        if (a.point.distance < b.point.distance) {
          return -1;
        }

        return 0;
      });

      const bullet = this.bullets[this.weapon.type].shift();
      const angle = (this.viewAngle + DEG_180) % DEG_360;

      if (collisions.length) {
        // Handle collsion with body
        // TODO: Handle more than nearest collsion
        const { point, body } = collisions[0];

        this.parent.addExplosion(new Explosion({
          x: point.x + Math.cos(angle) * (bullet.width / 2),
          y: point.y + Math.cos(angle) * (bullet.width / 2),
          sourceId: body.spurtType ? `${body.id}_${body.spurtType}` : bullet.id,
          parent: this.parent,
        }));

        if (body.isEnemy) {
          const damage = power * (Math.floor(Math.random() * accuracy) + 1);

          if (!enemyDamage[body.id]) {
            enemyDamage[body.id] = damage;
          } else {
            enemyDamage[body.id] += damage;
          }

          if (distance - body.distanceToPlayer < SPATTER_DISTANCE) {
            if (!side.spatter) {
              side.spatter = body.spatter();
            }
          }
        }
      } else {
        // Handle collision with wall
        this.parent.addExplosion(new Explosion({
          x: endPoint.x + Math.cos(angle) * (bullet.width / 2),
          y: endPoint.y + Math.sin(angle) * (bullet.width / 2),
          sourceId: bullet.id,
          parent: this.parent,
        }));
      }

      this.bullets[this.weapon.type].push(bullet);

      rayAngle = (rayAngle + pelletAngle) % DEG_360;
    }

    // Apply accumulated damage to enemy.
    Object.keys(enemyDamage).forEach((id) => {
      this.parent.bodies[id].hurt(enemyDamage[id]);
    });

    this.camera.setRecoil(recoil);
    this.parent.onExplosion(power);
    this.emitSound(this.weapon.sounds.fire);
    this.emit(EVENTS.FIRE_WEAPON);
  }

  /**
   * Hurt the player.
   * @param  {Number} amount The amount to hurt the player.
   */
  hurt(amount) {
    this.vision = HURT_VISION_AMOUNT;
    this.health -= amount;

    this.emit(EVENTS.HURT);

    if (this.health <= 0) {
      this.health = 0;
      this.setDying();
      this.emitSound(this.sounds.death);
    } else {
      this.recoil(amount * HURT_RECOIL_MULTIPLIER, { direction: -1 });

      if (!this.isPlaying(this.sounds.pain)) {
        this.emitSound(this.sounds.pain);
      }
    }
  }

  /**
   * Pick up an item.
   * @param  {Item} item The item to pick up.
   */
  pickUp(item) {
    if (item.isAmmo) {
      return this.pickUpAmmo(item);
    }

    if (item.isHealth) {
      return this.pickUpHealth(item);
    }

    if (item.isKey) {
      return this.pickUpKey(item);
    }

    if (item.isWeapon) {
      return this.pickUpWeapon(item);
    }

    return false;
  }

  /**
   * Pick up a weapon
   * @param  {Weapon} type  The weapon.
   */
  pickUpWeapon({ weapon }) {
    const index = this.weapons.map(({ type }) => type).indexOf(weapon);
    const pickedUpWeapon = this.weapons[index];

    if (!pickedUpWeapon.isEquiped()) {
      pickedUpWeapon.setEquiped();
      this.selectWeapon(index);

      return true;
    }

    return this.pickUpAmmo({
      weapon,
      amount: Math.round(pickedUpWeapon.maxAmmo / 2),
    });
  }

  /**
   * Pick up ammo.
   * @param  {Ammo} amount The amount of ammo.
   */
  pickUpAmmo({ weapon, amount }) {
    const index = this.weapons.map(({ type }) => type).indexOf(weapon);
    const weaponToRefill = this.weapons[index];

    if (weaponToRefill.isEquiped()) {
      this.emitSound(this.sounds.weapon);
      return weaponToRefill.addAmmo(amount);
    }

    return false;
  }

  /**
   * Pick up health.
   * @param  {Number} amount The amount of health.
   */
  pickUpHealth(health) {
    if (this.health < this.maxHealth) {
      this.health += health.amount;

      if (this.health > this.maxHealth) {
        this.health = this.maxHealth;
      }

      this.emitSound(this.sounds.item);

      return true;
    }

    return false;
  }

  /**
   * Pick up key.
   * @param  {String} type The type of key.
   */
  pickUpKey(key) {
    this.emitSound(this.sounds.item);
    this.keyCards[key.color].equip();

    return true;
  }

  /**
   * Check if the player is facing a body.
   * @param  {Body} dynamicBody The dynamic body.
   * @param  {Body} body        The body.
   * @return {Boolean}          The result of the check.
   */
  isFacing(body) {
    const angle = (this.getAngleTo(body) - this.viewAngle + DEG_360) % DEG_360;
    return angle > DEG_270 || angle < DEG_90;
  }

  /**
   * Shake the player.
   * @param  {Number} amount The amount to shake.
   */
  shake(amount) {
    this.camera.setShake(amount);
  }

  /**
   * Recoil the player.
   * @param  {Number} amount  The amount to recoil.
   * @param  {Object} options The recoil options.
   */
  recoil(amount, options) {
    this.camera.setRecoil(amount, options);
  }

  /**
   * Set the player to the alive state.
   * @return {Boolean}
   */
  setAlive() {
    return this.setState(STATES.ALIVE);
  }

  /**
   * Is the player in the alive state.
   * @return {Boolean}
   */
  isAlive() {
    return this.state === STATES.ALIVE;
  }

  /**
   * Set the player to the dying state.
   * @return {Boolean}
   */
  setDying() {
    const isStateChanged = this.setState(STATES.DYING);

    if (isStateChanged) {
      this.emit(EVENTS.DYING);
    }

    return isStateChanged;
  }

  /**
   * Is the player in the dying state.
   * @return {Boolean}
   */
  isDying() {
    return this.state === STATES.DYING;
  }

  /**
   * Set the player to the dead state.
   * @return {Boolean}
   */
  setDead() {
    return this.setState(STATES.DEAD);
  }

  /**
   * Is the player in the dead state.
   * @return {Boolean} Is the player dead.
   */
  isDead() {
    return this.state === STATES.DEAD;
  }

  /**
   * Get the player props.
   * @return {Object} The player props.
   */
  get props() {
    const { weapons, weaponIndex, health } = this;

    return {
      weapons: weapons.map(weapon => weapon.props),
      weaponIndex,
      health,
    };
  }
}

export default Player;
