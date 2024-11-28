import translate from '@util/translate';
import AbstractItem from './AbstractItem';

export default class WeaponItem extends AbstractItem {
  constructor({ weapon, ...other }) {
    super(other);

    this.weapon = weapon;
    this.isWeapon = true;
    this.title = translate(`world.item.${weapon}`);
    this.scale = 0.75;
  }
}
