import { SchematicsException, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

type JsonObject = Record<string, any>;
type DependencySection = 'dependencies' | 'devDependencies' | 'peerDependencies' | 'optionalDependencies';

interface SetupOptions {
  project?: string;
  skipInstall: boolean;
  codexSkill: boolean;
  updateExistingDependencies: boolean;
  updateExistingPeerDependencies: boolean;
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
const AGENTS_PATH = '/AGENTS.md';
const CODEX_SKILL_ROOT = '/.codex/skills/ngstarter-ui';
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
const GOOGLE_FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&amp;display=swap';
const GOOGLE_FONTS_HREF_PATTERN =
  /https:\/\/fonts\.googleapis\.com\/css2\?family=DM\+Sans:wght@400;500;600;700(?:&amp;|&)display=swap/;
const GOOGLE_FONTS_LINK = `<link href="${GOOGLE_FONTS_HREF}" rel="stylesheet"/>`;
const NGS_THEME_IMPORT = '@use "@ngstarter-ui/components/styles/themes/default";';
const NGS_THEME_PROVIDER = `provideNgsTheme({
  theme: 'default',
  colorScheme: 'auto',
  radius: 'medium',
}),`;
const AGENTS_START_MARKER = '<!-- ngstarter-ui:start -->';
const AGENTS_END_MARKER = '<!-- ngstarter-ui:end -->';
const NGS_AGENTS_SECTION = [
  AGENTS_START_MARKER,
  '## NgStarter UI',
  '',
  'This project uses `@ngstarter-ui/components`. When building Angular UI, prefer NgStarter',
  'components from secondary entry points before creating custom HTML primitives.',
  '',
  '- Import public APIs from `@ngstarter-ui/components/<component>`, for example',
  '  `@ngstarter-ui/components/button`, `@ngstarter-ui/components/form-field`,',
  '  `@ngstarter-ui/components/table`, and `@ngstarter-ui/components/data-view`.',
  '- Use standalone Angular APIs and keep UI components `ChangeDetectionStrategy.OnPush` where',
  '  applicable.',
  '- Admin shells should be composed with `ngs-layout[root]` > `ngs-layout-content` >',
  '  `ngs-sidenav-container` > `ngs-sidenav` + `ngs-sidenav-content` > `ngs-panel`.',
  '- Put app navigation in `ngs-sidebar` inside `ngs-sidenav`; use `ngs-panel-header`,',
  '  `ngs-panel-content`, and `ngs-panel-aside` for workspace structure.',
  '- Use `ngs-scrollbar-area` for scrollable panel, sidebar, inspector, and message regions.',
  '- Use `DataView` for operational datasets and rich data grids. Use `ngs-table` only for static,',
  '  read-only template tables.',
  '- Use `ngs-form-field` with `ngsInput` or the matching NgStarter form control for text, search,',
  '  select, autocomplete, date/time, number, slider, color, and masked inputs.',
  '- Use NgStarter `Button`, `Icon`, `Menu`, `Popover`, `Tooltip`, `Dialog`/`Confirm`, `Card`,',
  '  `List`, `Avatar`, `Badge`, `Chip`, `Paginator`, loading, empty-state, and feedback components',
  '  instead of hand-rolled equivalents when available.',
  '- Keep Tailwind utility classes focused on layout, spacing, sizing, flex/grid, and responsive',
  '  behavior. Put reusable visual overrides and `--ngs-*` token customizations in SCSS.',
  '- Do not add inline visual styles, `[ngStyle]`, arbitrary color utilities, custom pills/chips,',
  '  plain inputs, plain tables, or manual ARIA data grids when NgStarter provides a component.',
  '- For exact component names, selectors, imports, inputs, outputs, and docs paths, inspect',
  '  `node_modules/@ngstarter-ui/components/ai/component-registry.json` after dependencies are',
  '  installed.',
  '- A full Codex skill is installed at `.codex/skills/ngstarter-ui`; use `$ngstarter-ui` when',
  '  asking Codex to build or refactor NgStarter UI.',
  '',
  AGENTS_END_MARKER,
].join('\n');
const CODEX_SKILL_MD = [
  '---',
  'name: ngstarter-ui',
  'description: Use when building Angular UI with NgStarter UI, @ngstarter-ui/components, admin dashboards, admin panels, forms, tables, data views, layouts, sidebars, panels, dialogs, menus, popovers, or when converting screenshots and mockups into Angular UI composed from NgStarter components.',
  '---',
  '',
  '# NgStarter UI',
  '',
  'Use NgStarter UI components before custom HTML primitives when a matching component exists.',
  '',
  '## Workflow',
  '',
  '1. Read the workspace `AGENTS.md` if it exists.',
  '2. For admin pages, dashboards, screenshots, or app shells, read `references/admin-ui-rules.md`.',
  '3. For component selection, imports, selectors, and examples, read `references/component-map.md`.',
  '4. If available, inspect `node_modules/@ngstarter-ui/components/ai/component-registry.json` for exact generated metadata.',
  '5. Import public APIs only from secondary entry points: `@ngstarter-ui/components/<component>`.',
  '6. Prefer standalone Angular APIs: `inject()`, `signal()`, `computed()`, `input()`, `output()`, `model()`, Angular control flow, and `ChangeDetectionStrategy.OnPush`.',
  '',
  '## Core Rules',
  '',
  '- Compose UI from NgStarter components before writing custom primitives.',
  '- Use `DataView` for operational datasets, rich grids, records with actions, sorting, selection, search, pagination, column sizing, or server-driven data.',
  '- Use `Table` only for static, read-only template tables.',
  '- Use one `ngs-form-field` per form control; do not use it as a generic layout wrapper.',
  '- Use `ngs-scrollbar-area` for scrollable admin regions inside panels, sidebars, inspectors, and chat/message areas.',
  '- Keep layout, spacing, sizing, flex/grid, and responsive behavior in Tailwind utility classes.',
  '- Keep reusable visual styling, component token overrides, and `--ngs-*` customizations in SCSS.',
  '- Do not use inline visual styles, `[ngStyle]`, arbitrary color utilities, custom pills/chips, plain inputs, plain tables, or manual ARIA data grids when NgStarter has a component.',
].join('\n');
const CODEX_SKILL_ADMIN_RULES = [
  '# Admin UI Rules',
  '',
  '## Shell',
  '',
  '- Build admin viewport shells as `ngs-layout[root]` > `ngs-layout-content` > `ngs-sidenav-container` > `ngs-sidenav` + `ngs-sidenav-content` > `ngs-panel`.',
  '- Direct children of `ngs-layout` must be layout region components only.',
  '- Put compact primary app navigation inside `ngs-sidenav` with `ngs-sidebar` and `ngs-sidebar-nav`.',
  '- Do not use `ngs-navigation` for the primary admin app rail.',
  '- Do not nest another `Layout` inside sidenav, sidenav content, sidebar, or panel.',
  '- Put workspace headers in `ngs-panel-header`, scrollable bodies in `ngs-panel-content`, and persistent right columns in `ngs-panel-aside`.',
  '',
  '## Scroll Regions',
  '',
  '- Let `ngs-panel-content` own the workspace scroll region.',
  '- Put `<ngs-scrollbar-area [absolute]="true">` inside sized `ngs-panel-content` regions and move padding to an inner element.',
  '- For flex children such as chat messages, wrap the scrollbar area in a relative `min-height: 0; flex: 1` shell.',
  '',
  '## Forms',
  '',
  '- Use one `ngs-form-field` for one form control.',
  '- Use `input[ngsInput]`, `textarea[ngsInput]`, `ngs-select`, autocomplete, date/time, phone, number, slider, color, masked, or other NgStarter controls instead of plain inputs.',
  '- Do not wrap checkbox, radio, button, or toggle controls in `ngs-form-field` when they have their own label pattern.',
  '- Header, toolbar, and compact filter fields may omit visible `ngs-label` when placeholder text or aria context is clear.',
  '',
  '## Styling',
  '',
  '- Use Tailwind utility classes in templates for layout, responsive behavior, sizing, spacing, flex, grid, and alignment.',
  '- Start local SCSS files that use Tailwind tokens with `@reference "tailwindcss";`.',
  '- In component SCSS, put component-local styling under `:host`.',
  '- Override NgStarter components through selectors such as `ngs-card`, `ngs-form-field`, `table[ngs-table]`, `button[ngsButton]`, and `button[ngsIconButton]`.',
  '- Do not restyle NgStarter components through wrapper-only classes when a component selector or token fits.',
  '- Do not put visual styling in templates with `[style.*]`, `[attr.style]`, `[ngStyle]`, or inline `style`.',
  '- Do not use reusable arbitrary color utilities such as `bg-[var(...)]`, `text-[var(...)]`, `border-[var(...)]`, or `text-[#...]` in admin templates.',
  '',
  '## Verification',
  '',
  '- Before finishing admin UI changes, run `npm run verify:admin:components` when that script exists.',
  '- Scan changed templates for plain inputs, plain tables, manual role grids, custom pills/chips/avatars/menus/popovers, inline styles, arbitrary color utilities, and scrollable regions without `ngs-scrollbar-area`.',
].join('\n');
const CODEX_SKILL_COMPONENT_MAP = [
  '# Component Map',
  '',
  '- Root viewport shell: `Layout`, `LayoutContent` from `@ngstarter-ui/components/layout`.',
  '- App shell: `Sidenav`, `SidenavContainer`, `SidenavContent` from `@ngstarter-ui/components/sidenav`.',
  '- Primary app navigation: `Sidebar`, `SidebarHeader`, `SidebarBody`, `SidebarFooter`, `SidebarNav`, `SidebarNavItem` from `@ngstarter-ui/components/sidebar`.',
  '- Workspaces: `Panel`, `PanelHeader`, `PanelContent`, `PanelAside`, `PanelSidebar`, `PanelFooter` from `@ngstarter-ui/components/panel`.',
  '- Tabbed work surfaces: `TabPanel` parts from `@ngstarter-ui/components/tab-panel`; persistent inspectors from `@ngstarter-ui/components/side-panel`.',
  '- Secondary navigation: `Navigation` from `@ngstarter-ui/components/navigation`; compact rail navigation from `@ngstarter-ui/components/rail-nav`.',
  '- Toolbars: `Toolbar`, `ToolbarRow`, `ToolbarItem`, `ToolbarNav`, `ToolbarSpacer`, `ToolbarTitle` from `@ngstarter-ui/components/toolbar`.',
  '- Cards and KPIs: `Card`, `CardContent`, `CardFooter` from `@ngstarter-ui/components/card`.',
  '- Rich data surfaces: `DataView` from `@ngstarter-ui/components/data-view`.',
  '- Static tables: `Table`, `ColumnDef`, `HeaderCell`, `Cell`, `HeaderRow`, `Row` and defs from `@ngstarter-ui/components/table`.',
  '- Text fields: `FormField`, `Label` from `@ngstarter-ui/components/form-field`; `Input` from `@ngstarter-ui/components/input`.',
  '- Specialized inputs: autocomplete, select, date/time, timezone, number, mask, pin, slider, color, phone, and validators from their matching secondary entry points.',
  '- Actions: `Button` from `@ngstarter-ui/components/button`; `Icon` from `@ngstarter-ui/components/icon`.',
  '- Menus and overlays: `Menu` for action lists, `Popover` for non-menu overlay content, `Tooltip` for icon help, `Dialog`/`Confirm`/`Drawer`/`BottomSheet` for temporary surfaces.',
  '- Selection: `Checkbox`, `RadioButton`, `RadioGroup`, `RadioCard`, `ButtonToggle`, `Segmented`, and `SlideToggle`.',
  '- Tags and statuses: `Chip`, `ChipSet`, `ChipListbox`, `ChipOption`, `Badge`, `Avatar`, and `AvatarGroup`.',
  '- Lists and notifications: `List`, `SelectionList`, `NotificationList`, and notification primitives.',
  '- Loading and states: `ProgressBar`, `ProgressSpinner`, `Skeleton`, `BlockLoader`, `ScreenLoader`, `PageLoadingBar`, `EmptyState`, `ActionRequired`, `Alert`, `Announcement`, and `Incidents`.',
  '- Structure and workflows: breadcrumbs, divider, expansion, accordion, stepper, tree, timeline, kanban board, filter builder, form builder, command bar, and guided tour components.',
  '- Charts and metrics: `Gauge` and micro chart components.',
  '- Rich content and media: text/comment editors, inline text edit, emoji picker, code highlighter, image/video viewers, image tools, carousel, crop, comparison slider, thumbnail maker, and video player.',
  '- Spatial tools: `Split`, `SplitArea`, `SplitPane`, `VisualBuilder`, `Tiles`, and `ResizableContainer`.',
  '- Scrollable admin surfaces: `ScrollbarArea` from `@ngstarter-ui/components/scrollbar-area`.',
  '',
  'For exact exports and selectors, prefer the generated registry at `node_modules/@ngstarter-ui/components/ai/component-registry.json`.',
].join('\n');
const CODEX_SKILL_OPENAI_YAML = [
  'interface:',
  '  display_name: "NgStarter UI"',
  '  short_description: "Build Angular admin UI with NgStarter components"',
  '  default_prompt: "Use $ngstarter-ui to build an Angular admin screen with NgStarter UI components."',
  '',
  'policy:',
  '  allow_implicit_invocation: true',
].join('\n');

export function setupNgStarterComponents(
  tree: Tree,
  context: SchematicContext,
  options: SetupOptions
): void {
  syncNgStarterComponentDependencies(tree, context, options);
  setupTailwindFiles(tree, context, options.project);
  ensureAgentsGuide(tree, context);
  if (options.codexSkill) {
    ensureCodexSkill(tree, context);
  }
}

export function syncNgStarterComponentDependencies(
  tree: Tree,
  context: SchematicContext,
  options: Omit<SetupOptions, 'project' | 'codexSkill'>
): void {
  validateAngularVersion(tree);
  updatePackageJson(
    tree,
    options.updateExistingDependencies,
    options.updateExistingPeerDependencies
  );
  if (!options.skipInstall) {
    context.addTask(new NodePackageInstallTask());
    context.logger.info('Installing @ngstarter-ui/components dependencies...');
  }
}

function updatePackageJson(
  tree: Tree,
  updateExistingDependencies: boolean,
  updateExistingPeerDependencies: boolean
): void {
  const projectPackageJson = readJson<JsonObject>(tree, PACKAGE_JSON_PATH);
  const runtimeDependencies = filterDependencies(packageJson.dependencies ?? {}, false);
  const peerDependencies = filterDependencies(packageJson.peerDependencies ?? {}, false);
  const devDependencies = {
    ...filterDependencies(packageJson.dependencies ?? {}, true),
    ...(packageJson.devDependencies ?? {}),
  };

  addDependencies(
    projectPackageJson,
    peerDependencies,
    'dependencies',
    updateExistingPeerDependencies
  );
  addDependencies(projectPackageJson, runtimeDependencies, 'dependencies', updateExistingDependencies);
  addDependencies(projectPackageJson, devDependencies, 'devDependencies', updateExistingDependencies);

  writeJson(tree, PACKAGE_JSON_PATH, projectPackageJson);
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
  const indexPath = resolveIndexHtmlPath(project, buildOptions);
  const appConfigPath = resolveAppConfigPath(project);

  ensureGlobalStyleFile(tree, stylePath);
  ensureIndexGoogleFontsLink(tree, context, indexPath);
  ensureAppConfigThemeProvider(tree, context, appConfigPath);
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

function resolveIndexHtmlPath(project: WorkspaceProject, buildOptions: JsonObject): string {
  const index = buildOptions['index'];

  if (typeof index === 'string') {
    return normalizeWorkspacePath(index);
  }

  if (index && typeof index === 'object' && typeof (index as JsonObject)['input'] === 'string') {
    return normalizeWorkspacePath((index as JsonObject)['input']);
  }

  const sourceRoot = project.sourceRoot || joinWorkspacePath(project.root || '', 'src');
  return normalizeWorkspacePath(joinWorkspacePath(sourceRoot, 'index.html'));
}

function resolveAppConfigPath(project: WorkspaceProject): string {
  const sourceRoot = project.sourceRoot || joinWorkspacePath(project.root || '', 'src');
  return normalizeWorkspacePath(joinWorkspacePath(sourceRoot, 'app/app.config.ts'));
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

function ensureIndexGoogleFontsLink(tree: Tree, context: SchematicContext, indexPath: string): void {
  if (!tree.exists(indexPath)) {
    context.logger.warn(`Index file "${indexPath}" was not found. Skipping Google Fonts setup.`);
    return;
  }

  const content = readText(tree, indexPath);

  if (GOOGLE_FONTS_HREF_PATTERN.test(content)) {
    return;
  }

  const headMatch = /([ \t]*)<\/head>/i.exec(content);
  const nextContent = headMatch
    ? content.replace(/([ \t]*)<\/head>/i, (_match, indent: string, offset: number) => {
        const needsLeadingNewline = !content.slice(0, offset).endsWith('\n');
        return `${needsLeadingNewline ? '\n' : ''}${indent}  ${GOOGLE_FONTS_LINK}\n${indent}</head>`;
      })
    : `${content.trimEnd()}\n${GOOGLE_FONTS_LINK}\n`;

  tree.overwrite(indexPath, nextContent);
}

function ensureAppConfigThemeProvider(tree: Tree, context: SchematicContext, appConfigPath: string): void {
  if (!tree.exists(appConfigPath)) {
    context.logger.warn(`App config "${appConfigPath}" was not found. Skipping NgStarter theme provider setup.`);
    return;
  }

  const content = readText(tree, appConfigPath);

  if (/provideNgsTheme\s*\(/.test(content)) {
    return;
  }

  if (!/providers\s*:\s*\[/.test(content)) {
    context.logger.warn(`No providers array found in "${appConfigPath}". Skipping NgStarter theme provider setup.`);
    return;
  }

  const nextContent = insertThemeProvider(addCoreImport(content));
  tree.overwrite(appConfigPath, nextContent);
}

function addCoreImport(content: string): string {
  const coreImport = /import\s*\{([\s\S]*?)\}\s*from\s*['"]@ngstarter-ui\/components\/core['"];?/m;
  const match = coreImport.exec(content);

  if (match) {
    const imports = match[1]
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);

    if (!imports.includes('provideNgsTheme')) {
      imports.push('provideNgsTheme');
    }

    return content.replace(
      coreImport,
      `import { ${imports.sort().join(', ')} } from '@ngstarter-ui/components/core';`
    );
  }

  const importStatement = `import { provideNgsTheme } from '@ngstarter-ui/components/core';`;
  const imports = [...content.matchAll(/import[\s\S]*?from\s*['"][^'"]+['"];?/g)];
  const lastImport = imports[imports.length - 1];

  if (!lastImport) {
    return `${importStatement}\n${content}`;
  }

  const insertIndex = (lastImport.index ?? 0) + lastImport[0].length;
  return `${content.slice(0, insertIndex)}\n${importStatement}${content.slice(insertIndex)}`;
}

function insertThemeProvider(content: string): string {
  return content.replace(/(\n([ \t]*)providers\s*:\s*\[)([ \t]*)(\r?\n)?/, (_match, start, indent) => {
    const providerIndent = `${indent}  `;
    return `${start}\n${indentBlock(NGS_THEME_PROVIDER, providerIndent)}\n`;
  });
}

function indentBlock(value: string, indent: string): string {
  return value
    .split('\n')
    .map(line => `${indent}${line}`)
    .join('\n');
}

function ensureGlobalStyleFile(tree: Tree, stylePath: string): void {
  const content = tree.exists(stylePath) ? readText(tree, stylePath) : '';
  const imports = [
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

function ensureAgentsGuide(tree: Tree, context: SchematicContext): void {
  if (!tree.exists(AGENTS_PATH)) {
    tree.create(AGENTS_PATH, `# Project Agent Instructions\n\n${NGS_AGENTS_SECTION}\n`);
    context.logger.info('Created AGENTS.md with NgStarter UI agent instructions.');
    return;
  }

  const content = readText(tree, AGENTS_PATH);
  const sectionPattern = new RegExp(
    `${escapeRegExp(AGENTS_START_MARKER)}[\\s\\S]*?${escapeRegExp(AGENTS_END_MARKER)}`
  );

  if (sectionPattern.test(content)) {
    const nextContent = content.replace(sectionPattern, NGS_AGENTS_SECTION);

    if (nextContent !== content) {
      tree.overwrite(AGENTS_PATH, nextContent);
      context.logger.info('Updated NgStarter UI agent instructions in AGENTS.md.');
    }

    return;
  }

  tree.overwrite(AGENTS_PATH, `${content.trimEnd()}\n\n${NGS_AGENTS_SECTION}\n`);
  context.logger.info('Added NgStarter UI agent instructions to AGENTS.md.');
}

function ensureCodexSkill(tree: Tree, context: SchematicContext): void {
  writeText(tree, `${CODEX_SKILL_ROOT}/SKILL.md`, `${CODEX_SKILL_MD}\n`);
  writeText(
    tree,
    `${CODEX_SKILL_ROOT}/references/admin-ui-rules.md`,
    `${CODEX_SKILL_ADMIN_RULES}\n`
  );
  writeText(
    tree,
    `${CODEX_SKILL_ROOT}/references/component-map.md`,
    `${CODEX_SKILL_COMPONENT_MAP}\n`
  );
  writeText(tree, `${CODEX_SKILL_ROOT}/agents/openai.yaml`, `${CODEX_SKILL_OPENAI_YAML}\n`);
  context.logger.info('Created or updated the NgStarter UI Codex skill in .codex/skills/ngstarter-ui.');
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

  writeText(tree, path, content);
}

function writeText(tree: Tree, path: string, content: string): void {
  const nextContent = content.endsWith('\n') ? content : `${content}\n`;

  if (tree.exists(path)) {
    tree.overwrite(path, nextContent);
  } else {
    tree.create(path, nextContent);
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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
