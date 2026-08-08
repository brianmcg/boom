export const KEYS = {
  ALT: 'ALT',
  LEFT_ARROW: 'LEFT_ARROW',
  RIGHT_ARROW: 'RIGHT_ARROW',
  UP_ARROW: 'UP_ARROW',
  DOWN_ARROW: 'DOWN_ARROW',
  SPACE: 'SPACE',
  CTRL: 'CTRL',
  SHIFT: 'SHIFT',
  ENTER: 'ENTER',
  NUM_1: 'NUM_1',
  NUM_2: 'NUM_2',
  NUM_3: 'NUM_3',
  NUM_4: 'NUM_4',
  NUM_5: 'NUM_5',
  PG_UP: 'PG_UP',
  PG_DOWN: 'PG_DOWN',
  END: 'END',
  PERIOD: 'PERIOD',
  COMMA: 'COMMA',
  W: 'W',
  A: 'A',
  S: 'S',
  D: 'D',
  E: 'E',
  Q: 'Q',
} as const;

/** A key a caller may bind. */
export type KeyName = (typeof KEYS)[keyof typeof KEYS];

/**
 * `KeyboardEvent.keyCode` to the name callers bind against.
 *
 * The `undefined` at 27 is not a typo, and is a defect being preserved rather
 * than fixed: this read `27: KEYS.ESC` in JavaScript, and `KEYS` has never had
 * an `ESC` member, so the entry has always evaluated to `undefined`. Escape
 * therefore looks up `keys['undefined']`, which nothing ever binds. Written out
 * literally here because `KEYS.ESC` does not compile once `KEYS` is typed.
 */
export const KEY_CODES: Record<number, KeyName | undefined> = {
  18: KEYS.ALT,
  37: KEYS.LEFT_ARROW,
  39: KEYS.RIGHT_ARROW,
  38: KEYS.UP_ARROW,
  40: KEYS.DOWN_ARROW,
  32: KEYS.SPACE,
  17: KEYS.CTRL,
  16: KEYS.SHIFT,
  27: undefined,
  13: KEYS.ENTER,
  49: KEYS.NUM_1,
  50: KEYS.NUM_2,
  51: KEYS.NUM_3,
  52: KEYS.NUM_4,
  53: KEYS.NUM_5,
  105: KEYS.PG_UP,
  99: KEYS.PG_DOWN,
  97: KEYS.END,
  188: KEYS.COMMA,
  190: KEYS.PERIOD,
  87: KEYS.W,
  83: KEYS.S,
  65: KEYS.A,
  68: KEYS.D,
  69: KEYS.E,
  81: KEYS.Q,
};
