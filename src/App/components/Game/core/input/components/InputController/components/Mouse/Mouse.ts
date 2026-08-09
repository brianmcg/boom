import { MOUSE_SENSITIVITY } from '@constants/config';
import Binding from '../Binding';
import { BUTTON_CODES } from './constants';

/** Receives the horizontal movement of a locked pointer, already scaled. */
export type MoveCallback = (x: number) => void;

/** Receives the sign of a wheel movement, -1 or 1. */
export type WheelCallback = (y: number) => void;

export default class Mouse {
  private buttons: Record<string, Binding> = {};

  private readonly el: HTMLElement;

  moveCallback?: MoveCallback;

  wheelCallback?: WheelCallback;

  constructor(el: HTMLElement, moveSensitivity: number = MOUSE_SENSITIVITY) {
    const onMouseMove = (e: MouseEvent) => {
      const x = moveSensitivity * (e.movementX ?? 0);
      this?.moveCallback?.(x);
    };

    const onMouseDown = (e: MouseEvent) => {
      const button = this.buttons[BUTTON_CODES[e.button] as string];
      button?.downCallback?.();
    };

    const onMouseUp = (e: MouseEvent) => {
      const button = this.buttons[BUTTON_CODES[e.button] as string];
      button?.upCallback?.();
    };

    const onWheel = (e: WheelEvent) => {
      this.wheelCallback?.(Math.sign(e.deltaY));
    };

    const onChange = () => {
      if (this.isPointerLocked()) {
        document.addEventListener('mousemove', onMouseMove, false);
        document.addEventListener('mousedown', onMouseDown, false);
        document.addEventListener('mouseup', onMouseUp, false);
        document.addEventListener('wheel', onWheel, false);
      } else {
        document.removeEventListener('mousemove', onMouseMove, false);
        document.removeEventListener('mousedown', onMouseDown, false);
        document.removeEventListener('mouseup', onMouseUp, false);
        document.removeEventListener('wheel', onWheel, false);
      }
    };

    document.addEventListener('pointerlockchange', onChange, false);

    this.buttons = {};
    this.el = el;
  }

  onMove(callback: MoveCallback) {
    this.moveCallback = callback;
  }

  onWheel(callback: WheelCallback) {
    this.wheelCallback = callback;
  }

  get(name: string): Binding {
    if (this.buttons[name]) {
      return this.buttons[name];
    }

    this.buttons[name] = new Binding();

    return this.buttons[name];
  }

  lockPointer() {
    if (!this.isPointerLocked()) {
      return this.el.requestPointerLock();
    }

    return Promise.resolve();
  }

  unlockPointer() {
    if (this.isPointerLocked()) {
      document.exitPointerLock();
    }
  }

  isPointerLocked(): boolean {
    return document.pointerLockElement === this.el;
  }

  removeCallbacks() {
    this.buttons = {};
    this.moveCallback = undefined;
    this.wheelCallback = undefined;
  }
}
