import translate from 'root/translate';
import { degrees } from 'game/core/physics';
import { WEAPONS } from 'game/constants/types';
import { CELL_SIZE } from 'game/constants/config';
import AbstractActor from '../AbstractActor';
import AbstractItem from '../AbstractItem';
import HitScanWeapon from './components/HitScanWeapon';
import ProjectileWeapon from './components/ProjectileWeapon';
import Camera from './components/Camera';
import KeyCard from './components/KeyCard';

const DEG_360 = degrees(360);
const DEG_270 = degrees(270);
const DEG_90 = degrees(90);
const HEIGHT_INCREMENT = CELL_SIZE / 32;
const DEATH_INTERVAL = 1500;
const DYING_HEIGHT_FADE = 0.2;
const DYING_PITCH_INCREMENT = 10;
const HURT_VISION_AMOUNT = 0.6;
const VISION_INCREMENT = 0.02;
const BREATH_INCREMENT = 0.002;
const MAX_BREATH_AMOUNT = 0.4;
const BREATH_MULTIPLIER = -2;

const STATES = {
  ALIVE: 'player:alive',
  DYING: 'player:dying',
  DEAD: 'player:dead',
};

const EVENTS = {
  HURT: 'player:hurt',
  USE_WEAPON: 'player:use:weapon',
  DEATH: 'player:death',
  DYING: 'player:dying',
  CHANGE_WEAPON: 'player:change:weapon',
  MESSAGE_ADDED: 'player:messages:added',
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
      items,
      soundSprite,
      ...other
    } = options;
    super({ soundSprite, ...other });

    this.rotateSpeed = rotateSpeed;
    this.rotateAcceleration = rotateAcceleration;
    this.maxHeight = this.height;
    this.maxSpeed = this.speed;
    this.weaponIndex = weaponIndex;

    this.crouchHeight = this.height * 0.6;
    this.deadHeight = this.height * 0.45;

    this.actions = {};
    this.vision = 1;
    this.rotateAngle = 0;
    this.timer = 0;
    this.moveAngle = 0;
    this.isPlayer = true;
    this.distanceToPlayer = 0;
    this.breathDirection = 1;
    this.breath = 0;

    this.camera = new Camera(this);

    this.weapons = Object.keys(weapons).map((name) => {
      const weapon = weapons[name].type === WEAPONS.HIT_SCAN
        ? new HitScanWeapon({
          ...weapons[name],
          player: this,
          name,
        })
        : new ProjectileWeapon({
          ...weapons[name],
          player: this,
          name,
          soundSprite,
        });

      weapon.onUse(({ recoil, sound }) => {
        this.camera.setRecoil(recoil);
        this.emitSound(sound);
        this.emit(EVENTS.USE_WEAPON);
      });

      return weapon;
    });

    this.weapon = this.weapons[this.weaponIndex];

    this.sounds = this.weapons.reduce((memo, weapon) => ({
      ...memo,
      [weapon.name]: weapon.sounds.use,
    }), this.sounds);

    this.viewHeight = this.z + this.height + this.camera.height;
    this.viewAngle = (this.angle + this.camera.angle + DEG_360) % DEG_360;
    this.viewPitch = this.camera.pitch;

    this.addTrackedCollision({
      type: AbstractItem,
      onStart: (body) => {
        if (this.pickUp(body)) {
          this.emit(EVENTS.PICK_UP, body);
        } else {
          this.addMessage(translate('world.player.cannot.pickup', {
            item: body.title,
          }));
        }
      },
    });

    this.keyCards = items.reduce((memo, { isKey, color }) => {
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

    this.setAlive();
  }

  /**
   * Add a callback for the message added event.
   * @param  {Function} callback The callback function.
   */
  onMessageAdded(callback) {
    this.on(EVENTS.MESSAGE_ADDED, callback);
  }

  /**
   * Add a callback for the use weapon event.
   * @param  {Function} callback The callback function.
   */
  onUseWeapon(callback) {
    this.on(EVENTS.USE_WEAPON, callback);
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
   * Start a world.
   * @param  {String} message The message to display.
   */
  start(message) {
    this.addMessage(message, { priority: 1 });
    this.emitSound(this.sounds.enter);
    this.actions.use = true;
  }

  /**
   * Update the player.
   * @param  {Number} delta The delta time value.
   */
  update(delta, elapsedMS) {
    switch (this.state) {
      case STATES.ALIVE:
        this.updateAlive(delta, elapsedMS);
        break;
      case STATES.DYING:
        this.updateDying(delta, elapsedMS);
        break;
      case STATES.DEAD:
        this.updateDead(delta, elapsedMS);
        break;
      default:
        break;
    }
  }

  /**
   * Update the player in the default state.
   * @param  {Number} delta The delta time value.
   */
  updateAlive(delta, elapsedMS) {
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
      cycleWeapon,
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

    // update breath
    this.breath += BREATH_INCREMENT * this.breathDirection * delta;

    if (this.breath >= MAX_BREATH_AMOUNT) {
      this.breath = MAX_BREATH_AMOUNT;
      this.breathDirection *= BREATH_MULTIPLIER;
    } else if (this.breath <= 0) {
      this.breath = 0;
      this.breathDirection /= BREATH_MULTIPLIER;
    }

    // Update height.
    if (crouch) {
      this.height = Math.max(
        this.height - (HEIGHT_INCREMENT * delta),
        this.crouchHeight,
      );
    } else {
      this.height = Math.min(
        this.height + (HEIGHT_INCREMENT * delta),
        this.maxHeight,
      );
    }

    // Update vision.
    if (this.vision < 1) {
      this.vision += VISION_INCREMENT * delta;

      if (this.vision > 1) {
        this.vision = 1;
      }
    }

    // Update camera.
    this.camera.update(delta);

    // Update weapon.
    if (this.isWeaponChangeEnabled && (selectWeapon || selectWeapon === 0)) {
      this.selectWeapon(selectWeapon);
    }

    if (this.isWeaponChangeEnabled && cycleWeapon) {
      const currentIndex = this.weaponIndex;

      if (cycleWeapon < 0) {
        for (let i = 1; i < this.weapons.length; i += 1) {
          const nextIndex = (currentIndex + i) % this.weapons.length;
          const weapon = this.weapons[nextIndex];

          if (weapon.isEquiped()) {
            this.selectWeapon(nextIndex);
            break;
          }
        }
      } else {
        for (let i = this.weapons.length - 1; i > 0; i -= 1) {
          const nextIndex = (currentIndex + i) % this.weapons.length;
          const weapon = this.weapons[nextIndex];

          if (weapon.isEquiped()) {
            this.selectWeapon(nextIndex);
            break;
          }
        }
      }
    }

    if (attack) {
      this.weapon.use();
    }

    if (stopAttack) {
      this.weapon.stop();
    }

    // Update interactions.
    if (use) {
      const ray = this.castRay();
      const { distance, cell } = ray;

      if (cell.use && distance <= (CELL_SIZE + this.width / 2)) {
        this.emitSound(this.sounds.use);

        if (cell.isDoor) {
          if (cell.keyCard) {
            const keyCard = this.keyCards[cell.keyCard];

            if (keyCard && keyCard.isEquiped()) {
              if (cell.use()) {
                keyCard.use();
              }
            } else {
              this.addMessage(translate('world.door.locked', {
                color: translate(`world.color.${cell.keyCard}`),
              }));
            }
          } else {
            cell.use();
          }
        }
      }
    }

    this.weapon.update(delta, elapsedMS);

    // Update view
    this.viewHeight = this.z + this.height + this.breath + this.camera.height;
    this.viewAngle = (this.angle + this.camera.angle + DEG_360) % DEG_360;
    this.viewPitch = this.camera.pitch;

    // Update actions.
    this.actions.use = false;
    this.actions.selectWeapon = null;
    this.actions.rotate = 0;
    this.actions.cycleWeapon = 0;
    this.actions.stopAttack = false;

    // Update parent
    super.update(delta, elapsedMS);
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
    this.height -= HEIGHT_INCREMENT * DYING_HEIGHT_FADE * delta;

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
    this.viewHeight = this.z + this.height + this.camera.height;
    this.viewAngle = (this.angle + this.camera.angle + DEG_360) % DEG_360;
    this.viewPitch = this.camera.pitch;

    // Update weapon
    this.weapon.update(delta);
  }

  /**
   * Update the player in the dead state.
   * @param  {Number} delta The delta time.
   */
  updateDead(delta, elapsedMS) {
    this.timer += elapsedMS;

    if (this.timer >= DEATH_INTERVAL) {
      this.timer = 0;
      this.emit(EVENTS.DEATH);
    }
  }

  /**
   * Add a player message.
   * @param {String} text             The text of the message.
   * @param {Number} options.priority The priority of the message.
   */
  addMessage(text, options) {
    this.emit(EVENTS.MESSAGE_ADDED, text, options);
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
      this.disableWeaponChange();
      this.emitSound(weapon.sounds.equip);
      this.emit(EVENTS.CHANGE_WEAPON);
    }
  }

  /**
   * Enable weapon changing.
   */
  enableWeaponChange() {
    this.isWeaponChangeEnabled = true;
  }

  /**
   * Disable weapon changing.
   */
  disableWeaponChange() {
    this.isWeaponChangeEnabled = false;
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
      this.recoil(amount, { direction: -1 });

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
   * @param  {Weapon} weapon  The weapon.
   */
  pickUpWeapon({ weapon }) {
    const index = this.weapons.map(({ name }) => name).indexOf(weapon);
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
    const index = this.weapons.map(({ name }) => name).indexOf(weapon);
    const weaponToRefill = this.weapons[index];

    if (weaponToRefill.isEquiped()) {
      this.emitSound(weaponToRefill.sounds.equip);
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
      weapons: weapons.reduce((memo, { name, props }) => ({
        ...memo,
        [name]: props,
      }), {}),
      weaponIndex,
      health,
    };
  }
}

export default Player;
