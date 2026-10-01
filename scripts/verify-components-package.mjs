import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(fileURLToPath(import.meta.url));
const packageDir = join(rootDir, '..', 'dist', 'components');
const require = createRequire(import.meta.url);
const { SchematicTestRunner } = require('@angular-devkit/schematics/testing');

const requiredFiles = [
  'package.json',
  'schematics/package.json',
  'schematics/collection.json',
  'schematics/migrations.json',
  'schematics/ng-add/index.js',
  'schematics/ng-add/schema.json',
  'schematics/sync-dependencies/index.js',
  'schematics/sync-dependencies/schema.json',
  'schematics/ng-update/index.js',
  'schematics/ng-update/schema.json',
  'schematics/codex-skill/index.js',
  'schematics/codex-skill/schema.json',
];

const missingFromDisk = requiredFiles.filter(file => !existsSync(join(packageDir, file)));

if (missingFromDisk.length > 0) {
  throw new Error(`Missing files from dist/components:\n${missingFromDisk.join('\n')}`);
}

const packOutput = execFileSync('npm', ['pack', '--dry-run', '--json'], {
  cwd: packageDir,
  encoding: 'utf8',
});
const [packResult] = JSON.parse(packOutput);
const packedFiles = new Set(packResult.files.map(file => file.path));
const missingFromPackage = requiredFiles.filter(file => !packedFiles.has(file));

if (missingFromPackage.length > 0) {
  throw new Error(`Missing files from npm package:\n${missingFromPackage.join('\n')}`);
}

// Load every factory through Angular's engine to catch module-format errors,
// including migrations and shared schematics utilities.
for (const collectionFile of ['collection.json', 'migrations.json']) {
  const collectionPath = join(packageDir, 'schematics', collectionFile);
  const collectionJson = JSON.parse(readFileSync(collectionPath, 'utf8'));
  const runner = new SchematicTestRunner(collectionPath, collectionPath);
  const collection = runner.engine.createCollection(collectionPath);

  for (const name of Object.keys(collectionJson.schematics)) {
    collection.createSchematic(name, true);
  }

  if (collectionFile === 'collection.json') {
    const tree = await runner.runSchematic('codex-skill', {});

    for (const file of [
      '/AGENTS.md',
      '/.codex/skills/ngstarter-ui/SKILL.md',
      '/.codex/skills/ngstarter-ui/references/admin-ui-rules.md',
      '/.codex/skills/ngstarter-ui/references/component-map.md',
      '/.codex/skills/ngstarter-ui/agents/openai.yaml',
    ]) {
      assert.ok(tree.exists(file), `codex-skill did not generate ${file}`);
    }
  }
}

console.log(`Verified ${packResult.name}@${packResult.version} package contents.`);
