import translate from 'root/translate';
import { degrees, Vector } from 'game/core/physics';
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

const DEG_45 = degrees(45);

const DEATH_INTERVAL = 1500;

const SPATTER_DISTANCE = CELL_SIZE * 1.5;

const STATES = {
  ALIVE: 'player:alive',
  DYING: 'player:dying',
  DEAD: 'player:dead',
};

const EVENTS = {
  DEATH: 'player:death',
  DYING: 'player:dying',
  CHANGE_WEAPON: 'player:weapon:change',
  MESSAGES_UPDATED: 'player:update:messages',
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
      currentWeaponType,
      ...other
    } = options;

    super(other);

    this.rotateSpeed = rotateSpeed;
    this.rotateAcceleration = rotateAcceleration;
    this.maxHeight = this.height;
    this.maxSpeed = this.speed;

    this.crouchHeight = this.height * 0.6;
    this.deadHeight = this.height * 0.45;
    this.heightVelocity = CELL_SIZE / 32;

    this.currentWeaponType = currentWeaponType || weapons[0].type;
    this.actions = {};
    this.vision = 1;
    this.rotateAngle = 0;
    this.timer = 0;

    this.moveAngle = 0;

    this.camera = new Camera(this);

    this.weapons = weapons.reduce((memo, data) => {
      const weapon = new Weapon({
        player: this,
        ...data,
      });

      return {
        ...memo,
        [data.type]: weapon,
      };
    }, {});

    this.messages = [];

    this.bullets = weapons.reduce((memo, data) => ({
      ...memo,
      [data.type]: [...Array(10).keys()].map(() => new Bullet({
        explosionType: data.explosionType,
      })),
    }), {});

    this.isPlayer = true;

    this.onAdded(() => this.initialize());

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

    this.updateMessages(delta);
    this.updateActions(delta);
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
      use,
    } = this.actions;

    const previousMoveAngle = this.moveAngle;

    let moveX = 0;
    let moveY = 0;

    // Update speed.
    this.speed = this.maxSpeed * this.height / this.maxHeight;

    // Update movement.
    if (rotate) {
      this.rotateAngle = rotate * delta;

      if (this.rotateAngle < 0 && this.rotateAngle < -this.rotateSpeed) {
        this.rotateAngle = -this.rotateSpeed;
      }

      if (this.rotateAngle > 0 && this.rotateAngle > this.rotateSpeed) {
        this.rotateAngle = this.rotateSpeed;
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

    if (moveForward || moveBackward || strafeLeft || strafeRight) {
      this.velocity = Math.min(this.velocity + this.acceleration, this.speed);

      if (moveForward) {
        moveX += 1;
      }

      if (strafeRight) {
        moveY += 1;
      }

      if (moveBackward) {
        moveX -= 1;
      }

      if (strafeLeft) {
        moveY -= 1;
      }
    } else {
      this.velocity = 0;
    }

    this.angle = (this.angle + this.rotateAngle + DEG_360) % DEG_360;

    this.moveAngle = -Math.atan2(-moveY, moveX);

    if (this.moveAngle !== previousMoveAngle) {
      this.angle = (this.angle - previousMoveAngle + this.moveAngle + DEG_360) % DEG_360;
    }

    // Update height.
    if (this.actions.crouch) {
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
      this.vision += 0.02 * delta;

      if (this.vision > 1) {
        this.vision = 1;
      }
    }

    // Update camera.
    this.camera.update(delta);

    // Update weapon.
    if (selectWeapon) {
      this.selectNextWeapon(selectWeapon - 1);
    }

    if (attack) {
      this.useWeapon();
    }

    this.weapon.update(delta);

    // Update interactions
    this.parent.getAdjacentBodies(this).forEach((body) => {
      // Update item interactions
      // TODO: Move to collision event.
      if (body.isItem) {
        if (this.isBodyCollision(body)) {
          if (body.setColliding()) {
            if (this.pickUp(body)) {
              this.parent.onItemPickup();
              this.parent.remove(body);
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
          if (body.keyCard) {
            const keyCard = this.keyCards[body.keyCard];

            if (keyCard.isEquiped()) {
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

    super.update(delta);
  }

  /**
   * Update the player in the dead state.
   * @param  {Number} delta The delta time value.
   */
  updateDying(delta) {
    // Update height
    this.height -= this.heightVelocity * delta * 0.2;

    if (this.height <= this.deadHeight) {
      this.height = this.deadHeight;
      this.setDead();
    }

    // Update vision
    if (this.vision < 1) {
      this.vision += 0.01 * delta;

      if (this.vision > 1) {
        this.vision = 1;
      }
    }

    // Update camera
    const { pitch, maxPitch } = this.camera;

    let newPitch = pitch + (10 * delta);

    if (newPitch >= maxPitch) {
      newPitch = maxPitch;
    }

    this.camera.pitch = newPitch;

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
   * Update the messages.
   * @param  {Number} delta The delta time.
   */
  updateMessages(delta) {
    const initialLength = this.messages.length;

    this.messages.forEach(message => message.update(delta));
    this.messages = this.messages.filter(message => message.timer);

    if (this.messages.length < initialLength) {
      this.emit(EVENTS.MESSAGES_UPDATED, this.messages);
    }
  }

  /**
   * Update the actions.
   */
  updateActions() {
    this.actions.use = false;
    this.actions.selectWeapon = 0;
    this.actions.rotate = 0;
  }

  /**
   * Add a player message.
   * @param {String} text The text of the message.
   */
  addMessage(text) {
    this.messages.unshift(new Message(text));
    this.emit(EVENTS.MESSAGES_UPDATED, this.messages);
  }

  /**
   * Check if the player has messages.
   * @return {Boolean}
   */
  hasMessages() {
    return !!this.messages.length;
  }

  /**
   * Select the next weapon to use.
   * @param  {String} type The type of weapon to use.
   */
  selectNextWeapon(index) {
    const weapon = Object.values(this.weapons)[index];

    if (weapon && weapon.isEquiped() && this.currentWeaponType !== weapon.type) {
      this.currentWeaponType = weapon.type;
      this.emit(EVENTS.CHANGE_WEAPON);
    }
  }

  /**
   * Use the current weapon.
   */
  useWeapon() {
    if (this.weapon.use()) {
      const { power, recoil } = this.weapon;

      const {
        startPoint,
        endPoint,
        distance,
        side,
        encounteredBodies,
      } = this.castRay(this.viewAngle);

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

      const bullet = this.bullets[this.currentWeaponType].shift();
      const angle = (this.viewAngle + DEG_180) % DEG_360;

      if (collisions.length) {
        const { point, body } = collisions[0];

        this.parent.addExplosion(new Explosion({
          x: point.x + Math.cos(angle) * (bullet.width / 2),
          y: point.y + Math.cos(angle) * (bullet.width / 2),
          sourceId: bullet.id,
          type: bullet.explosionType,
          parent: this.parent,
        }));

        if (body.isEnemy) {
          body.hurt(power);

          if (distance - body.distanceToPlayer < SPATTER_DISTANCE) {
            if (!side.spatter) {
              side.spatter = body.spatter();
            }
          }
        }
      } else {
        this.parent.addExplosion(new Explosion({
          x: endPoint.x + Math.cos(angle) * (bullet.width / 2),
          y: endPoint.y + Math.sin(angle) * (bullet.width / 2),
          sourceId: bullet.id,
          type: bullet.explosionType,
          parent: this.parent,
        }));
      }

      this.bullets[this.currentWeaponType].push(bullet);
      this.camera.setRecoil(recoil);
      this.parent.onExplosion(power);
      this.emitSound(this.weapon.sounds.fire);
    }
  }

  /**
   * Hurt the player.
   * @param  {Number} amount The amount to hurt the player.
   */
  hurt(amount) {
    this.vision = 0.6;
    this.health -= amount;

    if (this.health <= 0) {
      this.health = 0;
      this.setDying();
      this.emitSound(this.sounds.death);
    } else {
      this.recoil(amount * 4, { direction: -1 });
      this.emitSound(this.sounds.pain);
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
    const pickedUpWeapon = this.weapons[weapon];
    const index = Object.keys(this.weapons).indexOf(weapon);

    if (!pickedUpWeapon.isEquiped()) {
      pickedUpWeapon.setEquiped();
      this.selectNextWeapon(index);

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
    const weaponToRefill = this.weapons[weapon];

    if (weaponToRefill.isEquiped()) {
      this.emitSound(this.sounds.item);
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
    const { weapons, currentWeaponType, health } = this;

    return {
      weapons: Object.values(weapons).reduce((memo, weapon) => ([
        ...memo,
        weapon.props,
      ]), []),
      currentWeaponType,
      health,
    };
  }

  /**
   * Get the player weapon.
   * @return {Weapon} The player weapon.
   */
  get weapon() {
    return this.weapons[this.currentWeaponType];
  }

  /**
   * Get the camera height.
   * @return {Number} The camera height.
   */
  get viewHeight() {
    return this.height + this.camera.height;
  }

  /**
   * Get the view angle on the y axis.
   * @return {Number} The view angle.
   */
  get viewPitch() {
    return this.camera.pitch;
  }

  /**
   * Get the view angle on the x axis.
   * @return {Number} The view angle.
   */
  get viewAngle() {
    return (this.angle + this.camera.angle + DEG_360) % DEG_360;
  }
}

export default Player;
