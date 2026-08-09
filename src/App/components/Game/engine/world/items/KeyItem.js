import translate from '@util/translate';
import AbstractItem from './AbstractItem';

export default class KeyItem extends AbstractItem {
  constructor({ color, ...other }) {
    super(other);

    this.color = color;
    this.isKey = true;
    this.title = translate('world.item.key', {
      color: translate(`world.color.${color}`),
    });
  }
}
