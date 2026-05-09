import { SchematicsException, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

type JsonObject = Record<string, any>;
type DependencySection = 'dependencies' | 'devDependencies' | 'peerDependencies' | 'optionalDependencies';

interface SetupOptions {
  project?: string;
  skipInstall: boolean;
  updateExistingDependencies: boolean;
}

interface PackageJson {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

interface WorkspaceProject {
  projectType?: string;
  root?: string;
  sourceRoot?: string;
  architect?: JsonObject;
  targets?: JsonObject;
}

interface Workspace {
  defaultProject?: string;
  projects?: Record<string, WorkspaceProject>;
}

const packageJson = require('../package.json') as PackageJson;

const PACKAGE_JSON_PATH = '/package.json';
const ANGULAR_JSON_PATH = '/angular.json';
const POSTCSS_CONFIG_PATH = '/.postcssrc.json';
const POSTCSS_CONFIGS = [
  '/.postcssrc',
  '/.postcssrc.json',
  '/.postcssrc.yaml',
  '/.postcssrc.yml',
  '/.postcssrc.js',
  '/.postcssrc.cjs',
  '/postcss.config.js',
  '/postcss.config.cjs',
  '/postcss.config.mjs',
];
const DEPENDENCY_SECTIONS: DependencySection[] = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
];
const DEV_DEPENDENCY_NAMES = new Set([
  '@tailwindcss/postcss',
  '@tailwindcss/typography',
  'autoprefixer',
  'postcss',
  'tailwindcss',
]);
const TAILWIND_IMPORT = '@use "tailwindcss";';
const NGS_THEME_IMPORT = '@use "@ngstarter-ui/components/styles/themes/default";';

export function setupNgStarterComponents(
  tree: Tree,
  context: SchematicContext,
  options: SetupOptions
): void {
  validateAngularVersion(tree);
  updatePackageJson(tree, options.updateExistingDependencies);
  setupTailwindFiles(tree, context, options.project);

  if (!options.skipInstall) {
    context.addTask(new NodePackageInstallTask());
    context.logger.info('Installing @ngstarter-ui/components dependencies...');
  }
}

function updatePackageJson(tree: Tree, updateExistingDependencies: boolean): void {
  const projectPackageJson = readJson<JsonObject>(tree, PACKAGE_JSON_PATH);
  const dependencies = collectPackageDependencies(packageJson.dependencies, packageJson.peerDependencies);
  const runtimeDependencies = filterDependencies(dependencies, false);
  const devDependencies = {
    ...filterDependencies(dependencies, true),
    ...(packageJson.devDependencies ?? {}),
  };

  addDependencies(projectPackageJson, runtimeDependencies, 'dependencies', updateExistingDependencies);
  addDependencies(projectPackageJson, devDependencies, 'devDependencies', updateExistingDependencies);

  writeJson(tree, PACKAGE_JSON_PATH, projectPackageJson);
}

function collectPackageDependencies(
  dependencies: Record<string, string> | undefined,
  peerDependencies: Record<string, string> | undefined
): Record<string, string> {
  return {
    ...(peerDependencies ?? {}),
    ...(dependencies ?? {}),
  };
}

function filterDependencies(
  dependencies: Record<string, string>,
  includeDevDependencies: boolean
): Record<string, string> {
  return Object.keys(dependencies).reduce<Record<string, string>>((result, name) => {
    if (DEV_DEPENDENCY_NAMES.has(name) === includeDevDependencies) {
      result[name] = dependencies[name];
    }

    return result;
  }, {});
}

function addDependencies(
  projectPackageJson: JsonObject,
  dependencies: Record<string, string>,
  fallbackSection: DependencySection,
  updateExistingDependencies: boolean
): void {
  Object.keys(dependencies).sort().forEach(name => {
    if (name === packageJson.name) {
      return;
    }

    const version = dependencies[name];
    const existingSection = findDependencySection(projectPackageJson, name);

    if (existingSection) {
      if (updateExistingDependencies) {
        projectPackageJson[existingSection][name] = version;
        sortDependencySection(projectPackageJson, existingSection);
      }

      return;
    }

    if (!projectPackageJson[fallbackSection]) {
      projectPackageJson[fallbackSection] = {};
    }

    projectPackageJson[fallbackSection][name] = version;
    sortDependencySection(projectPackageJson, fallbackSection);
  });
}

function findDependencySection(projectPackageJson: JsonObject, name: string): DependencySection | undefined {
  return DEPENDENCY_SECTIONS.find(section => projectPackageJson[section]?.[name] !== undefined);
}

function sortDependencySection(projectPackageJson: JsonObject, section: DependencySection): void {
  const dependencies = projectPackageJson[section] as Record<string, string> | undefined;

  if (!dependencies) {
    return;
  }

  projectPackageJson[section] = Object.keys(dependencies)
    .sort()
    .reduce<Record<string, string>>((result, name) => {
      result[name] = dependencies[name];
      return result;
    }, {});
}

function setupTailwindFiles(tree: Tree, context: SchematicContext, projectName?: string): void {
  createPostcssConfig(tree, context);

  if (!tree.exists(ANGULAR_JSON_PATH)) {
    context.logger.warn('No angular.json found. Skipping global styles configuration.');
    return;
  }

  const workspace = readJson<Workspace>(tree, ANGULAR_JSON_PATH);
  const resolvedProjectName = resolveProjectName(workspace, projectName);
  const project = workspace.projects?.[resolvedProjectName];

  if (!project) {
    throw new SchematicsException(`Project "${resolvedProjectName}" was not found in angular.json.`);
  }

  const buildOptions = getBuildOptions(project);
  const stylePath = resolveGlobalStylePath(project, buildOptions);

  ensureGlobalStyleFile(tree, stylePath);
  ensureProjectStyleEntry(buildOptions, stylePath);
  writeJson(tree, ANGULAR_JSON_PATH, workspace as JsonObject);
}

function validateAngularVersion(tree: Tree): void {
  const projectPackageJson = readJson<JsonObject>(tree, PACKAGE_JSON_PATH);
  const requiredAngularVersion = packageJson.peerDependencies?.['@angular/core'];

  if (!requiredAngularVersion) {
    return;
  }

  const projectAngularVersion = findDependencyVersion(projectPackageJson, '@angular/core');

  if (!projectAngularVersion) {
    throw new SchematicsException(
      `Required dependency "@angular/core" was not found in "${PACKAGE_JSON_PATH}".`
    );
  }

  const supportedMajors = getMajorVersions(requiredAngularVersion);
  const projectMajor = getMajorVersion(projectAngularVersion);

  if (supportedMajors.length === 0 || projectMajor === undefined) {
    throw new SchematicsException(
      `Could not verify Angular compatibility. Required: ${requiredAngularVersion}, found: ${projectAngularVersion}.`
    );
  }

  if (!supportedMajors.includes(projectMajor)) {
    throw new SchematicsException(
      `${packageJson.name} requires Angular ${requiredAngularVersion}, but the project uses @angular/core ${projectAngularVersion}. ` +
        `Run "ng update @angular/core@${supportedMajors[0]} @angular/cli@${supportedMajors[0]}" before adding ${packageJson.name}.`
    );
  }
}

function findDependencyVersion(projectPackageJson: JsonObject, name: string): string | undefined {
  const section = findDependencySection(projectPackageJson, name);
  const version = section ? projectPackageJson[section]?.[name] : undefined;
  return typeof version === 'string' ? version : undefined;
}

function getMajorVersions(versionRange: string): number[] {
  const majors = new Set<number>();
  const matches = versionRange.matchAll(/(\d+)\.\d+\.\d+/g);

  for (const match of matches) {
    majors.add(Number(match[1]));
  }

  return [...majors].sort((a, b) => a - b);
}

function getMajorVersion(versionRange: string): number | undefined {
  return getMajorVersions(versionRange)[0];
}

function createPostcssConfig(tree: Tree, context: SchematicContext): void {
  const hasPostcssConfig = POSTCSS_CONFIGS.some(path => tree.exists(path));

  if (hasPostcssConfig) {
    context.logger.info('Existing PostCSS configuration found. Skipping .postcssrc.json creation.');
    return;
  }

  writeJson(tree, POSTCSS_CONFIG_PATH, {
    plugins: {
      '@tailwindcss/postcss': {},
    },
  });
}

function resolveProjectName(workspace: Workspace, projectName?: string): string {
  if (projectName) {
    return projectName;
  }

  if (workspace.defaultProject) {
    return workspace.defaultProject;
  }

  const projects = workspace.projects ?? {};
  const applicationProject = Object.keys(projects).find(name => projects[name].projectType === 'application');

  if (!applicationProject) {
    throw new SchematicsException('No Angular application project was found in angular.json.');
  }

  return applicationProject;
}

function getBuildOptions(project: WorkspaceProject): JsonObject {
  const buildTarget = project.architect?.['build'] ?? project.targets?.['build'];
  const options = buildTarget?.['options'];

  if (!options) {
    throw new SchematicsException('The selected project does not have build options in angular.json.');
  }

  return options;
}

function resolveGlobalStylePath(project: WorkspaceProject, buildOptions: JsonObject): string {
  const styles = Array.isArray(buildOptions['styles']) ? buildOptions['styles'] : [];
  const firstStylePath = styles.reduce<string | undefined>((result, style) => {
    if (result) {
      return result;
    }

    if (typeof style === 'string') {
      return style;
    }

    if (style && typeof style === 'object' && typeof (style as JsonObject)['input'] === 'string') {
      return (style as JsonObject)['input'];
    }

    return undefined;
  }, undefined);

  if (firstStylePath) {
    const stylePath = normalizeWorkspacePath(firstStylePath);
    assertScssStylePath(stylePath);
    return stylePath;
  }

  const sourceRoot = project.sourceRoot || joinWorkspacePath(project.root || '', 'src');
  const stylePath = normalizeWorkspacePath(joinWorkspacePath(sourceRoot, 'styles.scss'));
  assertScssStylePath(stylePath);
  return stylePath;
}

function assertScssStylePath(stylePath: string): void {
  if (stylePath.endsWith('.scss')) {
    return;
  }

  throw new SchematicsException(
    `${packageJson.name} supports only SCSS global styles. The selected project uses "${stylePath}". ` +
      'Switch the project global style file to styles.scss and retry.'
  );
}

function ensureGlobalStyleFile(tree: Tree, stylePath: string): void {
  const content = tree.exists(stylePath) ? readText(tree, stylePath) : '';
  const imports = [
    { needle: /@use\s+["']tailwindcss["'];?/, statement: TAILWIND_IMPORT },
    {
      needle: /@use\s+["']@ngstarter-ui\/components\/styles\/themes\/[^"']+["'];?/,
      statement: NGS_THEME_IMPORT,
    },
  ];

  const missingImports = imports
    .filter(item => !item.needle.test(content))
    .map(item => item.statement);

  if (tree.exists(stylePath) && missingImports.length === 0) {
    return;
  }

  const nextContent = [
    ...missingImports,
    content.trimStart(),
  ].filter(Boolean).join('\n');

  if (tree.exists(stylePath)) {
    tree.overwrite(stylePath, nextContent.endsWith('\n') ? nextContent : `${nextContent}\n`);
  } else {
    tree.create(stylePath, `${nextContent}\n`);
  }
}

function ensureProjectStyleEntry(buildOptions: JsonObject, stylePath: string): void {
  const styles = Array.isArray(buildOptions['styles']) ? buildOptions['styles'] : [];
  const hasStyle = styles.some((style: unknown) => {
    if (typeof style === 'string') {
      return normalizeWorkspacePath(style) === stylePath;
    }

    if (style && typeof style === 'object' && typeof (style as JsonObject)['input'] === 'string') {
      return normalizeWorkspacePath((style as JsonObject)['input']) === stylePath;
    }

    return false;
  });

  if (!hasStyle) {
    styles.unshift(stylePath);
  }

  buildOptions['styles'] = styles;
}

function readJson<T>(tree: Tree, path: string): T {
  if (!tree.exists(path)) {
    throw new SchematicsException(`Required file "${path}" was not found.`);
  }

  try {
    return JSON.parse(readText(tree, path)) as T;
  } catch (error) {
    throw new SchematicsException(`Could not parse "${path}": ${error instanceof Error ? error.message : error}`);
  }
}

function writeJson(tree: Tree, path: string, value: JsonObject): void {
  const content = `${JSON.stringify(value, null, 2)}\n`;

  if (tree.exists(path)) {
    tree.overwrite(path, content);
  } else {
    tree.create(path, content);
  }
}

function readText(tree: Tree, path: string): string {
  const buffer = tree.read(path);

  if (!buffer) {
    throw new SchematicsException(`Could not read "${path}".`);
  }

  return buffer.toString('utf-8');
}

function normalizeWorkspacePath(path: string): string {
  return path.replace(/\\/g, '/').replace(/^\/+/, '');
}

function joinWorkspacePath(...parts: string[]): string {
  return parts
    .filter(Boolean)
    .join('/')
    .replace(/\/+/g, '/')
    .replace(/^\/+/, '');
}
