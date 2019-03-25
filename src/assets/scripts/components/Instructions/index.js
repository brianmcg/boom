import { KEYS, TITLE } from './constants';
import Table from './components/Table';

export default class Instructions {
  constructor() {
    const content = document.createElement('div');
    const span = document.createElement('span');
    const text = document.createTextNode(TITLE);
    const table = new Table(KEYS);

    content.setAttribute('class', 'container-content');
    span.setAttribute('class', 'title');

    span.appendChild(text);
    content.appendChild(span);

    this.view = document.createElement('div');
    this.view.setAttribute('class', 'container');
    this.view.setAttribute('id', 'container');
    this.view.appendChild(content);
    this.view.appendChild(table.view);
  }
}

      // <div id="button" class="button">
      //   <span>Click to play</span>
      // </div>
