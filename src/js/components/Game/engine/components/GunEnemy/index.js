import { CELL_SIZE } from '@game/constants/config';
import { degrees } from '@game/core/physics';
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
  constructor({ primaryAttack, ...other }) {
    super({ primaryAttack, ...other });

    const { pellets, spread } = primaryAttack;

    this.primaryAttack = {
      ...this.primaryAttack,
      pellets: [...Array(pellets).keys()].map(i => i),
      spreadAngle: pellets > 1 ? Math.atan2(CELL_SIZE, CELL_SIZE * spread) / 2 : 0,
      pelletAngle: pellets > 1 ? Math.atan2(CELL_SIZE, CELL_SIZE * spread) / pellets : 0,
    };

    this.graphIndex = 1;

    this.projectiles = [...Array(pellets).keys()].map(
      () =>
        new HitScan({
          source: this,
          power: this.primaryAttack.power,
          accuracy: this.primaryAttack.accuracy,
        }),
    );
  }

  /**
   * Execute completed attack behavior.
   */
  onAttackComplete() {
    this.setAiming();
  }

  /**
   * Execute recovery behaviour.
   */
  onHurtComplete() {
    this.setEvading();
  }

  /**
   * Attack a target.
   */
  attack() {
    const { spreadAngle, pelletAngle, pellets } = this.primaryAttack;

    let rayAngle = (this.angle - spreadAngle + DEG_360) % DEG_360;

    for (let i = 0; i < pellets.length; i++) {
      const projectile = this.projectiles.shift();

      if (projectile) {
        projectile.run(rayAngle);
        this.projectiles.push(projectile);
      }

      rayAngle = (rayAngle + pelletAngle) % DEG_360;
    }

    this.emitSound(this.sounds.attack);
  }
}

export default GunEnemy;
