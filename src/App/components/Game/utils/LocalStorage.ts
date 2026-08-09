const KEY = 'data';

export default class LocalStorage {
  static get(key: string): unknown {
    const data = LocalStorage.data();

    return data[key];
  }

  static set(key: string, value: unknown) {
    const data = LocalStorage.data();

    localStorage.setItem(KEY, JSON.stringify({ ...data, [key]: value }));
  }

  /**
   * Everything saved so far, or nothing.
   *
   * Unreadable contents are reported and discarded rather than thrown: this is
   * on the way to the title screen, and every write reads before it writes, so
   * throwing here stops the game starting at all until storage is cleared by
   * hand. Losing a corrupt save is the smaller failure.
   */
  static data(): Record<string, unknown> {
    const stored = localStorage.getItem(KEY);

    if (!stored) {
      return {};
    }

    try {
      return JSON.parse(stored) ?? {};
    } catch (e) {
      // The whole error, not `e.message`: a catch parameter is `unknown` under
      // strict, and narrowing it to read one field would cost more than it
      // says. `Game.showScene` logs the message only.
      console.error('ERROR', e);

      return {};
    }
  }
}
