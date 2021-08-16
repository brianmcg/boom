import { astarSearch, heuristics } from './helpers';
import Graph from './components/Graph';

const search = (graph, start, end) => astarSearch(
  graph,
  start,
  end,
  { heuristic: heuristics.diagonal },
);

export {
  /**
   * Class representing a traversable graph.
   */
  Graph,
  /**
   * Find a path between two graph node.
   */
  search,
};
