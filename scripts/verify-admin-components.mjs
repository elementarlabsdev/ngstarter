import { readFile } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const adminDir = path.join(rootDir, 'projects/admin/src/app');
const appTemplatePath = path.join(adminDir, 'app.html');
const appClassPath = path.join(adminDir, 'app.ts');
const appStylePath = path.join(adminDir, 'app.scss');

const [template, source, styles] = await Promise.all([
  readFile(appTemplatePath, 'utf8'),
  readFile(appClassPath, 'utf8'),
  readFile(appStylePath, 'utf8'),
]);

const requiredTemplatePatterns = [
  ['shell uses SidenavContainer', /<ngs-sidenav-container\b/],
  ['shell uses Sidenav', /<ngs-sidenav\b/],
  ['shell uses SidenavContent', /<ngs-sidenav-content\b/],
  ['navigation uses Navigation', /<ngs-navigation\b/],
  ['navigation uses NavigationItem', /<ngs-navigation-item\b/],
  ['cards use Card', /<ngs-card\b/],
  ['cards use CardContent', /<ngs-card-content\b/],
  ['tables use NgStarter Table', /<table\b[^>]*\bngs-table\b/],
  ['tables define NgStarter columns', /\bngsColumnDef=/],
  ['tables use NgStarter header cells', /\bngs-header-cell\b/],
  ['tables use NgStarter body cells', /\bngs-cell\b/],
  ['tables use NgStarter header rows', /\bngs-header-row\b/],
  ['tables use NgStarter rows', /\bngs-row\b/],
  ['search uses FormField', /<ngs-form-field\b/],
  ['search uses Label', /<ngs-label\b/],
  ['search input uses ngsInput', /<input\b[^>]*\bngsInput\b/],
  ['pagination uses Paginator', /<ngs-paginator\b/],
  ['selection uses Checkbox', /<ngs-checkbox\b/],
  ['progress uses ProgressBar', /<ngs-progress-bar\b/],
  ['icons use Icon', /<ngs-icon\b/],
  ['actions use Button', /<button\b[^>]*\bngs(?:Button|IconButton)\b/],
];

const requiredImports = [
  ['Button', /import\s+\{[^}]*\bButton\b[^}]*\}\s+from\s+['"]@ngstarter-ui\/components\/button['"]/],
  ['Card', /import\s+\{[^}]*\bCard\b[^}]*\}\s+from\s+['"]@ngstarter-ui\/components\/card['"]/],
  ['Checkbox', /import\s+\{[^}]*\bCheckbox\b[^}]*\}\s+from\s+['"]@ngstarter-ui\/components\/checkbox['"]/],
  ['FormField', /import\s+\{[^}]*\bFormField\b[^}]*\}\s+from\s+['"]@ngstarter-ui\/components\/form-field['"]/],
  ['Icon', /import\s+\{[^}]*\bIcon\b[^}]*\}\s+from\s+['"]@ngstarter-ui\/components\/icon['"]/],
  ['Input', /import\s+\{[^}]*\bInput\b[^}]*\}\s+from\s+['"]@ngstarter-ui\/components\/input['"]/],
  ['Navigation', /import\s+\{[^}]*\bNavigation\b[^}]*\}\s+from\s+['"]@ngstarter-ui\/components\/navigation['"]/],
  ['Paginator', /import\s+\{[^}]*\bPaginator\b[^}]*\}\s+from\s+['"]@ngstarter-ui\/components\/paginator['"]/],
  ['ProgressBar', /import\s+\{[^}]*\bProgressBar\b[^}]*\}\s+from\s+['"]@ngstarter-ui\/components\/progress-bar['"]/],
  ['Sidenav', /import\s+\{[^}]*\bSidenav\b[^}]*\}\s+from\s+['"]@ngstarter-ui\/components\/sidenav['"]/],
  ['Table', /import\s+\{[^}]*\bTable\b[^}]*\}\s+from\s+['"]@ngstarter-ui\/components\/table['"]/],
];

const forbiddenTemplatePatterns = [
  ['manual role table', /\brole=["']table["']/],
  ['manual role row', /\brole=["']row["']/],
  ['manual role cell', /\brole=["']cell["']/],
  ['plain table without ngs-table', /<table\b(?![^>]*\bngs-table\b)/],
  ['plain input without ngsInput', /<input\b(?![^>]*\bngsInput\b)/],
  ['manual task-row table layout', /\bclass=["'][^"']*\btask-row\b/],
  ['manual nav-item buttons', /\bclass=["'][^"']*\bnav-item\b/],
  ['manual pagination buttons', /\bclass=["'][^"']*\bpagination\b/],
];

const requiredStylingPatterns = [
  ['template uses Tailwind layout utilities', /class=["'][^"']*\b(?:flex|grid)\b/],
  ['template uses Tailwind spacing utilities', /class=["'][^"']*\b(?:gap|p|px|py|pt|pb|m|mt|mb|my|mx)-/],
  ['local SCSS starts with Tailwind reference', /^@reference ['"]tailwindcss['"];/],
  ['local SCSS uses Tailwind spacing function', /--spacing\(/],
  ['local SCSS overrides cards by component selector', /\bngs-card\s*\{/],
  ['local SCSS overrides navigation by component selector', /\bngs-navigation\s*\{/],
  ['local SCSS overrides table by directive selector', /\btable\[ngs-table\]\s*\{/],
];

const forbiddenStylePatterns = [
  ['manual Tailwind spacing calc in SCSS', /calc\(\s*var\(--spacing\)/],
  ['wrapper-only card restyle .stat-card', /\.stat-card\b/],
  ['wrapper-only card restyle .tasks-panel', /\.tasks-panel\b/],
  ['wrapper-only navigation restyle .admin-navigation', /\.admin-navigation\b/],
];

const failures = [];

for (const [label, pattern] of requiredTemplatePatterns) {
  if (!pattern.test(template)) {
    failures.push(`Missing template requirement: ${label}`);
  }
}

for (const [label, pattern] of requiredImports) {
  if (!pattern.test(source)) {
    failures.push(`Missing NgStarter import: ${label}`);
  }
}

for (const [label, pattern] of forbiddenTemplatePatterns) {
  if (pattern.test(template)) {
    failures.push(`Forbidden hand-rolled primitive: ${label}`);
  }
}

for (const [label, pattern] of requiredStylingPatterns) {
  if (!pattern.test(styles) && !pattern.test(template)) {
    failures.push(`Missing styling requirement: ${label}`);
  }
}

for (const [label, pattern] of forbiddenStylePatterns) {
  if (pattern.test(styles)) {
    failures.push(`Forbidden styling pattern: ${label}`);
  }
}

if (failures.length) {
  console.error('Admin component composition verification failed:\n');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  console.error('\nUse NgStarter UI primitives for admin shell, navigation, cards, tables, forms, pagination, actions, selection, and progress.');
  console.error('Use Tailwind utilities for layout and local component-selector overrides with --spacing(N) in SCSS.');
  process.exit(1);
}

console.log('Verified admin app composes UI from NgStarter components.');
