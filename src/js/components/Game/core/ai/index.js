import { astarSearch } from './helpers';
import { manhattan, diagonal } from './heuristics';
import Graph from './components/Graph';

const search = (graph, start, end) => astarSearch(
  graph,
  start,
  end,
  {
    heuristic: graph.diagonal ? diagonal : manhattan,
  },
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
