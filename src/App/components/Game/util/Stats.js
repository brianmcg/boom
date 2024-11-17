import { default as StatsJS } from 'stats.js';

export default class Stats extends StatsJS {
  constructor() {
    super();
    this.view = this.dom;
  }
}
