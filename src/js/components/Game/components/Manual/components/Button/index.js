/**
 * Class representing a button.
 */
class Button {
  /**
   * Creates a button.
   * @param  {String} buttonText The button text.
   */
  constructor(buttonText = '') {
    const span = document.createElement('span');
    const text = document.createTextNode(buttonText);

    span.appendChild(text);

    this.view = document.createElement('div');
    this.view.setAttribute('class', 'button');
    this.view.setAttribute('ìd', 'button');
    this.view.appendChild(span);
  }

  /**
   * Adds an event lister to the button.
   * @param {Event}    event    The event to listen for.
   * @param {Function} callback The callback to execute.
   */
  addEventListener(event, callback) {
    this.view.addEventListener(event, callback);
  }
}

export default Button;
