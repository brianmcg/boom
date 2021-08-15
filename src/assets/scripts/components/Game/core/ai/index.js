import { Graph, astar } from 'javascript-astar';

const search = (graph, start, end) => {
  graph.init();

  return astar.search(
    graph,
    start,
    end,
    { heuristic: astar.heuristics.diagonal },
  );
};

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
