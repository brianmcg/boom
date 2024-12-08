import { default as StatsJS } from 'stats.js';
import StatsView from './StatsView';

export default class Stats extends StatsJS {
  constructor() {
    super();
    this.view = new StatsView({ child: this.dom });
  }

  showFPS() {
    this.showPanel(0);
  }

  showMS() {
    this.showPanel(1);
  }

  showMB() {
    this.showPanel(2);
  }
}
