import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const componentsDir = path.join(rootDir, 'projects/components');
const docsAppDir = path.join(rootDir, 'projects/docs/src/app');
const registryTargets = [
  path.join(componentsDir, 'ai/component-registry.json'),
  path.join(rootDir, 'public/ai/component-registry.json'),
  path.join(rootDir, 'projects/docs/public/ai/component-registry.json'),
];
const llmsTargets = [
  path.join(rootDir, 'public/llms.txt'),
  path.join(rootDir, 'public/llms-full.txt'),
  path.join(rootDir, 'projects/docs/public/llms.txt'),
  path.join(rootDir, 'projects/docs/public/llms-full.txt'),
];

const docRouteFiles = [
  ['components', path.join(docsAppDir, 'components/components.routes.ts')],
  ['forms', path.join(docsAppDir, 'forms/routes.ts')],
  ['libraries', path.join(docsAppDir, 'libraries/routes.ts')],
  ['navigation', path.join(docsAppDir, 'navigation/routes.ts')],
  ['micro-charts', path.join(docsAppDir, 'micro-charts/routes.ts')],
];

const docsAliases = new Map([
  ['button', 'forms/buttons'],
  ['country-select', 'forms/country'],
  ['timezone-select', 'forms/timezone'],
  ['spinner', 'components/progress-spinner'],
  ['snack-bar', 'components/snackbar'],
  ['split', 'components/split-pane'],
  ['expansion', 'components/expansion-panel'],
  ['navigation', 'navigation/navigation'],
  ['micro-chart', 'micro-charts'],
]);

const priorityExamples = new Map([
  ['button', '<button ngsButton="filled">Save</button>'],
  ['input', '<input ngsInput placeholder="Email" />'],
  ['dialog', 'inject(Dialog).open(MyDialogComponent, { data })'],
  ['table', '<table ngs-table [dataSource]="dataSource">...</table>'],
  ['select', '<ngs-select [value]="value">...</ngs-select>'],
]);

const recipes = [
  {
    name: 'admin-dashboard',
    description: 'Build admin dashboards from NgStarter UI primitives instead of hand-rolled shell, cards, forms, tables, and pagination.',
    mustUse: [
      '@ngstarter-ui/components/sidenav',
      '@ngstarter-ui/components/navigation',
      '@ngstarter-ui/components/card',
      '@ngstarter-ui/components/table',
      '@ngstarter-ui/components/form-field',
      '@ngstarter-ui/components/input',
      '@ngstarter-ui/components/paginator',
      '@ngstarter-ui/components/button',
      '@ngstarter-ui/components/icon',
      '@ngstarter-ui/components/checkbox',
      '@ngstarter-ui/components/progress-bar',
    ],
    componentMappings: {
      appShell: ['SidenavContainer', 'Sidenav', 'SidenavContent'],
      navigation: ['Navigation', 'NavigationItem', 'NavigationItemIconDirective'],
      cards: ['Card', 'CardContent', 'CardFooter'],
      table: ['Table', 'ColumnDef', 'HeaderCell', 'HeaderCellDef', 'Cell', 'CellDef', 'HeaderRow', 'HeaderRowDef', 'Row', 'RowDef'],
      search: ['FormField', 'Label', 'Input', 'IconPrefix'],
      pagination: ['Paginator'],
      actions: ['Button', 'Icon'],
      selection: ['Checkbox'],
      progress: ['ProgressBar'],
    },
    mustNot: [
      'Do not build admin tables with role="table" div grids when ngs-table fits.',
      'Do not build search fields with plain input when ngs-form-field and ngsInput fit.',
      'Do not build navigation menus with plain button lists when ngs-navigation fits.',
      'Do not build KPI cards with plain article/div cards when ngs-card fits.',
      'Do not restyle NgStarter components through wrapper-only classes when component selectors and component tokens fit.',
      'Do not make ordinary table rows, labels, descriptions, sidebar items, or status text bold to imitate a screenshot.',
    ],
    styling: {
      template: 'Use TailwindCSS utility classes for layout, responsive behavior, sizing, spacing, flex, grid, and alignment.',
      localScss: [
        "Start local SCSS files that use Tailwind tokens with @reference 'tailwindcss';",
        'Use --spacing(N) for spacing values in local SCSS.',
        'Override NgStarter components through component or directive selectors such as ngs-card, ngs-navigation, ngs-form-field, table[ngs-table], button[ngsButton], and button[ngsIconButton].',
      ],
      globalStyles: 'Use CSS custom properties and theme tokens, especially --ngs-* variables, for global visual customization.',
    },
    typography: {
      normalTextWeights: ['400'],
      navigationWeights: ['400'],
      buttonWeights: ['500', '600'],
      headingWeights: ['600', '650'],
      reserveHeavyWeightsFor: ['brand marks', 'hero headings', 'primary KPI numbers', 'deliberate emphasis'],
    },
    verificationCommand: 'npm run verify:admin:components',
  },
];

const curatedGuidance = new Map(Object.entries({
  'action-required': {
    purpose: 'Prompt users to resolve required account, setup, billing, or workflow actions.',
    useWhen: 'Use for dashboard notices that require user action before work can continue.',
  },
  alert: {
    purpose: 'Show inline status messages, warnings, errors, confirmations, or contextual notices.',
    useWhen: 'Use inside page content when the message should remain visible near the affected workflow.',
  },
  announcement: {
    purpose: 'Show prominent product, system, or marketing announcements with optional title, icon, and actions.',
    useWhen: 'Use for broadcast-style messages that should stand apart from normal form or page content.',
  },
  autocomplete: {
    purpose: 'Let users search and choose from suggestions while typing.',
    useWhen: 'Use for large option lists where a select would be too slow or crowded.',
  },
  avatar: {
    purpose: 'Represent users, teams, or entities with initials, images, icons, generated colors, and presence.',
    useWhen: 'Use in account menus, lists, comments, assignees, collaborators, and activity feeds.',
  },
  badge: {
    purpose: 'Attach compact counts, statuses, or labels to another UI element.',
    useWhen: 'Use for notification counts, unread states, status dots, or small metadata on icons and avatars.',
  },
  'block-loader': {
    purpose: 'Indicate that a bounded area of the UI is loading while preserving the surrounding page.',
    useWhen: 'Use when a panel, table, modal section, or card is refreshing independently.',
  },
  'bottom-sheet': {
    purpose: 'Present mobile-friendly contextual actions or short forms from the bottom of the viewport.',
    useWhen: 'Use for temporary choices, mobile action menus, and lightweight task flows.',
  },
  breadcrumbs: {
    purpose: "Show the user's current location in a hierarchy and provide parent navigation.",
    useWhen: 'Use in admin sections with nested routes, folders, projects, or record detail pages.',
  },
  button: {
    purpose: 'Trigger actions with filled, outlined, text, tonal, loading, disabled, and icon button states.',
    useWhen: 'Use for commands, form submission, toolbar actions, and navigation-like calls to action.',
  },
  'button-toggle': {
    purpose: 'Let users choose one or more options from a compact segmented button group.',
    useWhen: 'Use for mode switching, view density, filters, or mutually exclusive short choices.',
  },
  card: {
    purpose: 'Group related content, controls, media, and actions in a bordered or elevated container.',
    useWhen: 'Use for repeated dashboard widgets, previews, summaries, or compact content modules.',
  },
  'card-overlay': {
    purpose: 'Reveal overlay content or actions on top of a card-like surface, often on hover or interaction.',
    useWhen: 'Use for media cards, galleries, previews, and quick actions over visual content.',
  },
  carousel: {
    purpose: 'Display a sequence of slides or panels that users can browse horizontally.',
    useWhen: 'Use for featured content, image galleries, onboarding panels, or compact previews.',
  },
  checkbox: {
    purpose: 'Capture independent boolean choices or multi-select options.',
    useWhen: 'Use for forms, preferences, tables, and filter groups where multiple values can be selected.',
  },
  chips: {
    purpose: 'Display compact tokens for tags, selected values, filters, or removable items.',
    useWhen: 'Use for tag entry, selected people/items, active filters, and small categorical metadata.',
  },
  'code-highlighter': {
    purpose: 'Render formatted source code snippets with syntax highlighting.',
    useWhen: 'Use in docs, developer tools, examples, and configuration previews.',
  },
  'color-picker': {
    purpose: 'Let users choose or edit a color value.',
    useWhen: 'Use in branding, theme customization, design tools, and visual editors.',
  },
  'color-scheme': {
    purpose: 'Control or reflect light, dark, and automatic color scheme behavior.',
    useWhen: 'Use in theme settings and app shell preferences.',
  },
  'color-switcher': {
    purpose: 'Switch the application accent or theme color.',
    useWhen: 'Use in personalization panels, demo toolbars, or tenant branding settings.',
  },
  'command-bar': {
    purpose: 'Expose a searchable list of commands and quick actions.',
    useWhen: 'Use for keyboard-centric admin tools, global command menus, and productivity workflows.',
  },
  'comment-editor': {
    purpose: 'Collect rich or plain comment input with editor-specific actions.',
    useWhen: 'Use in discussions, review flows, activity feeds, and collaboration surfaces.',
  },
  'comparison-slider': {
    purpose: 'Compare two images or visual states with a draggable before/after divider.',
    useWhen: 'Use for image comparison, design review, maps, reports, or visual diffs.',
  },
  confirm: {
    purpose: 'Ask users to confirm or cancel a consequential action.',
    useWhen: 'Use before destructive, irreversible, or high-impact operations.',
  },
  'content-editor': {
    purpose: 'Provide a rich content editing surface for structured or formatted content.',
    useWhen: 'Use for posts, descriptions, CMS-like fields, notes, and editable rich text workflows.',
  },
  'content-fade': {
    purpose: 'Fade overflowing content to signal that more content is available.',
    useWhen: 'Use for previews, collapsed text, scrollable areas, or teaser content.',
  },
  core: {
    purpose: 'Provide shared primitives, utilities, pipes, directives, theming services, and low-level behavior used by NgStarter components.',
    useWhen: 'Import from core for theme setup, shared directives, utility pipes, ripple, focus helpers, and library infrastructure.',
  },
  'cookie-popup': {
    purpose: 'Ask for cookie consent or present privacy-related choices.',
    useWhen: 'Use on public-facing pages that need consent messaging or tracking preferences.',
  },
  'country-select': {
    purpose: 'Let users choose a country from a localized or searchable country list.',
    useWhen: 'Use in addresses, profiles, billing, localization, and phone-related forms.',
  },
  crop: {
    purpose: 'Crop images or visual media to a selected region.',
    useWhen: 'Use for avatar upload, image preparation, media management, and visual editing.',
  },
  'currency-select': {
    purpose: 'Let users select a currency, often with country or code display.',
    useWhen: 'Use in billing, pricing, finance, marketplace, and localization forms.',
  },
  'data-view': {
    purpose: 'Build feature-rich data grids with sorting, filtering, pagination, column settings, selection, and server-side loading.',
    useWhen: 'Use for operational datasets where users need to inspect, organize, filter, and act on records.',
  },
  'date-format-select': {
    purpose: 'Let users choose a preferred date display format.',
    useWhen: 'Use in account, localization, reporting, and tenant settings.',
  },
  datepicker: {
    purpose: 'Let users pick dates from a calendar-oriented form control.',
    useWhen: 'Use for date fields, scheduling, filters, reporting ranges, and forms.',
  },
  dialog: {
    purpose: 'Open focused modal workflows with title, content, actions, sizing, and scroll handling.',
    useWhen: 'Use when users must complete or dismiss a task before returning to the page.',
  },
  divider: {
    purpose: 'Separate groups of content or actions with a visual rule.',
    useWhen: 'Use in menus, panels, lists, forms, and dense layouts.',
  },
  drawer: {
    purpose: 'Show persistent or temporary side content without leaving the current page.',
    useWhen: 'Use for detail panels, filters, navigation, inspectors, and secondary workflows.',
  },
  'emoji-picker': {
    purpose: 'Let users browse and insert emoji.',
    useWhen: 'Use in comments, chat, reactions, editors, and social features.',
  },
  'empty-state': {
    purpose: 'Explain why content is absent and offer a next action.',
    useWhen: 'Use for empty tables, search results, dashboards, folders, and first-run states.',
  },
  expand: {
    purpose: 'Show a short preview that can expand to reveal more content.',
    useWhen: 'Use for long text, descriptions, changelogs, comments, or compact summaries.',
  },
  expansion: {
    purpose: 'Group collapsible sections of content in an accordion-like layout.',
    useWhen: 'Use for settings groups, FAQs, advanced options, and dense detail pages.',
  },
  'filter-builder': {
    purpose: 'Let users construct structured filtering rules for datasets.',
    useWhen: 'Use for advanced search, reports, saved views, and operational data filtering.',
  },
  'form-field': {
    purpose: 'Wrap form controls with consistent labels, hints, errors, and field layout.',
    useWhen: 'Use as the standard shell around inputs, selects, and custom form controls.',
  },
  'form-renderer': {
    purpose: 'Render dynamic forms from configuration or schema-like definitions.',
    useWhen: 'Use for generated settings, surveys, admin forms, onboarding flows, or configurable forms.',
  },
  gauge: {
    purpose: 'Visualize progress, utilization, score, or capacity as a radial metric.',
    useWhen: 'Use in dashboards for KPIs, quotas, health, completion, or thresholds.',
  },
  grid: {
    purpose: 'Arrange dashboard widgets or tiles in a responsive grid.',
    useWhen: 'Use for admin dashboards and configurable widget layouts.',
  },
  'guided-tour': {
    purpose: 'Walk users through UI features step by step.',
    useWhen: 'Use for onboarding, feature discovery, setup guidance, and product education.',
  },
  'headless-stepper': {
    purpose: 'Provide stepper state and workflow primitives without imposing a full visual layout.',
    useWhen: 'Use when a custom multi-step UI needs NgStarter step logic but not the standard Stepper presentation.',
  },
  icon: {
    purpose: 'Render icons consistently across the UI.',
    useWhen: 'Use for buttons, menus, labels, empty states, navigation, and status indicators.',
  },
  'image-designer': {
    purpose: 'Provide an image composition or editing workspace.',
    useWhen: 'Use for design tools, image customization, previews, and creative editing flows.',
  },
  'image-placeholder': {
    purpose: 'Show a placeholder while an image is absent, loading, or unavailable.',
    useWhen: 'Use in cards, upload flows, media grids, avatars, and previews.',
  },
  'image-resizer': {
    purpose: 'Resize images or image regions interactively.',
    useWhen: 'Use in media editors, upload preparation, thumbnails, and design tools.',
  },
  'image-viewer': {
    purpose: 'Display images in a focused viewer experience.',
    useWhen: 'Use for galleries, attachments, previews, and media detail views.',
  },
  'image-zoom-viewer': {
    purpose: 'Display images with zoom and pan-style inspection.',
    useWhen: 'Use when users need to inspect high-detail images, documents, maps, or screenshots.',
  },
  incidents: {
    purpose: 'Represent incident or issue states in operational dashboards.',
    useWhen: 'Use for monitoring, service health, incident lists, and response workflows.',
  },
  'inline-text-edit': {
    purpose: 'Edit text in place without opening a separate form.',
    useWhen: 'Use for names, titles, labels, descriptions, and quick record edits.',
  },
  input: {
    purpose: 'Style native text inputs and textareas consistently with NgStarter form fields.',
    useWhen: 'Use for standard text entry, search fields, and multiline form values.',
  },
  'input-mask': {
    purpose: 'Constrain text entry to a specific pattern.',
    useWhen: 'Use for phone numbers, IDs, codes, formatted numbers, and structured text.',
  },
  'input-validator': {
    purpose: 'Validate user input and show validation feedback.',
    useWhen: 'Use for forms that need reusable client-side validation behavior.',
  },
  'kanban-board': {
    purpose: 'Organize items into draggable workflow columns.',
    useWhen: 'Use for tasks, deals, issues, content pipelines, and status-based workflows.',
  },
  kbd: {
    purpose: 'Render keyboard keys or shortcuts.',
    useWhen: 'Use in help text, command menus, docs, and power-user workflows.',
  },
  layout: {
    purpose: 'Compose common app layout regions for admin and dashboard screens.',
    useWhen: 'Use for shells, page scaffolding, content/sidebar layouts, and structural UI.',
  },
  list: {
    purpose: 'Display repeated rows of related content or actions.',
    useWhen: 'Use for navigation-adjacent lists, settings rows, activity feeds, and item collections.',
  },
  logo: {
    purpose: 'Render NgStarter or product logo variants.',
    useWhen: 'Use in app shells, headers, auth pages, and branding areas.',
  },
  marquee: {
    purpose: 'Animate a horizontal stream of repeated content.',
    useWhen: 'Use for compact announcements, logos, highlights, and non-critical decorative motion.',
  },
  menu: {
    purpose: 'Show contextual action lists anchored to a trigger.',
    useWhen: 'Use for row actions, overflow menus, user menus, context menus, and toolbars.',
  },
  'micro-chart': {
    purpose: 'Render compact inline charts for small dashboard metrics.',
    useWhen: 'Use in KPI cards, table cells, summaries, and dense analytics panels.',
  },
  navigation: {
    purpose: 'Render primary or secondary navigation structures.',
    useWhen: 'Use in app shells, sidebars, product sections, and nested admin navigation.',
  },
  notifications: {
    purpose: 'Display notification lists, notification items, or notification surfaces.',
    useWhen: 'Use for user alerts, activity updates, inbox-style feeds, and app header popovers.',
  },
  'number-input': {
    purpose: 'Capture numeric values with appropriate controls and formatting.',
    useWhen: 'Use for quantities, limits, pricing, thresholds, and numeric settings.',
  },
  option: {
    purpose: 'Provide reusable option primitives for select-like controls.',
    useWhen: 'Use internally or alongside option-based components such as select and autocomplete.',
  },
  overlay: {
    purpose: 'Position floating UI relative to an anchor.',
    useWhen: 'Use for custom popovers, dropdowns, panels, menus, and floating surfaces.',
  },
  'page-loading-bar': {
    purpose: 'Show route or page-level loading progress.',
    useWhen: 'Use during navigation, large async page transitions, or app-wide loading states.',
  },
  paginator: {
    purpose: 'Navigate paged datasets.',
    useWhen: 'Use with tables, data views, lists, and server-side record browsing.',
  },
  panel: {
    purpose: 'Group content inside a structured panel surface.',
    useWhen: 'Use for dashboard sections, settings panels, details, and repeated admin modules.',
  },
  'password-strength': {
    purpose: 'Show password quality feedback while users type.',
    useWhen: 'Use in signup, reset password, account security, and credential forms.',
  },
  'phone-input': {
    purpose: 'Capture phone numbers with country-aware formatting and validation.',
    useWhen: 'Use in profiles, billing, contact forms, onboarding, and support workflows.',
  },
  'pin-input': {
    purpose: 'Capture short multi-digit verification or security codes.',
    useWhen: 'Use for OTP, MFA, invite codes, passcodes, and verification flows.',
  },
  popover: {
    purpose: 'Show lightweight contextual content anchored to another element.',
    useWhen: 'Use for quick details, simple forms, explanations, and non-modal contextual UI.',
  },
  'progress-bar': {
    purpose: 'Show linear progress or completion state.',
    useWhen: 'Use for uploads, long-running tasks, setup completion, and bounded progress.',
  },
  radio: {
    purpose: 'Let users choose exactly one option from a visible set.',
    useWhen: 'Use for short mutually exclusive choices in forms and settings.',
  },
  'radio-card': {
    purpose: 'Let users choose one option from richer card-like choices.',
    useWhen: 'Use for plans, templates, payment methods, layouts, or options needing descriptions.',
  },
  'rail-nav': {
    purpose: 'Provide compact vertical navigation with icons and labels.',
    useWhen: 'Use in dense app shells where sidebar space is constrained.',
  },
  'resizable-container': {
    purpose: 'Let users resize a container or panel.',
    useWhen: 'Use for editors, inspectors, side panels, split workspaces, and dashboards.',
  },
  'screen-loader': {
    purpose: 'Show a full-screen or page-level loading state.',
    useWhen: 'Use while initial app, route, or major page data is loading.',
  },
  'scroll-spy': {
    purpose: 'Track page sections and provide in-page navigation.',
    useWhen: 'Use in long docs pages, settings pages, and detail screens with many sections.',
  },
  'scrollbar-area': {
    purpose: 'Provide a styled scrollable region.',
    useWhen: 'Use when a panel, menu, list, or surface needs controlled scrolling.',
  },
  segmented: {
    purpose: 'Switch between compact mutually exclusive modes or filters.',
    useWhen: 'Use for view modes, time ranges, filter states, and short setting groups.',
  },
  select: {
    purpose: 'Let users choose one or more options from a dropdown list.',
    useWhen: 'Use for forms and filters when options are known and fit in a menu.',
  },
  'side-panel': {
    purpose: 'Show secondary detail or task content beside the main page.',
    useWhen: 'Use for inspectors, edit panels, previews, and contextual details.',
  },
  sidebar: {
    purpose: 'Provide vertical app navigation and supporting sidebar content.',
    useWhen: 'Use for admin app shells, workspace navigation, and persistent sections.',
  },
  sidenav: {
    purpose: 'Provide side navigation that can be persistent or toggleable.',
    useWhen: 'Use for responsive layouts and app navigation shells.',
  },
  'signature-pad': {
    purpose: 'Capture a drawn signature.',
    useWhen: 'Use for approvals, contracts, confirmations, forms, and consent flows.',
  },
  skeleton: {
    purpose: 'Show placeholder shapes while content is loading.',
    useWhen: 'Use for cards, lists, tables, and pages where layout is known before data arrives.',
  },
  'slide-toggle': {
    purpose: 'Capture a binary on/off setting.',
    useWhen: 'Use for preferences, feature toggles, visibility, and immediate boolean settings.',
  },
  slider: {
    purpose: 'Let users choose a numeric value from a continuous or stepped range.',
    useWhen: 'Use for volume, size, thresholds, opacity, ranges, and visual settings.',
  },
  'snack-bar': {
    purpose: 'Show short transient feedback after an action.',
    useWhen: 'Use for save confirmations, undo prompts, background results, and non-blocking messages.',
  },
  sort: {
    purpose: 'Provide sorting behavior for table-like data.',
    useWhen: 'Use with tables, data views, and sortable column headers.',
  },
  'splash-screen': {
    purpose: 'Show an initial branded loading screen.',
    useWhen: 'Use while the application bootstraps or waits for essential startup data.',
  },
  split: {
    purpose: 'Divide an interface into resizable panes.',
    useWhen: 'Use for editors, master-detail screens, inspectors, and multi-pane workspaces.',
  },
  stepper: {
    purpose: 'Guide users through a multi-step process.',
    useWhen: 'Use for onboarding, setup, checkout, configuration, and wizard-style forms.',
  },
  suggestions: {
    purpose: 'Display suggested actions, values, or next steps.',
    useWhen: 'Use for assistant-like recommendations, empty states, search, and productivity hints.',
  },
  'tab-panel': {
    purpose: 'Organize related content into tabbed panels.',
    useWhen: 'Use for settings, details, and pages where sections share the same context.',
  },
  table: {
    purpose: 'Render structured tabular data with columns, rows, headers, sorting, selection, and sticky regions.',
    useWhen: 'Use for predictable tabular layouts; use Data View when users need richer dataset operations.',
  },
  tabs: {
    purpose: 'Switch between related views within the same page context.',
    useWhen: 'Use for compact section switching, detail page subsections, and alternate views.',
  },
  'text-editor': {
    purpose: 'Provide a rich text editing control.',
    useWhen: 'Use for formatted descriptions, messages, notes, articles, and user-generated content.',
  },
  'thumbnail-maker': {
    purpose: 'Create or adjust thumbnails from media.',
    useWhen: 'Use for video/image previews, content management, and media publishing workflows.',
  },
  tiles: {
    purpose: 'Lay out resizable tile-based content.',
    useWhen: 'Use for dashboards, visual builders, and configurable grid-like workspaces.',
  },
  timeline: {
    purpose: 'Show events or activities in chronological order.',
    useWhen: 'Use for audit logs, histories, workflows, tracking, and activity feeds.',
  },
  timepicker: {
    purpose: 'Let users choose a time value.',
    useWhen: 'Use for scheduling, reminders, availability, reports, and time-based filters.',
  },
  'timezone-select': {
    purpose: 'Let users choose a timezone.',
    useWhen: 'Use in profile, scheduling, localization, and tenant settings.',
  },
  toolbar: {
    purpose: 'Group frequently used page, editor, or content actions.',
    useWhen: 'Use above tables, editors, canvases, dashboards, and tool surfaces.',
  },
  tooltip: {
    purpose: 'Show short contextual help on hover or focus.',
    useWhen: 'Use for icon buttons, disabled explanations, abbreviations, and dense controls.',
  },
  tree: {
    purpose: 'Display hierarchical data with expandable parent and child nodes.',
    useWhen: 'Use for folders, permissions, categories, org charts, and nested navigation.',
  },
  upload: {
    purpose: 'Let users select, preview, and upload files.',
    useWhen: 'Use for attachments, documents, media, imports, and profile assets.',
  },
  'video-player': {
    purpose: 'Play video content with application-level controls.',
    useWhen: 'Use for media libraries, lessons, previews, and product content.',
  },
  'video-viewer': {
    purpose: 'Display videos in a focused viewer experience.',
    useWhen: 'Use for video attachments, previews, galleries, and media detail pages.',
  },
  'visual-builder': {
    purpose: 'Provide a visual composition or builder workspace.',
    useWhen: 'Use for no-code/low-code editing, layouts, templates, and visual design workflows.',
  },
}));

function titleize(value) {
  return value
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function uniqueText(values) {
  const seen = new Set();
  const result = [];

  for (const value of values.filter(Boolean)) {
    const key = value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(value);
  }

  return result;
}

function toKebab(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

async function readText(file) {
  try {
    return await readFile(file, 'utf8');
  } catch {
    return '';
  }
}

async function listComponentNames() {
  const entries = await readdir(componentsDir, { withFileTypes: true });
  const names = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const publicApi = path.join(componentsDir, entry.name, 'public-api.ts');
    if (await readText(publicApi)) {
      names.push(entry.name);
    }
  }

  return names.sort((a, b) => a.localeCompare(b));
}

async function collectFiles(dir, predicate) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectFiles(entryPath, predicate));
    } else if (predicate(entryPath)) {
      files.push(entryPath);
    }
  }

  return files.sort((a, b) => a.localeCompare(b));
}

function parseSelectors(source) {
  const matches = [...source.matchAll(/selector:\s*`([\s\S]*?)`|selector:\s*['"]([^'"]+)['"]/g)];
  return unique(matches.flatMap(match => (match[1] || match[2] || '')
    .split(',')
    .map(selector => selector.trim().replace(/\s+/g, ' '))
    .filter(Boolean)));
}

function parseExportedSymbols(source) {
  const matches = [...source.matchAll(/export\s+(?:abstract\s+)?(?:class|interface|type|enum|const|function)\s+([A-Za-z0-9_]+)/g)];
  return unique(matches.map(match => match[1]));
}

function parseSignalInputs(source) {
  const matches = [
    ...source.matchAll(/(?:public\s+|protected\s+|private\s+)?(?:readonly\s+)?([A-Za-z0-9_]+)\s*=\s*input(?:\.required)?(?:<[^>]+>)?\(([\s\S]*?)\);/g),
  ];

  return matches.map(match => {
    const alias = match[2].match(/alias:\s*['"]([^'"]+)['"]/)?.[1];
    return alias || match[1];
  });
}

function parseDecoratorInputs(source) {
  const inline = [...source.matchAll(/@Input(?:\([^)]*\))?\s+(?:readonly\s+)?([A-Za-z0-9_]+)/g)].map(match => match[1]);
  const aliases = [...source.matchAll(/inputs:\s*\[([\s\S]*?)\]/g)]
    .flatMap(match => [...match[1].matchAll(/['"]([^'"]+)['"]/g)].map(input => input[1].split(':')[0].trim()));
  return [...inline, ...aliases];
}

function parseOutputs(source) {
  const signalOutputs = [
    ...source.matchAll(/(?:public\s+|protected\s+|private\s+)?(?:readonly\s+)?([A-Za-z0-9_]+)\s*=\s*output(?:<[^>]+>)?\(([\s\S]*?)\);/g),
  ].map(match => {
    const alias = match[2].match(/alias:\s*['"]([^'"]+)['"]/)?.[1];
    return alias || match[1];
  });
  const decoratorOutputs = [...source.matchAll(/@Output(?:\([^)]*\))?\s+(?:readonly\s+)?([A-Za-z0-9_]+)/g)].map(match => match[1]);
  const aliases = [...source.matchAll(/outputs:\s*\[([\s\S]*?)\]/g)]
    .flatMap(match => [...match[1].matchAll(/['"]([^'"]+)['"]/g)].map(output => output[1].split(':')[0].trim()));
  return [...signalOutputs, ...decoratorOutputs, ...aliases];
}

function parseModels(source) {
  const matches = [
    ...source.matchAll(/(?:public\s+|protected\s+|private\s+)?(?:readonly\s+)?([A-Za-z0-9_]+)\s*=\s*model(?:\.required)?(?:<[^>]+>)?\(([\s\S]*?)\);/g),
  ];

  return matches.map(match => {
    const alias = match[2].match(/alias:\s*['"]([^'"]+)['"]/)?.[1];
    return alias || match[1];
  });
}

function parseCssTokens(source) {
  return unique([...source.matchAll(/--ngs-[A-Za-z0-9_-]+/g)].map(match => match[0]));
}

async function parseDocsRoutes() {
  const docs = new Map();
  const docsByUrl = new Map();

  for (const [section, file] of docRouteFiles) {
    const source = await readText(file);
    const routes = [
      ...source.matchAll(/path:\s*['"]([^'"]+)['"][\s\S]*?loadChildren:\s*\(\)\s*=>\s*import\(['"]([^'"]+)['"]\)[\s\S]*?title:\s*['"]([^'"]+)['"]/g),
    ];

    for (const [, routePath, importPath, title] of routes) {
      const url = `/${section}/${routePath}`;
      const sourceDir = path.join(path.dirname(file), importPath.replace(/\/routes$/, ''));
      const entry = { section, routePath, title, url, sourceDir };
      docs.set(routePath, entry);
      docsByUrl.set(url, entry);
    }
  }

  return { docs, docsByUrl };
}

function findDocEntry(name, docs, docsByUrl) {
  if (docsAliases.has(name)) {
    const aliasUrl = `/${docsAliases.get(name)}`;
    return docsByUrl.get(aliasUrl) || {
      section: aliasUrl.split('/')[1] || null,
      routePath: aliasUrl.split('/').at(-1) || null,
      title: titleize(name),
      url: aliasUrl,
      sourceDir: path.join(docsAppDir, docsAliases.get(name)),
    };
  }

  if (docs.has(name)) {
    return docs.get(name);
  }

  const plural = `${name}s`;
  if (docs.has(plural)) {
    return docs.get(plural);
  }

  return null;
}

function stripHtml(value) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function sentenceCase(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function firstSentence(value) {
  const normalized = value.replace(/\s+/g, ' ').trim();
  const match = normalized.match(/^(.+?[.!?])(?:\s|$)/);
  return match ? match[1] : normalized;
}

function normalizeExampleTitle(value) {
  return sentenceCase(value
    .replace(/^basic-/i, 'basic ')
    .replace(/-example$/i, '')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim());
}

function buildFallbackPurpose(title, exampleTopics) {
  if (exampleTopics.length) {
    return `Use ${title} for ${exampleTopics.slice(0, 4).map(topic => topic.toLowerCase()).join(', ')}.`;
  }

  return `Use ${title} when an Angular admin or dashboard screen needs this UI pattern.`;
}

function buildFallbackUseWhen(title, category, exampleTopics) {
  if (exampleTopics.length) {
    return `Choose ${title} when the workflow matches examples such as ${exampleTopics.slice(0, 5).join(', ')}.`;
  }

  if (category === 'forms') {
    return `Use ${title} in forms, filters, settings, and data entry workflows.`;
  }

  if (category === 'navigation') {
    return `Use ${title} for app navigation or page structure.`;
  }

  if (category === 'libraries') {
    return `Use ${title} for higher-level product workflows instead of composing low-level primitives from scratch.`;
  }

  return `Use ${title} as the standard NgStarter component for this UI need.`;
}

async function getOverviewMetadata(docEntry) {
  if (!docEntry?.sourceDir) {
    return null;
  }

  const overviewPath = path.join(docEntry.sourceDir, 'overview/overview.html');
  const overviewHtml = await readText(overviewPath);
  const examplesDir = path.join(docEntry.sourceDir, '_examples');
  const overviewSource = path.relative(rootDir, overviewPath);
  const paragraphTexts = [...overviewHtml.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map(match => stripHtml(match[1]))
    .filter(Boolean);
  const headingTexts = [...overviewHtml.matchAll(/<h[1-4]\b[^>]*>([\s\S]*?)<\/h[1-4]>/gi)]
    .map(match => stripHtml(match[1]))
    .filter(Boolean);
  const playgroundNames = [...overviewHtml.matchAll(/exampleName=["']([^"']+)["']/g)]
    .map(match => normalizeExampleTitle(match[1]));

  let exampleDirs = [];
  try {
    exampleDirs = (await readdir(examplesDir, { withFileTypes: true }))
      .filter(entry => entry.isDirectory())
      .map(entry => normalizeExampleTitle(entry.name));
  } catch {
    exampleDirs = [];
  }

  const exampleTopics = uniqueText([...headingTexts, ...playgroundNames, ...exampleDirs]);
  const exampleFiles = [];

  try {
    const dirs = (await readdir(examplesDir, { withFileTypes: true }))
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)
      .sort((a, b) => {
        const aBasic = a.includes('basic') ? 0 : 1;
        const bBasic = b.includes('basic') ? 0 : 1;
        return aBasic - bBasic || a.localeCompare(b);
      });

    for (const dir of dirs.slice(0, 3)) {
      const dirPath = path.join(examplesDir, dir);
      const files = await collectFiles(dirPath, file => file.endsWith('.html') || file.endsWith('.ts'));
      const htmlFile = files.find(file => file.endsWith('.html'));
      const tsFile = files.find(file => file.endsWith('.ts'));
      const file = htmlFile || tsFile;

      if (file) {
        const source = (await readText(file)).replace(/\s+\n/g, '\n').trim();
        exampleFiles.push({
          name: dir,
          title: normalizeExampleTitle(dir),
          file: path.relative(rootDir, file),
          source: source.length > 1600 ? `${source.slice(0, 1600).trim()}\n...` : source,
        });
      }
    }
  } catch {
    // Some docs pages are overview-only and do not have executable examples.
  }

  return {
    title: docEntry.title,
    category: docEntry.section,
    source: overviewHtml ? overviewSource : null,
    description: paragraphTexts.length ? paragraphTexts.join(' ') : null,
    exampleTopics,
    examples: exampleFiles,
  };
}

async function buildRegistry() {
  const names = await listComponentNames();
  const { docs, docsByUrl } = await parseDocsRoutes();
  const components = [];

  for (const name of names) {
    const entryDir = path.join(componentsDir, name);
    const publicApiPath = path.join(entryDir, 'public-api.ts');
    const files = await collectFiles(entryDir, file => file.endsWith('.ts') || file.endsWith('.scss'));
    const sourceParts = await Promise.all(files.map(file => readText(file)));
    const combinedSource = sourceParts.join('\n');
    const selectors = parseSelectors(combinedSource);
    const exportedSymbols = parseExportedSymbols(combinedSource);
    const styleSource = sourceParts.filter((_, index) => files[index].endsWith('.scss')).join('\n');

    const docEntry = findDocEntry(name, docs, docsByUrl);
    const overview = await getOverviewMetadata(docEntry);
    const guidance = curatedGuidance.get(name) || {};
    const purpose = guidance.purpose || (overview?.description ? firstSentence(overview.description) : buildFallbackPurpose(titleize(name), overview?.exampleTopics || []));
    const useWhen = guidance.useWhen || buildFallbackUseWhen(titleize(name), overview?.category, overview?.exampleTopics || []);

    components.push({
      name,
      title: titleize(name),
      overviewName: overview?.title || titleize(name),
      category: overview?.category || null,
      package: '@ngstarter-ui/components',
      importPath: `@ngstarter-ui/components/${name}`,
      publicApi: path.relative(rootDir, publicApiPath),
      sourceRoot: path.relative(rootDir, path.join(entryDir, 'src')),
      docsPath: docEntry?.url || null,
      docsOverviewSource: overview?.source || null,
      purpose,
      useWhen,
      exampleTopics: overview?.exampleTopics || [],
      minimalExample: overview?.examples?.[0]?.source || priorityExamples.get(name) || null,
      exampleFiles: overview?.examples || [],
      previewAsset: await readText(path.join(entryDir, 'preview.svg')) ? `projects/components/${name}/preview.svg` : null,
      selectors,
      exportedSymbols,
      inputs: unique([...parseSignalInputs(combinedSource), ...parseDecoratorInputs(combinedSource), ...parseModels(combinedSource)]),
      outputs: unique(parseOutputs(combinedSource)),
      cssTokens: parseCssTokens(styleSource),
      example: priorityExamples.get(name) || null,
    });
  }

  return {
    $schema: 'https://ngstarter.com/schemas/component-registry.schema.json',
    generatedBy: 'scripts/generate-ai-metadata.mjs',
    package: '@ngstarter-ui/components',
    description: 'AI-readable registry for NgStarter UI Angular secondary entry points.',
    componentCount: components.length,
    conventions: {
      importPattern: '@ngstarter-ui/components/<component>',
      selectorPrefix: 'ngs',
      themeTokenPrefix: '--ngs-',
      themeStylesheetExample: "@use '@ngstarter-ui/components/styles/themes/default';",
    },
    recipes,
    components,
  };
}

function buildLlms(registry, full = false) {
  const lines = [
    '# NgStarter UI',
    '',
    'NgStarter UI is an AI-friendly Angular component kit for admin panels and product dashboards.',
    '',
    'Package: `@ngstarter-ui/components`',
    'Angular: 21',
    'Primary docs: https://ngstarter.com',
    'AI registry: https://ngstarter.com/ai/component-registry.json',
    '',
    '## Usage Rules',
    '',
    '- Import components from secondary entry points: `@ngstarter-ui/components/<component>`.',
    '- Import theme styles once in the app stylesheet.',
    '- Use `provideNgsTheme` from `@ngstarter-ui/components/core` for runtime theming.',
    '- Prefer `--ngs-*` CSS custom properties when customizing styles.',
    '- Do not import from private `src` paths in application code.',
    '',
    '## Setup',
    '',
    '```scss',
    "@use '@ngstarter-ui/components/styles/themes/default';",
    '```',
    '',
    '```ts',
    "import { provideNgsTheme } from '@ngstarter-ui/components/core';",
    '',
    'export const appConfig = {',
    '  providers: [provideNgsTheme({ theme: \'enterprise\', colorScheme: \'auto\' })],',
    '};',
    '```',
    '',
    '## Common Imports',
    '',
    "```ts",
    "import { Button } from '@ngstarter-ui/components/button';",
    "import { Dialog } from '@ngstarter-ui/components/dialog';",
    "import { Input } from '@ngstarter-ui/components/input';",
    "import { Select } from '@ngstarter-ui/components/select';",
    "import { Table } from '@ngstarter-ui/components/table';",
    "```",
    '',
    '## Recipes',
    '',
  ];

  for (const recipe of registry.recipes || []) {
    lines.push(`### ${recipe.name}`);
    lines.push(recipe.description);
    lines.push('');
    lines.push(`Verification: \`${recipe.verificationCommand}\``);
    lines.push('');
    lines.push('Must use:');
    for (const item of recipe.mustUse) {
      lines.push(`- \`${item}\``);
    }
    if (full) {
      lines.push('');
      lines.push('Must not:');
      for (const item of recipe.mustNot) {
        lines.push(`- ${item}`);
      }
      if (recipe.typography) {
        lines.push('');
        lines.push('Typography:');
        lines.push(`- Normal text weights: ${recipe.typography.normalTextWeights.join(', ')}`);
        lines.push(`- Navigation weights: ${recipe.typography.navigationWeights.join(', ')}`);
        lines.push(`- Button weights: ${recipe.typography.buttonWeights.join(', ')}`);
        lines.push(`- Heading weights: ${recipe.typography.headingWeights.join(', ')}`);
        lines.push(`- Reserve heavy weights for: ${recipe.typography.reserveHeavyWeightsFor.join(', ')}`);
      }
    }
    lines.push('');
  }

  lines.push(
    '## Components',
    '',
  );

  const components = full ? registry.components : registry.components.filter(component => component.docsPath || component.example);

  for (const component of components) {
    const docs = component.docsPath ? ` docs: ${component.docsPath}` : '';
    lines.push(`- ${component.name}: \`${component.importPath}\`${docs}`);

    if (full) {
      lines.push(`  purpose: ${component.purpose}`);
      lines.push(`  use when: ${component.useWhen}`);
      if (component.exampleTopics.length) {
        lines.push(`  example topics: ${component.exampleTopics.slice(0, 8).join(', ')}`);
      }
      if (component.selectors.length) {
        lines.push(`  selectors: ${component.selectors.map(selector => `\`${selector}\``).join(', ')}`);
      }
      if (component.exportedSymbols.length) {
        lines.push(`  exports: ${component.exportedSymbols.slice(0, 12).map(symbol => `\`${symbol}\``).join(', ')}`);
      }
      if (component.inputs.length) {
        lines.push(`  inputs: ${component.inputs.slice(0, 24).map(input => `\`${input}\``).join(', ')}`);
      }
      if (component.outputs.length) {
        lines.push(`  outputs: ${component.outputs.slice(0, 24).map(output => `\`${output}\``).join(', ')}`);
      }
      if (component.cssTokens.length) {
        lines.push(`  tokens: ${component.cssTokens.slice(0, 16).map(token => `\`${token}\``).join(', ')}`);
      }
    }
  }

  return `${lines.join('\n')}\n`;
}

const registry = await buildRegistry();

for (const target of registryTargets) {
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, `${JSON.stringify(registry, null, 2)}\n`);
}

for (const target of llmsTargets) {
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, buildLlms(registry, target.endsWith('llms-full.txt')));
}

for (const target of registryTargets) {
  console.log(`Wrote ${path.relative(rootDir, target)} with ${registry.componentCount} entries.`);
}
for (const target of llmsTargets) {
  console.log(`Wrote ${path.relative(rootDir, target)}.`);
}
