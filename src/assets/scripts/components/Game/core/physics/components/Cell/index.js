import Body from '../Body';

/**
 * Creates a cell
 * @extends {Body}
 */
class Cell extends Body {
  /**
   * Creates a cell
   * @param  {Number}  options.x         The x coordinate of the cell.
   * @param  {Number}  options.y         The y coordinate of the cell
   * @param  {Number}  options.width     The width of the cell.
   * @param  {Number}  options.height    The height of the cell.
   * @param  {Boolean} options.blocking  Is the cell blocking.
   */
  constructor(options) {
    super(options);
    this.bodies = [];
  }

  /**
   * Add a body.
   * @param {Body} body The body to add.
   */
  add(body) {
    this.bodies.push(body);
  }

  /**
   * Remove a body.
   * @param  {Body} body The body to remove.
   */
  remove(body) {
    this.bodies = this.bodies.filter(b => b.id !== body.id);
  }
}

export default Cell;
