import Enemy from '../Enemy';

const STATES = {
  IDLE: 'enemy:idle',
  PATROL: 'enemy:patrol',
  CHASE: 'enemy:chase',
  AIM: 'enemy:aim',
  ATTACK: 'enemy:attack',
  HURT: 'enemy:hurt',
  DEAD: 'dead',
};

export default class Shooter extends Enemy {
  constructor({ state = STATES.IDLE, ...other }) {
    super(other);
    this.state = state;
  }

  static get STATES() {
    return STATES;
  }
}
