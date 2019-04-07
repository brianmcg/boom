import { DynamicBody } from '~/core/physics';

export default class Character extends DynamicBody {
  constructor(options = {}) {
    super(options);

    const { maxHealth = 100 } = options;

    this.maxHealth = maxHealth;
  }
}
