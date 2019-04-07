import Character from '../Character';

export default class Player extends Character {
  constructor(options = {}) {
    super(options);
    this.maxHealth = 100;
    this.health = this.maxHealth;
  }
}
