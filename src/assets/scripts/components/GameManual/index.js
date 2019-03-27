import './styles/index.scss';
import { KEYS, TITLE, BUTTON_TEXT } from './constants';
import Table from './components/Table';
import Button from './components/Button';

const EVENTS = {
  CLICK_START: 'manual:button:click',
};

/**
 * Class representing a game manual.
 */
export default class GameManual {
  /**
   * The events class property.
   */
  static get EVENTS() { return EVENTS; }

  /**
   * Creates a game manual.
   */
  constructor() {
    const content = document.createElement('div');
    const span = document.createElement('span');
    const text = document.createTextNode(TITLE);
    const table = new Table(KEYS);

    content.setAttribute('class', 'content');
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

  /**
   * Adds an event listener to the game manual.
   * @param  {Event}    event    The event to add.
   * @param  {Function} callback The callback to trigger.
   */
  on(event, callback) {
    const [, nodeName, eventName] = event.split(':');
    this[nodeName].view.addEventListener(eventName, callback);
  }
}
