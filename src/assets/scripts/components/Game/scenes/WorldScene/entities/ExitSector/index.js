import { TIME_STEP } from '~/constants/config';
import SwitchSector from '../SwitchSector';

const WAIT_TIME = 1000;

class ExitSector extends SwitchSector {
  constructor(options) {
    super(options);
    this.timer = 0;
  }

  update(delta) {
    if (this.enabled) {
      this.timer += TIME_STEP * delta;

      if (this.timer >= WAIT_TIME) {
        this.timer = 0;
        console.log('foobar');
      }
    }
  }
}

export default ExitSector;
