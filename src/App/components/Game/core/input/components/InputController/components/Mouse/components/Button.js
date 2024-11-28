export default class Button {
  onDown(callback) {
    this.downCallback = callback;
  }

  onUp(callback) {
    this.upCallback = callback;
  }
}
