import Body from '../Body';

export default class Sector extends Body {
  constructor(options) {
    super(options);
    this.childIds = [];
  }

  addChildId(id) {
    this.childIds.push(id);
  }

  removeChildId(id) {
    this.childIds = this.childIds.filter(childId => childId !== id);
  }
}
