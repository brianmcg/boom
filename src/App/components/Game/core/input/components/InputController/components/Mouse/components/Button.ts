/** A callback bound to a mouse button press or release. */
export type ButtonCallback = () => void;

export default class Button {
  downCallback?: ButtonCallback;

  upCallback?: ButtonCallback;

  onDown(callback: ButtonCallback) {
    this.downCallback = callback;
  }

  onUp(callback: ButtonCallback) {
    this.upCallback = callback;
  }
}
