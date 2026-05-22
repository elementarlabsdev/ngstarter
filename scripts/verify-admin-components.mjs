import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const projectsDir = path.join(rootDir, 'projects');

const skippedApps = new Set(['admin-classic']);
const strictApps = new Set(['admin-modern']);

const adminDirs = (await readdir(projectsDir, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => /^admin(?:-|$)/.test(name))
  .filter((name) => !skippedApps.has(name))
  .sort();

const hardFailures = [];
const migrationWarnings = [];

const universalTemplateRules = [
  ['inline style attributes', /\sstyle\s*=/],
  ['Angular style bindings', /\[style(?:\.[^\]]+)?\]=/],
  ['Angular attr style bindings', /\[attr\.style\]=/],
  ['ngStyle bindings', /\[ngStyle\]=/],
  ['arbitrary CSS variable background utilities', /\bbg-\[var\(/],
  ['arbitrary CSS variable text utilities', /\btext-\[var\(/],
  ['arbitrary CSS variable border utilities', /\bborder-\[var\(/],
  ['arbitrary literal color text utilities', /\btext-\[#/],
  ['custom chip span classes', /<span\b[^>]*class=["'][^"']*(?:chip|pill)[^"']*["']/],
  ['plain table without ngs-table', /<table\b(?![^>]*\bngs-table\b)/],
  ['plain input without ngsInput', /<input\b(?![^>]*\bngsInput\b)/],
  ['manual role table', /\brole=["']table["']/],
  ['manual role row', /\brole=["']row["']/],
  ['manual role cell', /\brole=["']cell["']/],
];

const universalSourceRules = [
  ['inline template style bindings', /\[style(?:\.[^\]]+)?\]=/],
  ['inline template ngStyle bindings', /\[ngStyle\]=/],
  ['custom inline chip span classes', /<span\b[^>]*class=["'][^"']*(?:chip|pill)[^"']*["']/],
];

const strictRequiredTemplateRules = [
  ['root shell uses ngs-layout', /<ngs-layout\b[^>]*\broot\b/],
  ['root layout has layout content', /<ngs-layout-content\b/],
  ['shell uses SidenavContainer', /<ngs-sidenav-container\b/],
  ['shell uses Sidenav', /<ngs-sidenav\b/],
  ['shell uses SidenavContent', /<ngs-sidenav-content\b/],
  ['workspace uses Panel', /<ngs-panel\b/],
  ['workspace header uses PanelHeader', /<ngs-panel-header\b/],
  ['workspace body uses PanelContent', /<ngs-panel-content\b/],
  ['scroll regions use ScrollbarArea', /<ngs-scrollbar-area\b/],
  ['primary rail uses Sidebar', /<ngs-sidebar\b/],
  ['primary rail uses SidebarNav', /<ngs-sidebar-nav\b/],
  ['search/text input uses FormField', /<ngs-form-field\b/],
  ['actions use NgStarter buttons', /<button\b[^>]*\bngs(?:Button|IconButton)\b/],
  ['icons use Icon', /<ngs-icon\b/],
];

const strictRequiredSourceRules = [
  ['Layout import', /from\s+['"]@ngstarter-ui\/components\/layout['"]/],
  ['Sidenav import', /from\s+['"]@ngstarter-ui\/components\/sidenav['"]/],
  ['Panel import', /from\s+['"]@ngstarter-ui\/components\/panel['"]/],
  ['Sidebar import', /from\s+['"]@ngstarter-ui\/components\/sidebar['"]/],
  ['ScrollbarArea import', /from\s+['"]@ngstarter-ui\/components\/scrollbar-area['"]/],
  ['Button import', /from\s+['"]@ngstarter-ui\/components\/button['"]/],
  ['Icon import', /from\s+['"]@ngstarter-ui\/components\/icon['"]/],
  ['FormField import', /from\s+['"]@ngstarter-ui\/components\/form-field['"]/],
  ['Input import', /from\s+['"]@ngstarter-ui\/components\/input['"]/],
];

const strictStyleRules = [
  ['local SCSS starts with Tailwind reference', /^@reference ['"]tailwindcss['"];/],
  ['local SCSS uses Tailwind spacing function', /--spacing\(/],
  ['local SCSS has component selector overrides', /\bngs-[\w-]+\s*\{/],
];

const warningOnlyRules = [
  ['root shell should use ngs-layout', /<ngs-layout\b[^>]*\broot\b/],
  ['workspace scroll should use ngs-scrollbar-area', /<ngs-scrollbar-area\b/],
];

function collectRuleFailures(rules, content, prefix) {
  return rules
    .filter(([, pattern]) => !pattern.test(content))
    .map(([label]) => `${prefix}: ${label}`);
}

function collectForbiddenHits(rules, content, prefix) {
  return rules
    .filter(([, pattern]) => pattern.test(content))
    .map(([label]) => `${prefix}: ${label}`);
}

function verifyLayoutChildren(appName, template, target) {
  const layoutOpen = template.match(/<ngs-layout\b[^>]*>/);

  if (!layoutOpen) {
    return;
  }

  const start = layoutOpen.index + layoutOpen[0].length;
  const end = template.indexOf('</ngs-layout>', start);
  const body = end === -1 ? template.slice(start) : template.slice(start, end);
  const withoutComments = body.replace(/<!--[\s\S]*?-->/g, '');
  const tagPattern = /<\/?([a-zA-Z][\w-]*)([^>]*)>/g;
  const allowed = new Set([
    'ngs-layout-topbar',
    'ngs-layout-header',
    'ngs-layout-sidebar',
    'ngs-layout-content',
    'ngs-layout-aside',
    'ngs-layout-footer',
  ]);

  let depth = 0;

  for (const match of withoutComments.matchAll(tagPattern)) {
    const fullTag = match[0];
    const tagName = match[1];
    const isClosing = fullTag.startsWith('</');
    const isSelfClosing = fullTag.endsWith('/>');

    if (isClosing) {
      depth = Math.max(0, depth - 1);
      continue;
    }

    if (depth === 0 && !allowed.has(tagName)) {
      target.push(
        `${appName}: ngs-layout direct child must be a layout region, found <${tagName}>`,
      );
      break;
    }

    if (!isSelfClosing) {
      depth += 1;
    }
  }
}

for (const appName of adminDirs) {
  const appDir = path.join(projectsDir, appName, 'src/app');
  const templatePath = path.join(appDir, 'app.html');
  const sourcePath = path.join(appDir, 'app.ts');
  const stylePath = path.join(appDir, 'app.scss');

  const [template, source, styles] = await Promise.all([
    readFile(templatePath, 'utf8'),
    readFile(sourcePath, 'utf8'),
    readFile(stylePath, 'utf8').catch(() => ''),
  ]);

  const strict = strictApps.has(appName);
  const target = strict ? hardFailures : migrationWarnings;

  target.push(...collectForbiddenHits(universalTemplateRules, template, appName));
  target.push(...collectForbiddenHits(universalSourceRules, source, `${appName} source`));
  verifyLayoutChildren(appName, template, target);

  if (strict) {
    hardFailures.push(...collectRuleFailures(strictRequiredTemplateRules, template, appName));
    hardFailures.push(
      ...collectRuleFailures(strictRequiredSourceRules, source, `${appName} imports`),
    );
    hardFailures.push(...collectRuleFailures(strictStyleRules, styles, `${appName} styles`));
  } else {
    migrationWarnings.push(
      ...collectRuleFailures(warningOnlyRules, template, `${appName} migration`),
    );
  }
}

if (migrationWarnings.length) {
  console.warn('Admin component migration warnings:\n');
  for (const warning of migrationWarnings) {
    console.warn(`- ${warning}`);
  }
  console.warn('');
}

if (hardFailures.length) {
  console.error('Admin component composition verification failed:\n');
  for (const failure of hardFailures) {
    console.error(`- ${failure}`);
  }
  console.error(
    '\nUse NgStarter UI primitives and local SCSS component tokens instead of hand-rolled admin UI.',
  );
  process.exit(1);
}

console.log(
  `Verified strict admin app composition. Checked: ${adminDirs.join(', ')}. Skipped: ${[...skippedApps].join(', ')}.`,
);
