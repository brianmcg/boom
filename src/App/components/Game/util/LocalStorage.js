export default class LocalStorage {
  static get(key) {
    return JSON.parse(localStorage.getItem(key));
  }

  static set(key, options) {
    localStorage.setItem(key, JSON.stringify(options));
  }
}
