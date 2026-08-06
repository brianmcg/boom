// Runs the physics refactor harnesses.
//
// Both suites compare the live `core/physics` module against a baseline: the
// last commit before the TypeScript migration. The baseline is extracted from
// git rather than checked in, so there is no copy of deleted code in the tree
// and the oracle is pinned to a SHA you can go and read.
//
//   node test/physics/run.mjs           run both suites
//   node test/physics/run.mjs bugfix    run one
//
// esbuild resolves the `@game/*` aliases and compiles the TypeScript. It comes
// in with Vite rather than being a direct dependency.

import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..');
const PHYSICS = 'src/App/components/Game/core/physics';

/**
 * The commit the baseline is taken from: the parent of 64a5c1f3 "Migrate
 * core/physics to TypeScript", i.e. the last state in which this module was
 * plain JavaScript.
 *
 * Two of these files contain bugs that 31126d83 fixed on purpose — bugfix.mjs
 * asserts the difference. Do not advance this SHA to silence a failure; a
 * divergence here means the refactor changed behaviour.
 */
const BASELINE_SHA = '0560ed04';

const BASELINE_FILES = [
  'index.js',
  'constants.js',
  'helpers.js',
  'components/Body.js',
  'components/Cell.js',
  'components/DynamicBody.js',
  'components/DynamicCell.js',
  'components/World.js',
];

const OUT = join(HERE, '.out');
const BASELINE = join(OUT, 'baseline');

function extractBaseline() {
  rmSync(OUT, { recursive: true, force: true });

  for (const file of BASELINE_FILES) {
    const source = execFileSync(
      'git',
      ['show', `${BASELINE_SHA}:${PHYSICS}/${file}`],
      { cwd: REPO, encoding: 'utf8', maxBuffer: 1024 * 1024 }
    );

    const target = join(BASELINE, file);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, source);
  }
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
      '@constants/config': join(HERE, 'stubs', 'config.js'),
      '@util/translate': join(HERE, 'stubs', 'translate.js'),
      '@game/core/audio': join(HERE, 'stubs', 'audio.js'),
      '@game/core/graphics': join(HERE, 'stubs', 'graphics.js'),
      '@game/core/physics': join(REPO, PHYSICS, 'index.ts'),
      '@engine': join(REPO, 'src/App/components/Game/engine/components'),
    },
  });

  return outfile;
}

// cell-contract asserts forward against what the map data means, so it needs
// no baseline; the other two compare against it.
const ALL_SUITES = ['equivalence', 'bugfix', 'cell-contract'];
const USES_BASELINE = new Set(['equivalence', 'bugfix']);

const only = process.argv[2];
const suites = ALL_SUITES.filter(s => !only || s === only);

if (!suites.length) {
  console.error(
    `unknown suite "${only}" — expected one of ${ALL_SUITES.join(', ')}`
  );
  process.exit(2);
}

extractBaseline();

let failed = false;

for (const suite of suites) {
  const label = USES_BASELINE.has(suite) ? ` (baseline ${BASELINE_SHA})` : '';
  console.log(`\n--- ${suite}${label} ---`);

  try {
    execFileSync(process.execPath, [await bundle(suite)], {
      stdio: 'inherit',
    });
  } catch {
    failed = true;
  }
}

process.exit(failed ? 1 : 0);
