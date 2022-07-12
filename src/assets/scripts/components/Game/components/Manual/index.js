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
        action: translate('manual.action.strafe.left'),
        key: translate('manual.input.strafe.left'),
      }, {
        action: translate('manual.action.strafe.right'),
        key: translate('manual.input.strafe.right'),
      }, {
        action: translate('manual.action.turn.left'),
        key: translate('manual.input.turn.left'),
      }, {
        action: translate('manual.action.turn.right'),
        key: translate('manual.input.turn.right'),
      }, {
        action: translate('manual.action.use'),
        key: translate('manual.input.space'),
      }, {
        action: translate('manual.action.attack'),
        key: translate('manual.input.mouse.left'),
      }, {
        action: translate('manual.action.boot'),
        key: translate('manual.input.mouse.right'),
      }, {
        action: translate('manual.action.weapon'),
        key: translate('manual.input.weapon'),
      }, {
        action: translate('manual.action.pause'),
        key: translate('manual.input.pause'),
      }, {
        action: translate('manual.action.menu.nav'),
        key: translate('manual.input.menu.nav'),
      }, {
        action: translate('manual.action.menu.select'),
        key: translate('manual.input.menu.select'),
      }],
    });

    content.setAttribute('class', 'content');
    span.setAttribute('class', 'title');

    this.button = new Button(translate('manual.play'));

    span.appendChild(text);
    content.appendChild(span);
    content.appendChild(table.view);
    content.appendChild(this.button.view);


    this.view = document.createElement('div');
    this.view.setAttribute('class', 'container');
    this.view.setAttribute('id', 'container');
    this.view.appendChild(content);
  }

  /**
   * Add a callback to the click start event.
   * @param  {Function} callback The callback function.
   */
  onClickStart(callback) {
    this.on(EVENTS.CLICK_START, callback);
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

export default GameManual;
