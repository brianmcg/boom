const KEY = 'data';

export default class LocalStorage {
  static get(key) {
    const data = LocalStorage.data();
    return data[key];
  }

  static set(key, value) {
    const data = LocalStorage.data();
    localStorage.setItem(KEY, JSON.stringify({ ...data, key: value }));
  }

  static data() {
    return JSON.parse(localStorage.getItem(KEY)) ?? {};
  }
}
