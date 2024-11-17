import { SCREEN } from '@constants/config';
import SpinnerView from './SpinnerView';
import './Spinner.css';

export default class Spinner {
  constructor() {
    this.view = SpinnerView();
  }

  resize(scale) {
    const width = (SCREEN.HEIGHT / 4) * scale;

    this.view.style.width = `${width}px`;
    this.view.style.height = `${width}px`;
  }
}
