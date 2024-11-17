/**
 * @module  game/core/ai
 */

import { astarSearch } from './helpers';
import { manhattan, diagonal } from './heuristics';
import Graph from './components/Graph';

const search = (graph, start, end) =>
  astarSearch(graph, start, end, {
    heuristic: graph.diagonal ? diagonal : manhattan,
  });

export { Graph, search };
