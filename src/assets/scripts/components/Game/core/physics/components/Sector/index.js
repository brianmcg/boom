import Body from '../Body';

/**
 * Creates a sector
 * @extends {Body}
 */
class Sector extends Body {
  /**
   * Creates a sector
   * @param  {Number}  options.x         The x coordinate of the sector.
   * @param  {Number}  options.y         The y coordinate of the sector
   * @param  {Number}  options.width     The width of the sector.
   * @param  {Number}  options.length    The length of the sector.
   * @param  {Number}  options.height    The height of the sector.
   * @param  {Boolean} options.blocking  Is the sector blocking.
   */
  constructor(options) {
    super(options);
    this.bodies = [];
  }

  /**
   * Add a body to the child list.
   * @param {Body} body The body to add.
   */
  add(body) {
    this.bodies.push(body);
  }

  /**
   * Remove a body from the child list.
   * @param  {Body} body The body to remove.
   */
  remove(body) {
    this.bodies = this.bodies.filter(b => b.id !== body.id);
  }
}

export default Sector;
