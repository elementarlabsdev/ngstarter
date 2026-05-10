import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(fileURLToPath(import.meta.url));
const packageDir = join(rootDir, '..', 'dist', 'components');

const requiredFiles = [
  'package.json',
  'schematics/collection.json',
  'schematics/migrations.json',
  'schematics/ng-add/index.js',
  'schematics/ng-add/schema.json',
  'schematics/ng-update/index.js',
  'schematics/ng-update/schema.json',
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

console.log(`Verified ${packResult.name}@${packResult.version} package contents.`);
