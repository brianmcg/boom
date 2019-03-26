export default class Button {
  constructor(buttonText) {
    this.view = document.createElement('div');
    this.view.setAttribute('class', 'button');
    this.view.setAttribute('ìd', 'button');

    const span = document.createElement('span');
    const text = document.createTextNode(buttonText);

    span.appendChild(text);
    this.view.appendChild(span);
  }

  addEventListener(...options) {
    this.view.addEventListener(...options);
  }
}
