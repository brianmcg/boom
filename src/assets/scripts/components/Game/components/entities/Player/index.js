import Character from '../Character';

class Player extends Character {
  constructor(props) {
    super(props);
    Object.assign(this, { speed: 10 }, props);
  }

  input() {

  }
}

export default Player;
