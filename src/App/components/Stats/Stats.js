import { default as StatsJS } from 'stats.js';
import { SHOW_STATS } from '@constants/config';
import StatsView from './StatsView';

export default class Stats extends StatsJS {
  constructor() {
    super();
    this.view = new StatsView({ child: this.dom });
    this.showPanel(SHOW_STATS - 1);
  }
}
