import { EventEmitter } from '@game/core/graphics';

const EVENTS = {
  EQUIP: 'key:card:equip',
  USE: 'ley:card:use',
};

class KeyCard extends EventEmitter {
  constructor(color) {
    super();

    this.equiped = false;
    this.color = color;
  }

  equip() {
    this.equiped = true;
    this.emit(EVENTS.EQUIP);
  }

  use() {
    this.emit(EVENTS.USE);
  }

  onEquipEvent(callback) {
    this.on(EVENTS.EQUIP, callback);
  }

  onUseEvent(callback) {
    this.on(EVENTS.USE, callback);
  }

  isEquiped() {
    return this.equiped;
  }
}

export default KeyCard;
