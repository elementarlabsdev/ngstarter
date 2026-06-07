import { builtinModules } from 'node:module';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const workspaceRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const rootPackagePath = join(workspaceRoot, 'package.json');
const componentsPackagePath = join(workspaceRoot, 'projects/components/package.json');
const componentsNgPackagePath = join(workspaceRoot, 'projects/components/ng-package.json');
const componentsRoot = join(workspaceRoot, 'projects/components');

const ignoredImportPrefixes = [
  '.',
  '@angular/',
  '@ngstarter-ui/',
];
const ignoredImportNames = new Set([
  ...builtinModules,
  ...builtinModules.map(name => `node:${name}`),
  'vitest',
]);

const rootPackageJson = await readJson(rootPackagePath);
const componentsPackageJson = await readJson(componentsPackagePath);
const componentsNgPackageJson = await readJson(componentsNgPackagePath);
const rootDependencies = rootPackageJson.dependencies ?? {};
const importedPackages = await collectImportedPackages(componentsRoot);
const syncedDependencies = {};

for (const name of importedPackages) {
  const version = rootDependencies[name];

  if (version) {
    syncedDependencies[name] = version;
  }
}

componentsPackageJson.dependencies = sortObject({
  ...(componentsPackageJson.dependencies ?? {}),
  ...syncedDependencies,
});

componentsNgPackageJson.allowedNonPeerDependencies = [
  ...new Set([
    ...(componentsNgPackageJson.allowedNonPeerDependencies ?? []),
    ...Object.keys(componentsPackageJson.dependencies),
  ]),
].sort();

await writeJson(rootPackagePath, rootPackageJson);
await writeJson(componentsPackagePath, componentsPackageJson);
await writeJson(componentsNgPackagePath, componentsNgPackageJson);

async function collectImportedPackages(root) {
  const files = await collectTypeScriptFiles(root);
  const imports = new Set();

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    const importPattern = /(?:from\s+['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\))/g;

    for (const match of source.matchAll(importPattern)) {
      const packageName = getPackageName(match[1] ?? match[2]);

      if (packageName) {
        imports.add(packageName);
      }
    }
  }

  return [...imports].sort();
}

async function collectTypeScriptFiles(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(root, entry.name);
    const workspacePath = relative(workspaceRoot, path);

    if (entry.isDirectory()) {
      if (!workspacePath.includes('/schematics')) {
        files.push(...await collectTypeScriptFiles(path));
      }

      continue;
    }

    if (path.endsWith('.ts') && !path.endsWith('.spec.ts')) {
      files.push(path);
    }
  }

  return files;
}

function getPackageName(importPath) {
  if (!importPath || ignoredImportPrefixes.some(prefix => importPath.startsWith(prefix))) {
    return undefined;
  }

  const packageName = importPath.startsWith('@')
    ? importPath.split('/').slice(0, 2).join('/')
    : importPath.split('/')[0];

  return ignoredImportNames.has(packageName) ? undefined : packageName;
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function writeJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

function sortObject(value) {
  return Object.keys(value)
    .sort()
    .reduce((result, key) => {
      result[key] = value[key];
      return result;
    }, {});
}
