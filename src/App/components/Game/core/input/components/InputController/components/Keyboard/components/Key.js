export default class Key {
  onDown(callback) {
    this.downCallback = callback;
  }

  onUp(callback) {
    this.upCallback = callback;
  }
}
