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
   * Nothing stored yet gives `null`, which `JSON.parse` coerces to the string
   * "null" and parses back to `null` — hence the `??`. Malformed contents
   * throw, as they always have.
   */
  static data(): Record<string, unknown> {
    return JSON.parse(localStorage.getItem(KEY)!) ?? {};
  }
}
