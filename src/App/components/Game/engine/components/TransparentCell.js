import Cell from './Cell';

/**
 * A cell rays pass through. `transparency` is a plain `Cell` option, so this
 * class adds no behaviour of its own — it exists as a type, for the
 * `instanceof` checks that decide what a body may walk into.
 */
export default class TransparentCell extends Cell {}
