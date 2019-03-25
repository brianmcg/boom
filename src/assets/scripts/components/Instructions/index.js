import { KEYS, TITLE, BUTTON_TEXT } from './constants';
import Table from './components/Table';
import Button from './components/Button';

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

    this.button = new Button(BUTTON_TEXT);

    this.view = document.createElement('div');
    this.view.setAttribute('class', 'container');
    this.view.setAttribute('id', 'container');
    this.view.appendChild(content);
    this.view.appendChild(table.view);

    this.view.appendChild(this.button.view);
  }

  on(...options) {
    this.button.view.addEventHandler(...options);
  }
}
