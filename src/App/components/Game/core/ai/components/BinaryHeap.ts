/**
 * A min-heap ordered by a caller-supplied score.
 *
 * Generic because a heap is: nothing here reads anything about `T` except
 * through `scoreFunction`. `astarSearch` is the only user and orders
 * {@link GridNode} by `f`.
 */
export default class BinaryHeap<T> {
  private readonly content: T[] = [];

  private readonly scoreFunction: (element: T) => number;

  constructor(scoreFunction: (element: T) => number) {
    this.scoreFunction = scoreFunction;
  }

  push(element: T) {
    // Add the new element to the end of the array.
    this.content.push(element);

    // Allow it to sink down.
    this.sinkDown(this.content.length - 1);
  }

  pop(): T | undefined {
    // Store the first element so we can return it later.
    const result = this.content[0];
    // Get the element at the end of the array.
    const end = this.content.pop();
    // If there are any elements left, put the end element at the
    // start, and let it bubble up.
    if (this.content.length > 0) {
      // Still non-empty after the pop means there were at least two elements,
      // so `end` is a real one. `Array.pop`'s type cannot express that.
      this.content[0] = end as T;
      this.bubbleUp(0);
    }

    return result;
  }

  remove(node: T) {
    const i = this.content.indexOf(node);

    // Absent: nothing to remove. Without this the pop below still runs, and
    // since `indexOf` returned -1 the fill-the-hole branch writes to index -1
    // — a plain property, not an element — so the popped element is simply
    // lost. Removing something the heap never held silently deleted a real
    // member instead, without throwing.
    if (i === -1) {
      return;
    }

    // When it is found, the process seen in 'pop' is repeated
    // to fill up the hole.
    const end = this.content.pop();

    // `content.length` is already the index the popped element occupied, so
    // `i === length` means `node` was the last element and the pop above has
    // finished the job. Comparing against `length - 1`, as this did until
    // 2026-08-08, is off by one in both directions: it re-added the last
    // element, and it skipped the fill for the second-to-last, which left
    // `node` in place and silently discarded `end` instead.
    if (i !== this.content.length) {
      this.content[i] = end as T;

      if (this.scoreFunction(end as T) < this.scoreFunction(node)) {
        this.sinkDown(i);
      } else {
        this.bubbleUp(i);
      }
    }
  }

  size(): number {
    return this.content.length;
  }

  rescoreElement(node: T) {
    this.sinkDown(this.content.indexOf(node));
  }

  private sinkDown(n: number) {
    // Fetch the element that has to be sunk.
    const element = this.content[n];
    const elemScore = this.scoreFunction(element);

    // When at 0, an element can not sink any further.
    while (n > 0) {
      // Compute the parent element's index, and fetch it.
      const parentN = ((n + 1) >> 1) - 1;
      const parent = this.content[parentN];
      // Swap the elements if the parent is greater.
      if (elemScore < this.scoreFunction(parent)) {
        this.content[parentN] = element;
        this.content[n] = parent;
        // Update 'n' to continue at the new position.
        n = parentN;
      } else {
        break;
      }
    }
  }

  private bubbleUp(n: number) {
    // Look up the target element and its score.
    const { length } = this.content;
    const element = this.content[n];
    const elemScore = this.scoreFunction(element);

    while (true) {
      // Compute the indices of the child elements.
      const child2N = (n + 1) << 1;
      const child1N = child2N - 1;
      // This is used to store the new position of the element, if any.
      let swap = null;
      // Initialised only to satisfy definite assignment. It is read solely in
      // the `swap === null ? ... : child1Score` arm below, which is reachable
      // only once the branch that assigns it has run, so the 0 never surfaces.
      let child1Score = 0;
      // If the first child exists (is inside the array)...
      if (child1N < length) {
        // Look it up and compute its score.
        const child1 = this.content[child1N];
        child1Score = this.scoreFunction(child1);

        // If the score is less than our element's, we need to swap.
        if (child1Score < elemScore) {
          swap = child1N;
        }
      }

      // Do the same checks for the other child.
      if (child2N < length) {
        const child2 = this.content[child2N];
        const child2Score = this.scoreFunction(child2);
        if (child2Score < (swap === null ? elemScore : child1Score)) {
          swap = child2N;
        }
      }

      // If the element needs to be moved, swap it, and continue.
      if (swap !== null) {
        this.content[n] = this.content[swap];
        this.content[swap] = element;
        n = swap;
      } else {
        break;
      }
    }
  }
}
