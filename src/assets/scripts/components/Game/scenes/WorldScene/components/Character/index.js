import { DynamicBody } from '~/core/physics';

export default class Character extends DynamicBody {
  constructor(options = {}) {
    const { maxHealth = 100, ...otherOptions } = options;

    super(otherOptions);

    this.health = maxHealth;
    this.maxHealth = maxHealth;
  }
}
