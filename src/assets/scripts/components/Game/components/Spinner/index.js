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
    const width = SCREEN.HEIGHT / 4 * scale;
    const height = width / 8;

    this.view.style.width = `${width}px`;
    this.view.style.height = `${height}px`;
    this.spinner.style.margin = `${-height / 2}px 0px 0px ${-width / 2}px`;
  }
}

export default Spinner;