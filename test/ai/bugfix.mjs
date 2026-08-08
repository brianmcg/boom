// Asserts a deliberate divergence from the baseline.
//
// equivalence.mjs must report IDENTICAL, so anything that changes behaviour on
// purpose has to be excluded from it and pinned here instead, the same way
// test/physics/bugfix.mjs works. This suite fails if the baseline stops being
// wrong or the live module stops being right.
//
// BinaryHeap.remove had an off-by-one in the check that decides whether the
// pop already removed the target:
//
//   if (i !== this.content.length - 1)   // wrong
//   if (i !== this.content.length)       // right
//
// `content.length` is read after the pop, so it is already the index the
// popped element occupied. Comparing against `length - 1` is wrong at the two
// highest indices, in opposite directions.
import OldHeap from '@baseline-heap';
import NewHeap from '@live-heap';

const score = e => e.f;

const build = (Heap, scores) => {
  const heap = new Heap(score);
  const items = scores.map((f, id) => ({ id, f }));
  items.forEach(item => heap.push(item));
  return { heap, items };
};

const idsIn = heap =>
  heap.content
    .map(e => e && e.id)
    .sort((a, b) => a - b)
    .join(',');

const expectedIds = (items, victim) =>
  items
    .map(i => i.id)
    .filter(id => id !== victim.id)
    .sort((a, b) => a - b)
    .join(',');

// Parent of k is ((k + 1) >> 1) - 1, matching sinkDown.
const heapPropertyHolds = heap => {
  for (let k = 1; k < heap.content.length; k++) {
    const parent = ((k + 1) >> 1) - 1;
    if (score(heap.content[parent]) > score(heap.content[k])) return false;
  }
  return true;
};

const failures = [];
const fail = msg => failures.push(msg);

// 1. The two positions the baseline gets wrong, named explicitly so the suite
//    documents the shape of the bug rather than just its absence.
{
  const SCORES = [5, 3, 8, 1, 9, 2];

  for (const [label, offset] of [
    ['last', 1],
    ['second-to-last', 2],
  ]) {
    const old = build(OldHeap, SCORES);
    const victim = old.heap.content[old.heap.content.length - offset];
    const want = expectedIds(old.items, victim);
    old.heap.remove(victim);

    if (idsIn(old.heap) === want) {
      fail(
        `baseline is no longer wrong at the ${label} index — if the baseline ` +
          `SHA moved, this suite is meaningless`
      );
    }

    const live = build(NewHeap, SCORES);
    const target = live.heap.content[live.heap.content.length - offset];
    const expected = expectedIds(live.items, target);
    live.heap.remove(target);

    if (idsIn(live.heap) !== expected) {
      fail(
        `remove at the ${label} index is still wrong\n` +
          `      got      ${idsIn(live.heap)}\n` +
          `      expected ${expected}`
      );
    }
  }
}

// 2. Every index of every size, contents and heap property.
let checked = 0;

const rnd = (
  s => () =>
    ((s = Math.imul(s ^ (s >>> 15), 1 | s)) >>> 0) / 2 ** 32
)(0x5bf03635);

for (let n = 2; n <= 14; n++) {
  for (let target = 0; target < n; target++) {
    const scores = Array.from({ length: n }, () => Math.floor(rnd() * 50));
    const { heap, items } = build(NewHeap, scores);
    const victim = heap.content[target];
    const expected = expectedIds(items, victim);

    heap.remove(victim);
    checked++;

    if (idsIn(heap) !== expected) {
      fail(
        `size ${n}, index ${target}: contents wrong\n` +
          `      got      ${idsIn(heap)}\n` +
          `      expected ${expected}`
      );
    } else if (!heapPropertyHolds(heap)) {
      fail(`size ${n}, index ${target}: heap property broken after remove`);
    }
  }
}

// 3. Removing something the heap never held. The baseline pops regardless of
//    whether indexOf found anything, so a foreign node silently deleted a real
//    member — no exception, just one element short.
{
  const SCORES = [5, 3, 8, 1, 9];
  const foreign = { id: 99, f: 4 };

  const old = build(OldHeap, SCORES);
  const oldBefore = idsIn(old.heap);
  old.heap.remove(foreign);

  if (idsIn(old.heap) === oldBefore) {
    fail(
      'baseline no longer loses an element on a not-found remove — if the ' +
        'baseline SHA moved, this assertion is meaningless'
    );
  }

  const live = build(NewHeap, SCORES);
  const before = idsIn(live.heap);
  live.heap.remove(foreign);

  if (idsIn(live.heap) !== before) {
    fail(
      `not-found remove changed the heap\n` +
        `      got      ${idsIn(live.heap)}\n` +
        `      expected ${before}`
    );
  }

  // Also harmless on an empty heap, which the baseline happened to get right.
  const empty = new NewHeap(score);
  try {
    empty.remove(foreign);
  } catch (e) {
    fail(`remove on an empty heap threw: ${e.message}`);
  }
  if (empty.size() !== 0) fail('remove on an empty heap changed its size');
}

// 4. A heap stays drainable in score order after a removal — the property
//    astarSearch would actually depend on if it ever called remove.
{
  const { heap } = build(NewHeap, [9, 4, 7, 1, 12, 3, 8, 5]);
  heap.remove(heap.content[3]);

  const drained = [];
  while (heap.size() > 0) drained.push(score(heap.pop()));

  const sorted = [...drained].sort((a, b) => a - b);
  if (drained.join(',') !== sorted.join(',')) {
    fail(`drain after remove was not in score order: ${drained.join(',')}`);
  }
}

console.log(`  removals checked: ${checked} (sizes 2-14, every index)`);

if (failures.length) {
  console.log(`\n  FAIL (${failures.length}):\n`);
  for (const f of failures) console.log(`    ${f}\n`);
  process.exit(1);
}

console.log('\n  ALL PASS');
