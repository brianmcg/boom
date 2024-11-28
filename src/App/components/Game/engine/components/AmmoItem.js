import translate from '@util/translate';
import AbstractItem from './AbstractItem';

export default class AmmoItem extends AbstractItem {
  constructor({ amount = 0, weapon, ...other }) {
    super(other);

    this.amount = amount;
    this.weapon = weapon;
    this.isAmmo = true;
    this.title = translate('world.item.ammo', {
      weapon: translate(`world.item.${weapon}`),
    });
  }
}
