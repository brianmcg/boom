import Entity from '../Entity';

// pistol
// double_shotgun
// chaingun

class Weapon extends Entity {
  update(delta) {
    this.test = delta;
  }
}

export default Weapon;
