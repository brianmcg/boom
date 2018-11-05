class Entity {
  constructor(props) {
    Object.assign(this, {
      x: 0,
      y: 0,
      ...props,
    });
  }
}

export default Entity;
