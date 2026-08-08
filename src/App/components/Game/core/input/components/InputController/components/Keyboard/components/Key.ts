/** A callback bound to a key press or release. */
export type KeyCallback = () => void;

export default class Key {
  downCallback?: KeyCallback;

  upCallback?: KeyCallback;

  onDown(callback: KeyCallback) {
    this.downCallback = callback;
  }

  onUp(callback: KeyCallback) {
    this.upCallback = callback;
  }
}
