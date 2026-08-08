/** A callback bound to a press or a release. */
export type BindingCallback = () => void;

/**
 * What one pressable control — a key or a mouse button — has bound to it.
 *
 * Shared rather than duplicated: `Key` and `Button` were identical, down to
 * the field names. `Keyboard` and `Mouse` keep their own maps and their own
 * name constants, which is where the two genuinely differ.
 */
export default class Binding {
  downCallback?: BindingCallback;

  upCallback?: BindingCallback;

  onDown(callback: BindingCallback) {
    this.downCallback = callback;
  }

  onUp(callback: BindingCallback) {
    this.upCallback = callback;
  }
}
