import translate from '@util/translate';
import { degrees } from '@game/core/physics';
import { WEAPON_TYPES } from '@constants/assets';
import { CELL_SIZE, GOD_MODE, HEALTH_MODIFIER } from '@constants/config';
import AbstractActor from '../AbstractActor';
import AbstractItem from '../AbstractItem';
import SecondaryWeapon from './components/SecondaryWeapon';
import BulletWeapon from './components/BulletWeapon';

import ProjectileWeapon from './components/ProjectileWeapon';
import Camera from './components/Camera';
import Hand from './components/Hand';
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

const WEAPON_INDICES = {
  UNARMED: -1,
  SECONDARY: 0,
};

const WEAPONS = {
  [WEAPON_TYPES.SECONDARY]: SecondaryWeapon,
  [WEAPON_TYPES.BULLET]: BulletWeapon,
  [WEAPON_TYPES.PROJECTILE]: ProjectileWeapon,
};

const STATES = {
  ALIVE: 'player:alive',
  DYING: 'player:dying',
  DEAD: 'player:dead',
};

const EVENTS = {
  HURT: 'player:hurt',
  USE_WEAPON: 'player:use:weapon',
  RELEASE_WEAPON: 'player:release:weapon',
  DEATH: 'player:death',
  DYING: 'player:dying',
  ARMING: 'player:hand:arming',
  UNARMING: 'player:hand:unarming',
  MESSAGE_ADDED: 'player:messages:added',
  PICK_UP: 'player:pick:up',
  EXIT: 'player:at:exit',
};

export default class Player extends AbstractActor {
  constructor(options = {}) {
    const {
      rotateSpeed = 1,
      rotateAcceleration = 0,
      weapons = {},
      weaponIndex = WEAPON_INDICES.UNARMED,
      items,
      soundSprite,
      maxHealth,
      ...other
    } = options;

    super({
      soundSprite,
      maxHealth: maxHealth * HEALTH_MODIFIER,
      ...other,
    });

    this.rotateSpeed = rotateSpeed;
    this.rotateAcceleration = rotateAcceleration;
    this.maxHeight = this.height;
    this.maxSpeed = this.speed;

    this.crouchHeight = this.height * 0.6;
    this.deadHeight = this.height * 0.45;

    this.actions = {};
    this.vision = 1;
    this.rotateAngle = 0;
    this.timer = 0;
    this.moveAngle = 0;
    this.isPlayer = true;
    this.distanceToPlayer = 0;

    this.weaponIndex = weaponIndex;

    this.camera = new Camera(this);
    this.hand = new Hand(this);

    this.hand.onArming(() => this.emit(EVENTS.ARMING));

    this.hand.onUnarming(() => this.emit(EVENTS.UNARMING));

    this.hand.onAiming(() => {
      if (this.weapon.secondary) this.useWeapon();
    });

    this.weapons = Object.keys(weapons).map(
      name =>
        new WEAPONS[weapons[name].type]({
          ...weapons[name],
          player: this,
          name,
          soundSprite,
        })
    );

    this.sounds = this.weapons.reduce(
      (memo, weapon) => ({
        ...memo,
        [weapon.name]: weapon.sounds.use,
      }),
      this.sounds
    );

    this.viewHeight = this.z + this.height + this.camera.height;
    this.viewAngle = (this.angle + this.camera.angle + DEG_360) % DEG_360;
    this.viewPitch = this.camera.pitch;

    this.addTrackedCollision({
      type: AbstractItem,
      onStart: body => {
        if (this.pickUp(body)) {
          this.emit(EVENTS.PICK_UP, body);

          this.addMessage(
            translate('world.player.pickup', {
              item: body.title,
            })
          );
        } else if (body.title) {
          this.addMessage(
            translate('world.player.cannot.pickup', {
              item: body.title,
            })
          );
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

    this.radius =
      Math.sqrt(this.width * this.width + this.width * this.width) / 2;

    this.setAlive();
  }

  onMessageAdded(callback) {
    this.on(EVENTS.MESSAGE_ADDED, callback);
  }

  onUseWeapon(callback) {
    this.on(EVENTS.USE_WEAPON, callback);
  }

  onReleaseWeapon(callback) {
    this.on(EVENTS.RELEASE_WEAPON, callback);
  }

  onExit(callback) {
    this.on(EVENTS.EXIT, callback);
  }

  onPickUp(callback) {
    this.on(EVENTS.PICK_UP, callback);
  }

  onHurt(callback) {
    this.on(EVENTS.HURT, callback);
  }

  onDying(callback) {
    this.on(EVENTS.DYING, callback);
  }

  onDeath(callback) {
    this.on(EVENTS.DEATH, callback);
  }

  onArmWeapon(callback) {
    this.on(EVENTS.ARMING, callback);
  }

  onUnarmWeapon(callback) {
    this.on(EVENTS.UNARMING, callback);
  }

  start(message) {
    // Determine the initial weapon index
    // If weapon index is UNARMED, then try and set it to first equiped weapon.
    const initialWeaponIndex = this.weapons.reduce(
      (prevIndex, weapon, index) =>
        prevIndex <= 0 && !weapon.secondary && weapon.equiped
          ? index
          : prevIndex,
      this.weaponIndex
    );

    // Start level with no weapon equiped;
    this.weaponIndex = WEAPON_INDICES.UNARMED;

    this.selectWeapon(initialWeaponIndex);

    this.addMessage(message, { priority: 1 });
  }

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
      secondaryAttack,
    } = this.actions;

    const previousMoveAngle = this.moveAngle;

    let moveX = 0;
    let moveY = 0;

    // Update speed.
    this.speed = (this.maxSpeed * this.height) / this.maxHeight;

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
        (this.rotateSpeed / 3) * -1
      );
    } else if (turnRight) {
      this.rotateAngle = Math.min(
        this.rotateAngle + this.rotateAcceleration,
        this.rotateSpeed / 3
      );
    } else {
      this.rotateAngle = 0;
    }

    // Update movement.
    this.angle = (this.angle + this.rotateAngle * delta + DEG_360) % DEG_360;

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
      this.angle =
        (this.angle - previousMoveAngle + this.moveAngle + DEG_360) % DEG_360;
    }

    // Update height.
    if (crouch) {
      this.height = Math.max(
        this.height - HEIGHT_INCREMENT * delta,
        this.crouchHeight
      );
    } else {
      this.height = Math.min(
        this.height + HEIGHT_INCREMENT * delta,
        this.maxHeight
      );
    }

    // Update vision.
    if (this.vision < 1) {
      this.vision += VISION_INCREMENT * delta;

      if (this.vision > 1) {
        this.vision = 1;
      }
    }

    this.camera.update(delta);
    this.hand.update(delta);

    if (this.weaponIndex && secondaryAttack) {
      this.selectWeapon(WEAPON_INDICES.SECONDARY);
    } else if (selectWeapon) {
      this.selectWeapon(selectWeapon);
    } else if (cycleWeapon) {
      this.cycleWeapon(cycleWeapon);
    } else if (attack) {
      this.useWeapon();
    } else if (stopAttack) {
      this.releaseWeapon();
    }

    // Update interactions.
    if (use) {
      this.emitSound(this.sounds.use);

      if (this.cell.use) {
        this.cell.use(this);
      } else {
        const ray = this.castRay();
        const { distance, cell } = ray;

        if (cell.use && distance <= CELL_SIZE + this.width / 2) {
          cell.use(this);
        }
      }
    }

    if (this.weapon) {
      this.weapon.update(delta, elapsedMS);
    }

    // Update view
    this.viewHeight = this.z + this.height + this.camera.height;
    this.viewAngle = (this.angle + this.camera.angle + DEG_360) % DEG_360;
    this.viewPitch = this.camera.pitch;

    // Update actions.
    this.actions.use = false;
    this.actions.selectWeapon = null;
    this.actions.rotate = 0;
    this.actions.cycleWeapon = 0;
    this.actions.stopAttack = false;
    this.actions.secondaryAttack = false;

    if (this.isArrivedAt(this.parent.exit)) {
      this.health = this.maxHealth;
      this.emit(EVENTS.EXIT);
    }

    // Update parent
    super.update(delta, elapsedMS);
  }

  updateDying(delta) {
    // Update camera
    const { pitch, maxPitch } = this.camera;

    this.camera.pitch = Math.min(
      pitch + DYING_PITCH_INCREMENT * delta,
      maxPitch
    );

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

    this.hand.update(delta);

    // Update view
    this.viewHeight = this.z + this.height + this.camera.height;
    this.viewAngle = (this.angle + this.camera.angle + DEG_360) % DEG_360;
    this.viewPitch = this.camera.pitch;
  }

  updateDead(delta, elapsedMS) {
    this.timer += elapsedMS;

    if (this.timer >= DEATH_INTERVAL) {
      this.timer = 0;
      this.emit(EVENTS.DEATH);
    }
  }

  addMessage(text, options) {
    this.emit(EVENTS.MESSAGE_ADDED, text, options);
  }

  useWeapon() {
    if (this.hand.canUseWeapon()) {
      const { success, recoil, sound, flash } = this.weapon.use();

      if (recoil) this.camera.setRecoil(recoil);
      if (sound) this.emitSound(sound);
      if (flash) this.parent.addFlashLight(flash);
      if (success) this.emit(EVENTS.USE_WEAPON);
    }
  }

  releaseWeapon() {
    this.weapon?.setAiming();
    this.emit(EVENTS.RELEASE_WEAPON);
  }

  cycleWeapon(index) {
    const currentIndex = this.weaponIndex;

    if (index < 0) {
      for (let i = 1; i < this.weapons.length; i++) {
        let nextIndex = (currentIndex + i) % this.weapons.length;

        // Skip boot, since it is a secondary attack.
        if (nextIndex === WEAPON_INDICES.SECONDARY) {
          nextIndex = 1;
        }

        const weapon = this.weapons[nextIndex];

        if (weapon.equiped) {
          this.selectWeapon(nextIndex);
          break;
        }
      }
    } else {
      for (let i = this.weapons.length - 1; i > 0; i--) {
        let nextIndex = (currentIndex + i) % this.weapons.length;

        // Skip boot, since it is a secondary attack.
        if (nextIndex === 0) {
          nextIndex = this.weapons.length - 1;
        }

        const weapon = this.weapons[nextIndex];

        if (weapon.equiped) {
          this.selectWeapon(nextIndex);
          break;
        }
      }
    }
  }

  selectWeapon(index, { silent = false } = {}) {
    if (this.weaponIndex !== index && this.hand.canChangeWeapon()) {
      const weapon = this.weapons[index];

      if (!weapon || weapon.equiped) {
        this.previousWeaponIndex = this.weaponIndex;
        this.weaponIndex = index;
        this.releaseWeapon();
        this.hand.setUnarming();

        this.weapon = weapon;

        if (weapon && !silent) {
          this.emitSound(weapon.sounds.equip);
        }
      }
    }
  }

  selectPreviousWeapon() {
    const nextIndex = this.weapons.reduce(
      (prevIndex, weapon, index) =>
        prevIndex <= 0 && !weapon.secondary && weapon.equiped
          ? index
          : prevIndex,
      this.previousWeaponIndex
    );

    this.selectWeapon(nextIndex, {
      silent: this.previousWeaponIndex === nextIndex,
    });
  }

  hurt(damage, angle) {
    if (GOD_MODE) {
      return;
    }

    this.vision = HURT_VISION_AMOUNT;
    // TODO: Move damage to parent class.
    this.health -= damage;

    if (this.health <= 0) {
      this.health = 0;
      this.setDying();
      this.emitSound(this.sounds.death);
    } else {
      this.recoil(damage, { direction: -1 });

      if (!this.isPlaying(this.sounds.pain)) {
        this.emitSound(this.sounds.pain);
      }
    }

    this.emit(EVENTS.HURT);

    super.hurt(damage, angle);
  }

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

    if (item.isPortal) {
      this.emit(EVENTS.EXIT);
    }

    return false;
  }

  pickUpWeapon({ weapon }) {
    const index = this.weapons.map(({ name }) => name).indexOf(weapon);
    const pickedUpWeapon = this.weapons[index];

    if (!pickedUpWeapon.equiped) {
      pickedUpWeapon.equiped = true;
      this.selectWeapon(index);

      return true;
    }

    return this.pickUpAmmo({
      weapon,
      amount: Math.round(pickedUpWeapon.maxAmmo / 2),
    });
  }

  pickUpAmmo({ weapon, amount }) {
    const index = this.weapons.map(({ name }) => name).indexOf(weapon);
    const weaponToRefill = this.weapons[index];

    if (weaponToRefill.equiped && weaponToRefill.addAmmo(amount)) {
      this.emitSound(weaponToRefill.sounds.equip);
      return true;
    }

    return false;
  }

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

  pickUpKey(key) {
    this.emitSound(this.sounds.item);
    this.keyCards[key.color].equip();

    return true;
  }

  isFacing(body) {
    const angle = (this.getAngleTo(body) - this.viewAngle + DEG_360) % DEG_360;
    return angle > DEG_270 || angle < DEG_90;
  }

  shake(amount) {
    this.camera.setShake(amount);
  }

  recoil(amount, options) {
    this.camera.setRecoil(amount, options);
  }

  setAlive() {
    return this.setState(STATES.ALIVE);
  }

  isAlive() {
    return this.state === STATES.ALIVE;
  }

  setDying() {
    const isStateChanged = this.setState(STATES.DYING);

    if (isStateChanged) {
      this.selectWeapon(WEAPON_INDICES.UNARMED);
      this.emit(EVENTS.DYING);
    }

    return isStateChanged;
  }

  isDying() {
    return this.state === STATES.DYING;
  }

  setDead() {
    return this.setState(STATES.DEAD);
  }

  isDead() {
    return this.state === STATES.DEAD;
  }

  destroy() {
    super.destroy();

    Object.values(this.keyCards).forEach(key => key.destroy());

    this.hand.destroy();
    this.weapons.forEach(weapon => weapon.destroy());
    this.weapons = null;
    this.hand = null;
    this.actions = null;
    this.keyCards = null;
  }

  get elavationOffset() {
    return this.height - CELL_SIZE / 2;
  }

  get props() {
    const { weapons, weaponIndex, health } = this;

    return {
      weapons: weapons.reduce(
        (memo, { name, props }) => ({
          ...memo,
          [name]: props,
        }),
        {}
      ),
      weaponIndex,
      health,
    };
  }
}
