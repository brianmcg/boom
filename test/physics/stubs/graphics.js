// Minimal stand-in for the pixi.js EventEmitter re-export; physics only ever
// calls on() and removeAllListeners().
export class EventEmitter {
  constructor() {
    this._events = {};
  }

  on(name, fn) {
    (this._events[name] ||= []).push(fn);
    return this;
  }

  emit(name, ...args) {
    (this._events[name] || []).forEach(fn => fn(...args));
    return this;
  }

  removeAllListeners() {
    this._events = {};
    return this;
  }
}
