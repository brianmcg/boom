import Container from '../Container';

class PauseContainer extends Container {
  isUpdateable() {
    return this.playing;
  }
}

export default PauseContainer;
