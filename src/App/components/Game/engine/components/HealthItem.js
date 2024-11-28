import translate from '@util/translate';
import { HEALTH_MODIFIER } from '@constants/config';
import AbstractItem from './AbstractItem';

export default class HealthItem extends AbstractItem {
  constructor({ amount = 0, ...other }) {
    super(other);

    this.amount = amount * HEALTH_MODIFIER;
    this.isHealth = true;
    this.title = translate('world.item.health');
  }
}
