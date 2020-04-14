import './styles/index.scss';

class Spinner {
  constructor() {
    this.view = document.createElement('img');
    this.view.src = '/assets/images/spinner.gif';
  }
}

export default Spinner;
