export const BUTTONS = {
  LEFT: 'LEFT',
  MIDDLE: 'MIDDLE',
  RIGHT: 'RIGHT',
} as const;

/** A mouse button a caller may bind. */
export type ButtonName = (typeof BUTTONS)[keyof typeof BUTTONS];

/**
 * `MouseEvent.button` to the name callers bind against. A code with no entry
 * — the back and forward buttons of a five-button mouse — yields `undefined`,
 * which binds nothing.
 */
export const BUTTON_CODES: Record<number, ButtonName | undefined> = {
  0: BUTTONS.LEFT,
  1: BUTTONS.MIDDLE,
  2: BUTTONS.RIGHT,
};
