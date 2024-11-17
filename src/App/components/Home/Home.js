import { state } from '@util/dom';
import HomeView from './HomeView';
import './Home.css';

export default class Home {
  constructor({ onClickStart }) {
    this.state = state(false);
    this.view = HomeView({ showButton: this.state, onClickStart });
  }

  showButton() {
    this.state.val = true;
  }
}
