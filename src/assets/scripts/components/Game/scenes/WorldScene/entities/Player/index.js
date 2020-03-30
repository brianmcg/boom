import translate from 'root/translate';
import { DEG } from 'game/core/physics';
import { CELL_SIZE } from 'game/constants/config';
import { ITEM_TYPES, KEY_COLORS, WEAPON_TYPES } from 'game/constants/assets';
import AbstractActor from '../AbstractActor';
import Weapon from './components/Weapon';
import Camera from './components/Camera';
import Message from './components/Message';
import KeyCard from './components/KeyCard';
import Bullet from '../Bullet';
import Explosion from '../../effects/Explosion';

const DEG_360 = DEG[360];

const DEG_45 = DEG[45];

const DEG_90 = DEG[90];

const SPATTER_DISTANCE = CELL_SIZE * 1.5;

const STATES = {
  ALIVE: 'player:alive',
  DYING: 'player:dying',
  DEAD: 'player:dead',
};

const EVENTS = {
  DEATH: 'player:death',
  ARM_WEAPON: 'player:arm:weapon',
  MESSAGE_ADDED: 'player:message:added',
  MESSAGE_REMOVED: 'player:message:removed',
};

/**
 * Creates a player.
 * @extends {AbstractActor}
 */
class Player extends AbstractActor {
  /**
   * Creates a player.
   * @param  {Number} options.x               The x coordinate of the player.
   * @param  {Number} options.y               The y coordinate of the player
   * @param  {Number} options.width           The width of the player.
   * @param  {Number} options.length          The length of the player.
   * @param  {Number} options.height          The height of the player.
   * @param  {Number} options.angle           The angle of the player.
   * @param  {Number} options.maxHealth       The maximum health of the player.
   * @param  {Number}  options.health         The current health of the player.
   * @param  {Number} options.maxVelocity     The maximum velocity of the player.
   * @param  {Number} options.maxRotVelocity  The maximum rotation velocity of the player.
   * @param  {Number} options.acceleration    The acceleration of the player.
   * @param  {Number} options.rotAcceleration The rotation acceleration of the player.
   * @param  {Array}  options.weapons         The player weapons data.
   * @param  {Camera} options.camera          The player camera.
   */
  constructor(options = {}) {
    const {
      maxVelocity = 1,
      maxRotVelocity = 1,
      acceleration = 0,
      rotAcceleration = 0,
      weapons = {},
      camera = {},
      currentWeaponType = WEAPON_TYPES.PISTOL,
      ...other
    } = options;

    super(other);

    this.maxVelocity = maxVelocity;
    this.baseMaxVelocity = maxVelocity;
    this.maxRotVelocity = maxRotVelocity;
    this.acceleration = acceleration;
    this.rotAcceleration = rotAcceleration;
    this.maxHeight = this.height;
    this.crouchHeight = this.height * 0.6;
    this.deadHeight = this.height * 0.45;
    this.heightVelocity = CELL_SIZE / 32;
    this.currentWeaponType = currentWeaponType;
    this.nextWeaponType = null;
    this.actions = {};
    this.vision = 1;

    this.camera = new Camera({ player: this, ...camera });

    this.keyCards = Object.values(KEY_COLORS).reduce((memo, color) => ({
      ...memo,
      [color]: new KeyCard(color),
    }), {});

    this.weapons = Object.keys(weapons).reduce((memo, type) => {
      const weapon = new Weapon({
        player: this,
        ...weapons[type],
        type,
      });

      weapon.onArmingEvent(() => this.emit(EVENTS.ARM_WEAPON, weapon.type));

      return {
        ...memo,
        [type]: weapon,
      };
    }, {});

    this.messages = [];

    this.bullets = Object.keys(weapons).reduce((memo, key) => ({
      ...memo,
      [key]: [...Array(10).keys()].map(() => new Bullet({
        explosionType: weapons[key].explosionType,
      })),
    }), {});

    this.isPlayer = true;

    this.onAddedEvent(this.initialize.bind(this));

    this.setAlive();
  }

  /**
   * Handle the added to world event.
   */
  initialize() {
    const { x, y } = this.world.entrance;

    this.x = (CELL_SIZE * x) + (CELL_SIZE / 2);
    this.y = (CELL_SIZE * y) + (CELL_SIZE / 2);
    this.angle = 0;
    this.velocity = 0;
    this.armWeapon();
  }

  /**
   * Add a callback for the message added event.
   * @param  {Function} callback The callback function.
   */
  onMessageAddedEvent(callback) {
    this.on(EVENTS.MESSAGE_ADDED, callback);
  }

  /**
   * Add a callback for the message removed event.
   * @param  {Function} callback The callback function.
   */
  onMessageRemovedEvent(callback) {
    this.on(EVENTS.MESSAGE_REMOVED, callback);
  }

  /**
   * Add a callback for the player death event.
   * @param  {Function} callback The callback function.
   */
  onPlayerDeathEvent(callback) {
    this.on(EVENTS.DEATH, callback);
  }

  /**
   * Add a callback for the arm weapon event.
   * @param  {Function} callback The callback function.
   */
  onArmWeaponEvent(callback) {
    this.on(EVENTS.ARM_WEAPON, callback);
  }

  /**
   * Update the player.
   * @param  {Number} delta The delta time value.
   */
  update(delta) {
    this.updateMessages(delta);

    switch (this.state) {
      case STATES.ALIVE:
        this.updateAlive(delta);
        break;
      case STATES.DYING:
        this.updateDying(delta);
        break;
      default:
        break;
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
      this.emit(EVENTS.MESSAGE_REMOVED);
    }
  }

  /**
   * Update the player in the default state.
   * @param  {Number} delta The delta time value.
   */
  updateAlive(delta) {
    this.updateAliveMovement(delta);
    this.updateAliveHeight(delta);
    this.updateAliveVision(delta);
    this.updateAliveView(delta);
    this.updateAliveWeapon(delta);
    this.updateAliveInteractions(delta);
  }

  /**
   * Update the player in the dead state.
   * @param  {Number} delta The delta time value.
   */
  updateDying(delta) {
    this.updateDyingHeight(delta);
    this.updateDyingVision(delta);
    this.updateDyingView(delta);
    this.updateDyingWeapon(delta);
  }

  /**
   * Update player movement.
   * @param  {Number delta The delta time.
   */
  updateAliveMovement(delta) {
    this.maxVelocity = this.baseMaxVelocity * this.height / this.maxHeight;

    if (this.actions.strafe) {
      this.updateStrafingMovement(delta);
    } else {
      this.updateStandardMovement(delta);
    }
  }

  /**
   * Update the player vision in standard state.
   * @param  {Number} delta The delta time.
   */
  updateAliveVision(delta) {
    if (this.vision < 1) {
      this.vision += 0.02 * delta;

      if (this.vision > 1) {
        this.vision = 1;
      }
    }
  }

  /**
   * Update player height.
   * @param  {Number delta The delta time.
   */
  updateAliveHeight(delta) {
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
  }

  /**
   * Update player camera.
   * @param  {Number delta The delta time.
   */
  updateAliveView(delta) {
    this.camera.update(delta);
  }

  /**
   * Update player weapon.
   * @param  {Number delta The delta time.
   */
  updateAliveWeapon(delta) {
    const {
      armChaingun,
      armPistol,
      armShotgun,
      attack,
    } = this.actions;

    const { CHAINGUN, PISTOL, SHOTGUN } = WEAPON_TYPES;

    if (this.weapon.isUnarmed()) {
      this.armNextWeapon();
    } else if (armChaingun) {
      this.selectNextWeapon(CHAINGUN);
    } else if (armPistol) {
      this.selectNextWeapon(PISTOL);
    } else if (armShotgun) {
      this.selectNextWeapon(SHOTGUN);
    } else if (attack) {
      this.useWeapon();
    }

    this.weapon.update(delta);
  }

  /**
   * Update player interactions.
   */
  updateAliveInteractions() {
    this.world.getAdjacentBodies(this).forEach((body) => {
      if (body.isItem) {
        this.updateItemInteraction(body);
      } else if (body.isDoor) {
        this.updateDoorInteraction(body);
      }
    });
  }

  /**
   * Update item interaction.
   * @param  {Item} item The item.
   */
  updateItemInteraction(item) {
    if (this.bodyCollision(item)) {
      if (item.setColliding()) {
        if (this.pickUp(item)) {
          this.world.setItemFlash();
          this.world.remove(item);
          item.setRemoved();
        } else {
          this.addMessage(translate('world.player.cannot.pickup', {
            item: item.title,
          }));
        }
      }
    } else {
      item.setIdle();
    }
  }

  /**
   * Update door interaction.
   * @param  {Door} door The door.
   */
  updateDoorInteraction(door) {
    if (this.actions.use) {
      if (door.keyCard) {
        const keyCard = this.keyCards[door.keyCard];

        if (keyCard.isEquiped()) {
          if (door.open()) {
            keyCard.use();
          }
        } else {
          this.addMessage(translate('world.door.locked', {
            color: translate(`world.color.${door.keyCard}`),
          }));
        }
      } else {
        door.open();
      }
    }
  }

  /**
   * Update player standard movement.
   * @param  {Number} delta The delta time.
   */
  updateStandardMovement(delta) {
    const {
      moveBackward,
      moveForward,
      turnLeft,
      turnRight,
    } = this.actions;

    if (moveForward) {
      this.velocity = Math.min(this.velocity + this.acceleration, this.maxVelocity);
    } else if (moveBackward) {
      this.velocity = Math.max(this.velocity - this.acceleration, this.maxVelocity * -1);
    } else {
      this.velocity = Math.max(0, this.velocity - this.acceleration);
    }

    if (turnLeft) {
      this.rotVelocity = Math.max(
        this.rotVelocity - this.rotAcceleration, this.maxRotVelocity * -1,
      );
    } else if (turnRight) {
      this.rotVelocity = Math.min(this.rotVelocity + this.rotAcceleration, this.maxRotVelocity);
    } else {
      this.rotVelocity = 0;
    }

    super.update(delta);
  }

  /**
   * Update player strafing movement.
   * @param  {Number delta The delta time.
   */
  updateStrafingMovement(delta) {
    const previousAngle = this.angle;

    const {
      moveBackward,
      moveForward,
      turnLeft,
      turnRight,
    } = this.actions;

    this.rotVelocity = 0;

    if (moveForward && turnLeft) {
      this.angle = (previousAngle - DEG_45 + DEG_360) % DEG_360;
      this.velocity = Math.min(this.velocity + this.acceleration, this.maxVelocity);
    } else if (moveForward && turnRight) {
      this.angle = (previousAngle + DEG_45) % DEG_360;
      this.velocity = Math.min(this.velocity + this.acceleration, this.maxVelocity);
    } else if (!moveForward && !moveBackward && turnLeft) {
      this.velocity = Math.min(this.velocity + this.acceleration, this.maxVelocity);
      this.angle = (previousAngle - DEG_90 + DEG_360) % DEG_360;
    } else if (!moveForward && !moveBackward && turnRight) {
      this.velocity = Math.min(this.velocity + this.acceleration, this.maxVelocity);
      this.angle = (previousAngle + DEG_90) % DEG_360;
    } else if (moveBackward && turnLeft) {
      this.velocity = Math.max(this.velocity - this.acceleration, this.maxVelocity * -1);
      this.angle = (previousAngle + DEG_45) % DEG_360;
    } else if (moveBackward && turnRight) {
      this.angle = (previousAngle - DEG_45 + DEG_360) % DEG_360;
      this.velocity = Math.max(this.velocity - this.acceleration, this.maxVelocity * -1);
    } else if (moveForward) {
      this.velocity = Math.min(this.velocity + this.acceleration, this.maxVelocity);
    } else if (moveBackward) {
      this.velocity = Math.max(this.velocity - this.acceleration, this.maxVelocity * -1);
    } else {
      this.velocity = 0;
    }

    super.update(delta);

    this.angle = previousAngle;
  }

  /**
   * Update height in dead state.
   * @param  {Number} delta The delta time.
   */
  updateDyingHeight(delta) {
    this.height -= this.heightVelocity * delta * 0.2;

    if (this.height <= this.deadHeight) {
      this.height = this.deadHeight;
      this.setDead();
    }
  }

  /**
   * Update the player vision in dead state.
   * @param  {Number} delta The delta time.
   */
  updateDyingVision(delta) {
    if (this.vision < 1) {
      this.vision += 0.01 * delta;

      if (this.vision > 1) {
        this.vision = 1;
      }
    }
  }

  /**
   * Update the camera vision in dead state.
   * @param  {Number} delta The delta time.
   */
  updateDyingView(delta) {
    const { pitch, maxPitch } = this.camera;

    let newRotationY = pitch + (10 * delta);

    if (newRotationY >= maxPitch) {
      newRotationY = maxPitch;
    }

    this.camera.pitch = newRotationY;
  }

  /**
   * Update the weapon in the dead state.
   * @param  {Number} delta The delta time.
   */
  updateDyingWeapon(delta) {
    this.weapon.update(delta);
  }

  /**
   * Add a player message.
   * @param {String} text The text of the message.
   */
  addMessage(text) {
    this.messages = [new Message(text), ...this.messages];
    this.emit(EVENTS.MESSAGE_ADDED);
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
  selectNextWeapon(nextWeaponType) {
    const weapon = this.weapons[nextWeaponType];

    if (weapon.isEquiped() && this.currentWeaponType !== nextWeaponType) {
      this.nextWeaponType = nextWeaponType;
      this.weapon.setUnarming();
    }
  }

  /**
   * Arm the next selected weapon.
   */
  armNextWeapon() {
    if (this.currentWeaponType !== this.nextWeaponType) {
      this.currentWeaponType = this.nextWeaponType;
      this.nextWeaponType = null;
      this.armWeapon();
    }
  }

  /**
   * Arm weapon.
   */
  armWeapon() {
    this.emitSound(this.sounds.weapon);
    this.weapon.setArming();
  }

  /**
   * Use the current weapon.
   */
  useWeapon() {
    if (this.weapon.use()) {
      const { enemies } = this.world;
      const { power, range, recoil } = this.weapon;

      const {
        startPoint,
        endPoint,
        distance,
        side,
      } = this.castRay();

      const collisions = enemies.reduce((memo, enemy) => {
        if (!enemy.isDead() && enemy.rayCollision({ startPoint, endPoint })) {
          return [...memo, enemy];
        }

        return memo;
      }, []).sort((enemyA, enemyB) => {
        if (enemyA.distanceToPlayer > enemyB.distanceToPlayer) {
          return 1;
        }

        if (enemyA.distanceToPlayer < enemyB.distanceToPlayer) {
          return -1;
        }

        return 0;
      });

      const bullet = this.bullets[this.currentWeaponType].shift();

      const explosion = collisions.length
        ? new Explosion({
          id: bullet.id,
          x: collisions[0].x,
          y: collisions[0].y,
          type: bullet.explosionType,
          world: this.world,
        })
        : new Explosion({
          id: bullet.id,
          x: endPoint.x,
          y: endPoint.y,
          type: bullet.explosionType,
          world: this.world,
        });

      this.world.addExplosion(explosion);

      this.bullets[this.currentWeaponType].push(bullet);

      range.forEach((_, i) => {
        const enemy = collisions[i];

        if (enemy) {
          enemy.hit(power);

          if (distance - enemy.distanceToPlayer < SPATTER_DISTANCE) {
            if (!side.spatter) {
              side.spatter = enemy.spatter();
            }
          }
        }
      });

      this.camera.setRecoil(recoil);
      this.world.setGunFlash(power);
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
      this.camera.setShake(amount);
      this.camera.setRecoil(amount * 6, {
        down: true,
      });

      this.emitSound(this.sounds.pain);
    }
  }

  /**
   * Pick up an item.
   * @param  {Item} item The item to pick up.
   */
  pickUp(item) {
    switch (item.itemType) {
      case ITEM_TYPES.AMMO:
        return this.pickUpAmmo(item);
      case ITEM_TYPES.HEALTH:
        return this.pickUpHealth(item);
      case ITEM_TYPES.KEY:
        return this.pickUpKey(item);
      case ITEM_TYPES.WEAPON:
        return this.pickUpWeapon(item);
      default:
        return false;
    }
  }

  /**
   * Pick up a weapon
   * @param  {Weapon} type  The weapon.
   */
  pickUpWeapon({ weapon }) {
    const pickedUpWeapon = this.weapons[weapon];

    if (!pickedUpWeapon.isEquiped()) {
      pickedUpWeapon.setEquiped(true);
      this.selectNextWeapon(weapon);

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
   * Set the player actions.
   * @param {Object} actions The player actions.
   */
  setActions(actions = {}) {
    this.actions = actions;
  }

  /**
   * Shake the player.
   * @param  {Number} amount The amount to shake.
   */
  shake(amount) {
    this.camera.setShake(amount);
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
    const stateChanged = this.setState(STATES.DYING);

    if (stateChanged) {
      this.weapon.setUnarming();
    }

    return stateChanged;
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
    const stateChanged = this.setState(STATES.DEAD);

    if (stateChanged) {
      this.emit(EVENTS.DEATH);
    }

    return stateChanged;
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
      weapons: Object.keys(weapons).reduce((memo, key) => ({
        ...memo,
        [key]: weapons[key].props,
      }), {}),
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
