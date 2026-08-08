import { astarSearch } from './utils/astarSearch';
import { manhattan, diagonal } from './utils/heuristics';
import Graph from './components/Graph';
import type GridNode from './components/GridNode';

const search = (graph: Graph, start: GridNode, end: GridNode): GridNode[] =>
  astarSearch(graph, start, end, {
    heuristic: graph.diagonal ? diagonal : manhattan,
  });

export { Graph, search };
