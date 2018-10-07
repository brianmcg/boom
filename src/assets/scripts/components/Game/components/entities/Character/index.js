import Entity from '../Entity';

class Character extends Entity {
  constructor(props) {
    super(props);
    Object.assign(this, { angle: 0 }, props);
  }
}

export default Character;
