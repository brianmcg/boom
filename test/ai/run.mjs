// Runs the core/ai refactor harness.
//
// Same shape as test/physics/run.mjs: the baseline is the pre-migration JS,
// extracted from git rather than checked in, so there is no copy of deleted
// code in the tree and the oracle is pinned to a SHA you can go and read.
//
//   node test/ai/run.mjs
//
// esbuild resolves the `@game/*` aliases and compiles the TypeScript. It comes
// in with Vite rather than being a direct dependency.
//
// This duplicates ~60 lines of test/physics/run.mjs on purpose. Two instances
// is not enough to know which parts of it are the general shape and which are
// specific to physics (the three-suite split, the stub aliases for Pixi and
// Howler, the divergence bookkeeping — none of which apply here). If a third
// module needs a harness, factor it out then, with three examples to aim at.

import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..');
const AI = 'src/App/components/Game/core/ai';

/**
 * The commit the baseline is taken from: "Write down how to migrate a module,
 * from doing physics once", the last state in which core/ai was plain
 * JavaScript.
 *
 * A divergence here means the migration changed behaviour. Do not advance this
 * SHA to silence a failure — the whole point is that it predates the work.
 */
const BASELINE_SHA = '923a9320';

const BASELINE_FILES = [
  'index.js',
  'helpers.js',
  'heuristics.js',
  'components/Graph.js',
  'components/GridNode.js',
  'components/BinaryHeap.js',
];

const OUT = join(HERE, '.out');
const BASELINE = join(OUT, 'baseline');

function extractBaseline() {
  rmSync(OUT, { recursive: true, force: true });

  for (const file of BASELINE_FILES) {
    const source = execFileSync(
      'git',
      ['show', `${BASELINE_SHA}:${AI}/${file}`],
      { cwd: REPO, encoding: 'utf8', maxBuffer: 1024 * 1024 }
    );

    const target = join(BASELINE, file);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, source);
  }
}

// The live module is whichever of index.js / index.ts is present, so the
// harness runs unchanged before, during and after the conversion.
function liveEntry(rel) {
  const ts = join(REPO, AI, `${rel}.ts`);
  return existsSync(ts) ? ts : join(REPO, AI, `${rel}.js`);
}

async function bundle(name) {
  const outfile = join(OUT, `${name}.bundle.mjs`);

  await build({
    entryPoints: [join(HERE, `${name}.mjs`)],
    outfile,
    bundle: true,
    format: 'esm',
    platform: 'node',
    logLevel: 'warning',
    alias: {
      '@baseline': join(BASELINE, 'index.js'),
      '@baseline-heap': join(BASELINE, 'components/BinaryHeap.js'),
      '@live': liveEntry('index'),
      '@live-heap': liveEntry('components/BinaryHeap'),
    },
  });

  return outfile;
}

extractBaseline();

let failed = false;

// equivalence must report IDENTICAL; bugfix asserts the one place the live
// module is deliberately not identical.
for (const suite of ['equivalence', 'bugfix']) {
  console.log(`\n--- ${suite} (baseline ${BASELINE_SHA}) ---`);

  try {
    execFileSync(process.execPath, [await bundle(suite)], { stdio: 'inherit' });
  } catch {
    failed = true;
  }
}

process.exit(failed ? 1 : 0);
