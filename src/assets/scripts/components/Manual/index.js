import translate from 'root/translate';
import './styles/index.scss';
import Table from './components/Table';
import Button from './components/Button';

const EVENTS = {
  CLICK_START: 'manual:button:click',
};

/**
 * Class representing a game manual.
 */
class GameManual {
  /**
   * Creates a game manual.
   */
  constructor() {
    const content = document.createElement('div');
    const span = document.createElement('span');
    const text = document.createTextNode(translate('manual.title'));
    const table = new Table({
      cols: [
        'action',
        'key',
      ],
      rows: [{
        action: translate('manual.action.forward'),
        key: translate('manual.input.up'),
      }, {
        action: translate('manual.action.backward'),
        key: translate('manual.input.down'),
      }, {
        action: translate('manual.action.left'),
        key: translate('lmanual.input.left'),
      }, {
        action: translate('manual.action.right'),
        key: translate('manual.input.right'),
      }, {
        action: translate('manual.action.use'),
        key: translate('manual.input.space'),
      }, {
        action: translate('manual.action.attack'),
        key: translate('manual.input.ctrl'),
      }, {
        action: translate('manual.action.crouch'),
        key: translate('manual.input.shift'),
      }, {
        action: translate('manual.action.strafe'),
        key: translate('manual.input.alt'),
      }, {
        action: translate('manual.action.menu'),
        key: translate('manual.input.escape'),
      }],
    });

    content.setAttribute('class', 'content');
    span.setAttribute('class', 'title');

    span.appendChild(text);
    content.appendChild(span);

    this.button = new Button(translate('manual.play'));

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

  /**
   * The events class property.
   */
  static get EVENTS() {
    return EVENTS;
  }
}

export default GameManual;
