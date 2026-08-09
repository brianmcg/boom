import DynamicEntity from './DynamicEntity';

export default class AbstractDestroyableEntity extends DynamicEntity {
  constructor({ maxHealth = 100, health, effects, ...other }) {
    super(other);

    this.health = health !== undefined ? health : maxHealth;
    this.maxHealth = maxHealth;
    this.effects = effects;
    this.hits = [];
    this.isDestroyable = true;
  }

  update(delta, elapsedMS) {
    super.update(delta, elapsedMS);

    if (this.hits.length) {
      const totalDamage = this.hits.reduce(
        (memo, { damage }) => memo + damage,
        0
      );
      const instantKill = this.hits.some(h => h.instantKill);

      if (totalDamage) {
        const { length } = this.hits;

        const { x, y } = this.hits.reduce(
          (memo, { angle }) => ({
            x: memo.x + Math.cos(angle),
            y: memo.y + Math.sin(angle),
          }),
          { x: 0, y: 0 }
        );

        const meanAngle = Math.atan2(y / length, x / length);

        this.hurt(totalDamage, meanAngle, instantKill);

        this.hits = [];
      }
    }
  }

  hit(options) {
    this.hits.push(options);
  }

  hurt() {
    if (this.constructor === AbstractDestroyableEntity) {
      throw new TypeError('You have to implement this method.');
    }
  }
}
