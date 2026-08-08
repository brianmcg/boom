import { MOUSE_SENSITIVITY } from '@constants/config';
import Button from './components/Button';
import { BUTTON_CODES } from './constants';

/**
 * The vendor-prefixed pointer-lock and movement APIs this module still reaches
 * for. None are in `lib.dom`, because all three were superseded years before
 * the versions of Chrome, Firefox and Safari that can run this game.
 *
 * They are typed rather than removed: dropping them is a behaviour change, not
 * a conversion. Each borrows the standard member's own type so the fallbacks
 * cannot drift from what they are standing in for.
 */
interface VendorMouseEvent extends MouseEvent {
  mozMovementX?: number;
  webkitMovementX?: number;
}

interface VendorElement extends HTMLElement {
  mozRequestPointerLock?: HTMLElement['requestPointerLock'];
  webkitRequestPointerLock?: HTMLElement['requestPointerLock'];
}

interface VendorDocument extends Document {
  mozExitPointerLock?: Document['exitPointerLock'];
  webkitExitPointerLock?: Document['exitPointerLock'];
  mozPointerLockElement?: Document['pointerLockElement'];
  webkitPointerLockElement?: Document['pointerLockElement'];
}

/** Receives the horizontal movement of a locked pointer, already scaled. */
export type MoveCallback = (x: number) => void;

/** Receives the sign of a wheel movement, -1 or 1. */
export type WheelCallback = (y: number) => void;

export default class Mouse {
  private buttons: Record<string, Button> = {};

  private readonly el: HTMLElement;

  moveCallback?: MoveCallback;

  wheelCallback?: WheelCallback;

  constructor(el: HTMLElement, moveSensitivity: number = MOUSE_SENSITIVITY) {
    const vendorDocument = document as VendorDocument;
    const vendorEl = el as VendorElement;

    const onMouseMove = (e: VendorMouseEvent) => {
      const x =
        moveSensitivity * e.movementX ||
        e.mozMovementX ||
        e.webkitMovementX ||
        0;

      if (this.moveCallback) {
        this.moveCallback(x);
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      const button = this.buttons[BUTTON_CODES[e.button] as string];

      if (button && button.downCallback) {
        button.downCallback();
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      const button = this.buttons[BUTTON_CODES[e.button] as string];

      if (button && button.upCallback) {
        button.upCallback();
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (this.wheelCallback) {
        this.wheelCallback(Math.sign(e.deltaY));
      }
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

    // Assigning the winning implementation onto the standard name, so the rest
    // of the class can call one thing. The cast is because the whole chain can
    // be undefined, which is what happens on a browser supporting none of them.
    el.requestPointerLock = (vendorEl.requestPointerLock ||
      vendorEl.mozRequestPointerLock ||
      vendorEl.webkitRequestPointerLock) as HTMLElement['requestPointerLock'];

    document.exitPointerLock = (vendorDocument.exitPointerLock ||
      vendorDocument.mozExitPointerLock ||
      vendorDocument.webkitExitPointerLock) as Document['exitPointerLock'];

    document.addEventListener('pointerlockchange', onChange, false);
    document.addEventListener('mozpointerlockchange', onChange, false);
    document.addEventListener('webkitpointerlockchange', onChange, false);

    this.buttons = {};
    this.el = el;
  }

  get(name: string): Button {
    if (this.buttons[name]) {
      return this.buttons[name];
    }

    this.buttons[name] = new Button();

    return this.buttons[name];
  }

  onMove(callback: MoveCallback) {
    this.moveCallback = callback;
  }

  onWheel(callback: WheelCallback) {
    this.wheelCallback = callback;
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
    const vendorDocument = document as VendorDocument;

    return (
      document.pointerLockElement === this.el ||
      vendorDocument.mozPointerLockElement === this.el ||
      vendorDocument.webkitPointerLockElement === this.el
    );
  }

  removeCallbacks() {
    this.buttons = {};
    delete this.moveCallback;
    delete this.wheelCallback;
  }
}
