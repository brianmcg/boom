import { degrees } from 'game/core/physics';
import AbstractEnemy from '../AbstractEnemy';
import Projectile from '../Projectile';

/**
 * Abstract class representing a projectile enemy.
 * @extends {AbstractEnemy}
 */
class ProjectileEnemy extends AbstractEnemy {
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
  constructor({ primaryAttack = {}, soundSprite = {}, ...other }) {
    super({ soundSprite, primaryAttack, ...other });

    const { pellets, projectile } = primaryAttack;
    const { amount, ...projectileProps } = projectile;

    this.projectiles = [];

    [...Array(amount).keys()].forEach(() => {
      this.projectiles.push(new Projectile({
        ...projectileProps,
        source: this,
        soundSprite,
        queue: this.projectiles,
      }));
    });

    this.graphIndex = 1;

    this.offsets = (pellets % 2 === 0)
      ? [...new Array(pellets + 1).keys()]
        .map(i => (i - Math.round(pellets / 2)) * degrees(30) / pellets)
        .filter(i => i)
      : [...new Array(pellets).keys()]
        .map(i => (i - Math.floor(pellets / 2)) * degrees(30) / pellets);
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
    this.emitSound(this.sounds.attack);

    if (this.projectiles.length) {
      this.offsets.forEach((offset) => {
        const projectile = this.projectiles.shift();

        projectile.set({
          offset,
          angle: this.angle,
          damage: this.attackDamage(),
        });

        this.parent.add(projectile);
      });
    }
  }
}

export default ProjectileEnemy;
