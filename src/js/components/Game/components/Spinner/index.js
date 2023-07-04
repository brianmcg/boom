import { SCREEN } from '@game/constants/config';
import loadingGif from '@images/loading.gif';

class Spinner {
  constructor() {
    this.spinner = document.createElement('img');
    this.spinner.src = loadingGif;
    this.view = document.createElement('div');
    this.view.setAttribute('class', 'spinner');
    this.view.appendChild(this.spinner);
  }

  resize(scale) {
    const width = (SCREEN.HEIGHT / 4) * scale;

    this.view.style.width = `${width}px`;
    this.view.style.height = `${width}px`;
    this.spinner.style.margin = `${-width / 2}px 0px 0px ${-width / 2}px`;
  }
}

export default Spinner;
