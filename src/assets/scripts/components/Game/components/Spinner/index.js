import { SCREEN } from 'game/constants/config';
import './styles/index.scss';

class Spinner {
  constructor() {
    this.spinner = document.createElement('img');
    this.spinner.src = 'assets/images/spinner.gif';

    this.view = document.createElement('div');
    this.view.setAttribute('class', 'spinner');
    this.view.appendChild(this.spinner);
  }

  resize(scale) {
    const width = SCREEN.HEIGHT / 8 * scale;

    this.view.style.width = `${width}px`;
    this.view.style.height = `${width}px`;
    this.spinner.style.margin = `${-width / 2}px 0px 0px ${-width / 2}px`;
  }
}

export default Spinner;
