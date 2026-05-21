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
    description: 'Build admin dashboards from NgStarter UI primitives instead of hand-rolled shell, cards, forms, datatables, static tables, and pagination.',
    mustUse: [
      '@ngstarter-ui/components/sidenav',
      '@ngstarter-ui/components/navigation',
      '@ngstarter-ui/components/card',
      '@ngstarter-ui/components/data-view',
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
      datatables: ['DataView'],
      operationalDatasets: ['DataView'],
      staticTables: ['Table', 'ColumnDef', 'HeaderCell', 'HeaderCellDef', 'Cell', 'CellDef', 'HeaderRow', 'HeaderRowDef', 'Row', 'RowDef'],
      search: ['FormField', 'Label', 'Input', 'IconPrefix'],
      pagination: ['Paginator'],
      actions: ['Button', 'Icon'],
      selection: ['Checkbox'],
      progress: ['ProgressBar'],
    },
    mustNot: [
      'Do not build datatables or operational admin datasets with role="table", plain table markup, or div grids when DataView fits.',
      'Do not use DataView for purely static/read-only tabular content when ngs-table fits.',
      'Do not build static/read-only tables with role="table" div grids when ngs-table fits.',
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
    purpose: 'Switch the application color scheme between light, dark, and auto.',
    useWhen: 'Use anywhere in the UI where users need to control the global light, dark, or auto theme mode. Do not use it for brand colors, accent colors, object colors, statuses, or palettes.',
  },
  'color-switcher': {
    purpose: 'Let users choose one color from a fixed allowed palette.',
    useWhen: 'Use for brand color presets, accent color presets, project colors, category colors, tag colors, tenant branding, and theme playground controls. Use ColorPicker for arbitrary custom colors and ColorScheme for light, dark, or auto theme mode.',
  },
  'command-bar': {
    purpose: 'Show a floating contextual action bar for selected items or temporary page state.',
    useWhen: 'Use when rows, files, cards, canvas objects, or other page items are selected and users need quick actions such as edit, delete, archive, move, export, or share. Do not use it as a command palette, search UI, dropdown menu, header toolbar, navigation bar, autocomplete, or normal form action row.',
  },
  'comment-editor': {
    purpose: 'Provide a simplified text editor for quick messages, comments, threads, and replies.',
    useWhen: 'Use in tasks, projects, activity feeds, reviews, support threads, and conversation replies where users write a short or medium message and send it immediately. Do not use for long-form documents, CMS pages, complex content editing, markdown editing, code editing, search, or display-only comments.',
  },
  'comparison-slider': {
    purpose: 'Compare two aligned visual layers with a draggable before-and-after divider.',
    useWhen: 'Use for before-and-after images, photo edits, design changes, product variations, UI state diffs, image processing results, maps, reports, and other visual diffs. Give the component a stable width and height or aspect ratio, and do not use it as a gallery, carousel, image viewer, range input, data comparison table, or text comparison tool.',
  },
  confirm: {
    purpose: 'Show a standardized confirmation dialog for a short binary decision before an important action.',
    useWhen: 'Use through ConfirmManager.open({ title, description }) before delete, unpublish, archive, reset, discard changes, leave with unsaved changes, bulk, destructive, irreversible, or high-impact operations. Do not use for long forms, custom modal layouts, wizards, informational dialogs, settings panels, or choices with more than two outcomes; use Dialog for custom modal content.',
  },
  'content-editor': {
    purpose: 'Provide a block-based builder for structured long-form content.',
    useWhen: 'Use ngs-content-builder for articles, pages, documentation, knowledge base entries, rich notes, editable descriptions, landing content, and CMS-like editing workflows built from blocks such as paragraph, heading, list, quote, code, divider, table, image, video, and embed. Do not use for quick messages, comments, threads, or reply composers; use CommentEditor for that. Do not use for a simple text field or small rich text input; use TextEditor, Input, or Textarea depending on the task.',
  },
  'content-fade': {
    purpose: 'Add a visual gradient fade at the edge of clipped or scrollable content.',
    useWhen: 'Use for horizontal preview text, teaser rows, chips, compact lists, or cropped inline content when an edge should fade out instead of ending abruptly. The parent container must provide width, height, scroll behavior, or overflow-hidden; ContentFade does not manage overflow, expansion, truncation, or scrolling by itself. Do not use for loading skeletons, collapsed content logic, tooltips, pagination, modal clipping, ellipsis truncation, or long article reading.',
  },
  core: {
    purpose: 'Provide infrastructure primitives, theme setup, services, directives, pipes, tokens, and low-level utilities.',
    useWhen: 'Use @ngstarter-ui/components/core for infrastructure, not for building screens directly. Use provideNgsTheme in app config to set theme, colorScheme, radius, primaryColor, persistence, and storageKey. Inject ThemeManagerService for runtime theme, color scheme, radius, and primary color changes. Use utility directives such as ngsRipple, ngsAutoFocus, ngsFocusElement, ngsTextareaAutoSize, and ngsDebounceTime when a specific low-level behavior is needed. Use pipes such as InitialsPipe, FormatFileSizePipe, SafeHtmlPipe, SafeResourceUrlPipe, OrderByPipe, FilterByPropertyPipe, and SearchByPropertyPipe when they fit. Use ErrorStateMatcher or ShowOnDirtyErrorStateMatcher for form error behavior, and observer/services/utils only for low-level infrastructure. Do not use core as a replacement for real UI components. Do not build admin screens from core primitives; choose concrete components such as Button, Card, DataView, Table, FormField, Dialog, Navigation, Layout, or other component entry points. Do not import Option from core directly for ordinary option lists when Select, Autocomplete, or another component owns the option pattern.',
  },
  'cookie-popup': {
    purpose: 'Collect a non-blocking cookie or privacy consent choice.',
    useWhen: 'Use on public pages or apps when users need to accept all cookies or only necessary cookies and see a short cookie/privacy message with a policy link. The consumer must persist the accepted choice in a cookie, localStorage, or backend and control visible state. Do not use as a normal Dialog, Alert, Announcement, snackbar, or settings panel.',
  },
  'country-select': {
    purpose: 'Let users choose a country from the built-in country list and store its ISO country code.',
    useWhen: 'Use in addresses, user profiles, billing, shipping, legal forms, tax forms, tenant settings, and locale settings where the form value should be a country code such as US, PL, or DE. The component shows country flags and names, supports search by name or ISO code, and integrates with FormField. Do not use for phone dialing codes; use PhoneInput. Do not use for currency selection; use CurrencySelect. Do not use for custom region, city, office, or location lists; use Select or Autocomplete.',
  },
  crop: {
    purpose: 'Let users choose a rectangle or circle crop area on top of an existing image or visual preview.',
    useWhen: 'Use for avatar dialogs, cover image forms, thumbnail preparation, media management screens, and content editor flows where the user chooses the visible crop area. Crop emits selectionApplied with pixel coordinates, percentages, and container size. It does not upload files, save images, zoom the image, open a gallery, compare images, or process the final bitmap; handle those steps outside the component.',
  },
  'currency-select': {
    purpose: 'Let users choose a currency from the built-in currency list and store its ISO currency code.',
    useWhen: 'Use for billing, pricing, invoices, checkout, marketplace, finance settings, reporting settings, tenant settings, and locale settings where the form value should be a currency code such as USD, EUR, or PLN. The component shows a flag, ISO code, and symbol, supports search by currency name or code, and can show country names with showCountryName. Do not use for country selection; use CountrySelect. Do not use for entering a money amount; pair it with Input/FormField. Do not use for exchange calculators, rate tables, or number formatting.',
  },
  'data-view': {
    purpose: 'Build operational data grids for records that users need to inspect, organize, select, and act on.',
    useWhen: 'Use for datatables and working data surfaces in admin screens, CRM and ERP records, users, orders, invoices, logs, tasks, assets, and any dataset where the table is the main interactive work surface. Choose DataView when users need row actions, selection, sorting, search/filter state, pagination, loading or empty states, column resizing, column visibility/order, pinned or sticky columns, custom cell renderers, refresh, snapshots, server-side data, or ngsDataViewActionBar. DataView is configured with columnDefs plus local data or a server-side datasource. Do not use for small static tables or simple read-only tabular content; use Table. Do not use as a card list, layout grid, chart widget, report summary, or form editor.',
  },
  'date-format-select': {
    purpose: 'Let users choose a preferred date display format string from a predefined list.',
    useWhen: 'Use in account settings, profile settings, tenant settings, localization preferences, and reporting settings where users choose how dates should appear in the UI or exported reports. The form value is a format string such as MM/dd/yyyy, dd.MM.yyyy, or yyyy-MM-dd; override the available options with dateFormats when needed. Do not use to pick an actual date; use Datepicker. Do not use for date ranges, calendars, schedules, period filters, or direct date formatting in a template.',
  },
  datepicker: {
    purpose: 'Let users choose a concrete date or date range through an input connected to a calendar overlay.',
    useWhen: 'Use input[ngsDatepicker], ngs-datepicker, and usually ngs-datepicker-toggle for single date fields in forms, filters, deadlines, birth dates, publish dates, schedules, reporting, invoices, and order dates. Use ngs-date-range-input with ngs-date-range-picker for start/end ranges, report periods, booking windows, analytics ranges, and quick presets. The form value is a date object handled by the configured DateAdapter, not a date format string. Do not use to choose a date display format; use DateFormatSelect. Do not use to choose only a time; use Timepicker. Do not use as a static event calendar, scheduler, timeline, or date formatter.',
  },
  dialog: {
    purpose: 'Open custom focused modal workflows above the current page.',
    useWhen: 'Use Dialog.open(ComponentOrTemplate, config) for forms, editing records, creating objects, settings, detail views, wizard-like steps, scrollable content, and custom modal workflows where users must complete or close the task before returning to the page. Structure custom dialog components with ngs-dialog-title, ngs-dialog-content, ngs-dialog-actions, DialogRef.close(...), ngs-dialog-close, and optional DIALOG_DATA. Use DialogConfig for data, sizing, disableClose, autofocus, backdrop, panel classes, and accessibility labels. Do not use for a short binary destructive confirmation; use Confirm. Do not use for global messages; use Announcement, Alert, or SnackBar. Do not use for mobile bottom action panels; use BottomSheet. Do not use for side inspectors, filters, or detail panels; use Drawer or SidePanel.',
  },
  divider: {
    purpose: 'Separate related groups of content or actions with a visual rule.',
    useWhen: 'Use ngs-divider in lists, forms, panels, cards, toolbars, popovers, settings screens, and dense layouts where a clear boundary between groups helps scanning. Use vertical dividers between inline actions or columns, horizontal dividers between sections, inset when the line should align with content, and fixedHeight for compact vertical dividers. Use ngs-text-divider when the separator needs a short label such as “or”. Do not use Divider to create empty space or layout structure; use Tailwind spacing and layout classes. Prefer specialized divider components inside systems that provide them, such as MenuDivider, NavigationDivider, SidebarDivider, and CommandBarDivider.',
  },
  drawer: {
    purpose: 'Show custom side content in a right-side overlay while keeping the current page as context.',
    useWhen: 'Use for any secondary side content or workflow that should open beside the current screen without navigating away: forms, filters, record details, settings, previews, history, activity feeds, help content, quick actions, inspectors, or other custom panels. Open with #drawer="ngsDrawer" and drawer.open()/drawer.close(), or control with [isOpen]. Use [showBackdrop]="false" for a non-blocking side panel. Do not use for centered modal workflows; use Dialog. Do not use for short confirmations; use Confirm. Do not use for mobile bottom action panels; use BottomSheet. Do not use as the primary persistent app navigation; use navigation/sidebar components.',
  },
  'emoji-picker': {
    purpose: 'Let users choose one Unicode emoji from an overlay picker.',
    useWhen: 'Use in comments, chats, quick messages, reactions, comment/editor toolbars, social features, and any text entry flow where users need to insert or choose an emoji. Open from a button or toolbar action with [ngsEmojiPickerTriggerFor], then handle emojiSelected as the selected emoji string. It supports categorized emoji data, language from LOCALE_ID or the language input, hover preview, and loading skeletons. Do not use for interface icons; use Icon. Do not use for normal action menus; use Menu. Do not use as a full editor; use CommentEditor or TextEditor. Do not use for custom stickers, GIFs, or media pickers unless the value is a Unicode emoji.',
  },
  'empty-state': {
    purpose: 'Explain why an expected content area is empty and optionally offer a next action.',
    useWhen: 'Use for empty tables, lists, folders, dashboard sections, first-run screens, no search results, no filtered data, no projects yet, no messages yet, and similar no-content states. Compose with ngs-empty-state, ngs-empty-state-title, ngs-empty-state-content, optional ngs-empty-state-icon or ngs-empty-state-image, and ngs-empty-state-actions for useful next steps such as Create, Clear filters, Invite, or Upload. In DataView, prefer EmptyState inside empty templates for custom dataset empty states. Do not use for loading states; use BlockLoader, Skeleton, or ProgressSpinner. Do not use for critical errors; use Alert or ActionRequired. Do not use as a decorative placeholder, hero block, or marketing section.',
  },
  expand: {
    purpose: 'Collapse one long content block to a limited-height preview with a fade and show-more control.',
    useWhen: 'Use for long descriptions, comments, changelog entries, release notes, activity text, terms snippets, card descriptions, and compact summaries where the page should stay scannable but users can reveal the full content inline. Supports expanded, expandedChange, height, color, expandLabel, collapseLabel, and showButtonIfExpanded. Do not use for independent collapsible sections; use ExpansionPanel or accordion. Do not use for hierarchical expandable nodes; use Tree. Do not use for read-more navigation to another page, tabs, steppers, form disclosure logic, or as a generic container/card.',
  },
  expansion: {
    purpose: 'Group independent collapsible sections with headers and bodies.',
    useWhen: 'Use ngs-expansion-panel for one collapsible section and ngs-accordion for a coordinated group of panels. Use for settings groups, FAQs, advanced options, filters, grouped form sections, detail sections, onboarding or setup steps, and inspector groups where each section has its own title and content. Supports expanded, expandedChange, opened, closed, disabled, hideToggle, ngs-expansion-panel-header, ngs-expansion-panel-title, ngs-expansion-panel-description, ngs-action-row, accordion multi, openAll(), and closeAll(). Do not use to truncate one long text block; use Expand. Do not use for hierarchical nodes; use Tree. Do not use as tabs, a strict stepper flow, or a plain card/container without collapse behavior.',
  },
  'filter-builder': {
    purpose: 'Let users construct a structured tree of filtering rules from fields, operations, and values.',
    useWhen: 'Use for advanced filters, saved views, report builders, admin datasets, CRM or ERP records, audit logs, catalogs, product filtering, and segmentation workflows where a simple search field is not enough. Configure fields with fieldDefs using dataField, name, dataType, optional lookup, and filterOperations. Users can build conditions and nested groups with and/or, and valueChanged emits FilterBuilderGroup[]. The app must translate that emitted tree into an API query, SQL or DSL condition, DataView datasource params, or local filtering logic. Do not use for ordinary text search; use Input or a search field. Do not use for a simple table filter string; use DataView/Table filtering. Do not use as a data-editing form, query-language editor, chart filter chip bar, or full report builder with visualizations.',
  },
  'form-field': {
    purpose: 'Wrap one form control with the standard NgStarter field layout, label, hint, error, and prefix/suffix slots.',
    useWhen: 'Use one ngs-form-field around one form control: input ngsInput, textarea ngsInput, ngs-select, ngs-autocomplete input, datepicker input, CountrySelect, CurrencySelect, DateFormatSelect, PhoneInput, NumberInput, and custom controls that implement FormFieldControl. Use ngs-label for labels, ngs-hint for helper text, ngs-error for validation messages, and ngsIconPrefix/ngsIconButtonPrefix/ngsTextPrefix/ngsIconSuffix/ngsIconButtonSuffix/ngsTextSuffix for field adornments. For groups of fields, use TailwindCSS grid/flex/layout classes around multiple form fields; each individual control still gets its own ngs-form-field. Do not use ngs-form-field as a layout container, card, spacing wrapper, or wrapper around non-form UI. Do not wrap checkbox, radio, button, or toggle controls when they have their own label pattern.',
  },
  'form-renderer': {
    purpose: 'Render backend-driven or config-driven forms from a FormConfig.',
    useWhen: 'Use when the backend or an admin configuration defines the form structure: dynamic settings, surveys, onboarding schemas, profile or config forms, CMS forms, tenant-specific forms, and feature-specific forms where fields can change without editing the Angular template. FormRenderer creates a FormGroup, renders fields from elements, places them through layout, applies validators and crossValidators, handles initialValue, visibleWhen, disabled state, content blocks, and emits valueChanges, formSubmit, and initialized. Do not use for ordinary static forms where fields are known in Angular code; build those manually with TailwindCSS grid/flex layout and one ngs-form-field per control. Do not use as a replacement for FormField, a wizard/stepper workflow, or an arbitrary page builder.',
  },
  gauge: {
    purpose: 'Visualize one compact 0–100 percentage-like value as a circular radial metric.',
    useWhen: 'Use in dashboard cards, sidebar widgets, KPI panels, usage or quota blocks, storage usage, completion score, health score, capacity, and utilization indicators. Use ngs-gauge-value to show a number or short label inside the gauge, and customize size with Tailwind size classes or strokeWidth/radius. Do not use for linear process progress; use ProgressBar. Do not use for loading; use ProgressSpinner, BlockLoader, or Skeleton. Do not use for full analytical charts with axes, legends, multiple series, or trends. Do not use for small table-row statuses; use Badge or Status.',
  },
  grid: {
    purpose: 'Render static dashboard widgets in a predefined 12-column layout.',
    useWhen: 'Use ngs-grid when the application defines a static dashboard or widget layout and users do not need to rearrange, customize, or save the dashboard order. Provide configs that map item types to components and items with id, type, columns, height, content, skeletonHeight, and children. Widgets can inject GRID and call markItemAsLoaded(id), especially with waitWhenAllItemsLoaded. Use Grid for fixed analytics sections, portal start pages, and nested dashboard sections where the structure is known. Do not use Grid as a normal CSS layout helper for forms, pages, cards, or repeated elements; use TailwindCSS grid/flex classes. Do not use Grid for dashboards users can rearrange or change; use Tiles. Do not use for tables or datasets; use Table or DataView. Do not use for file/media grids; use upload/media components.',
  },
  'guided-tour': {
    purpose: 'Guide users through the real UI with ordered steps attached to existing elements.',
    useWhen: 'Use for first-run onboarding, feature discovery, setup guidance, new feature education, and complex screen walkthroughs where each step points at a real element through ngsTourAnchor, a selector, or an element callback. Use withBackdrop to highlight the current element, waitFor for dynamic content, route for tours that continue across pages, and template/htmlContent for richer step content. Do not use for simple hover hints; use Tooltip. Do not use for anchored menus or arbitrary floating content; use Popover. Do not use for confirmations or modal workflows; use Confirm or Dialog. Do not use for form wizards or multi-step data entry; use Stepper or HeadlessStepper. Do not use for documentation pages or marketing onboarding screens; use normal page content.',
  },
  'headless-stepper': {
    purpose: 'Provide stepper state and validation logic without rendering a fixed visual stepper UI.',
    useWhen: 'Use for custom multi-step workflows where the product needs its own header, progress indicator, buttons, layout, or responsive presentation while keeping standard NgStarter step behavior. Use ngs-headless-stepper with ngs-headless-step when you need selectedIndex, selected step state, progressPercent, canMoveNext, next(), previous(), reset(), linear mode, optional steps, and stepControl validation. Good for custom wizards, onboarding forms, checkout flows, setup flows, and complex forms with a bespoke layout. Do not use when the standard visual Stepper fits; use Stepper. Do not use for guided tours over existing UI; use GuidedTour. Do not use as Tabs, Accordion, or for a simple single-page form without steps.',
  },
  icon: {
    purpose: 'Render consistent SVG interface icons from installed Iconify icon sets.',
    useWhen: 'Use ngs-icon with a full Iconify name such as fluent:grid-24-regular or circle-flags:us for icons in NgStarter buttons, navigation, menus, form field prefixes and suffixes, statuses, metadata, empty states, alerts, announcements, table actions, toolbar actions, and compact flag markers. Size icons with Tailwind classes such as size-4, w-5, or h-5, or use the default --ngs-icon-size. Color icons with text color classes or --ngs-icon-color. Do not use ngs-icon as a clickable action by itself; wrap it in an NgStarter button such as button[ngsIconButton]. Do not use Icon for people or entities; use Avatar. Do not use Icon for counters or small labels; use Badge. Do not use Icon for large artwork, product illustrations, screenshots, or logos. Do not hand-roll inline SVG when an approved Iconify icon exists.',
  },
  'image-designer': {
    purpose: 'Provide a full canvas-based image composition editor with layers, assets, text, backgrounds, effects, and snapshots.',
    useWhen: 'Use when users need to create or customize an image by composing multiple layers such as text, photos, uploaded assets, shapes, patterns, gradients, backgrounds, effects, opacity, typography, fit, flip, lock, and resize presets. Use for banner designers, social image builders, thumbnail editors, promo card creators, template-based creative tools, and embedded product design studios. Persist and restore work with ImageDesignerSnapshot, provide asset libraries with assetsDataSource or photosDataSource, handle uploads with uploadFn, and listen to snapshotChanged. Do not use for simple image viewing; use ImageViewer. Do not use for zoom/pan inspection; use ImageZoomViewer. Do not use for crop-only work; use Crop. Do not use for resize-only flows; use ImageResizer. Do not use for loading or missing-image placeholders; use ImagePlaceholder. Do not use for plain upload previews, color picking, or simple avatar/banner settings; use the smaller dedicated components or a normal form.',
  },
  'image-placeholder': {
    purpose: 'Render a simple SVG placeholder inside an image slot when the real image is not available yet.',
    useWhen: 'Use for image cards, media grids, upload slots, attachment previews, product thumbnails, gallery cells, banner areas, and image preview areas when an image is loading, missing, unavailable, or failed to load and the layout should keep a stable size. Give ngs-image-placeholder an explicit width, height, or aspect ratio with Tailwind classes. The component does not load images, handle upload state, or manage errors; it only renders a visual placeholder. Do not use for full empty states; use EmptyState. Do not use for skeleton loading of a full block; use Skeleton. Do not use for spinners or blocking progress; use ProgressSpinner or BlockLoader. Do not use for viewing, crop, resize, or editing; use ImageViewer, Crop, ImageResizer, or ImageDesigner. Do not use for user or team identity fallback; use Avatar.',
  },
  'image-resizer': {
    purpose: 'Let users interactively change the displayed width of an img element with side drag handles.',
    useWhen: 'Use ngs-image-resizer around a standard img marked with ngsImageResizerImage when users need to manually choose how large an image appears in an editor, content form, thumbnail preview, banner preview, or media preparation flow. Configure imageMinWidth and imageMaxWidth and listen to imageResized for rendered width, rendered height, naturalWidth, and naturalHeight. The component changes the displayed CSS width of the image; it does not crop, compress, upload, optimize, or rewrite the source file. Do not use for crop selection; use Crop. Do not use for zoom and pan inspection; use ImageZoomViewer. Do not use for simple viewing; use ImageViewer. Do not use for full canvas/layer editing; use ImageDesigner. Do not use for resizing panels or layout containers; use ResizableContainer. Do not use for backend image processing or placeholders.',
  },
  'image-viewer': {
    purpose: 'Open a full-size image in a focused lightbox-style overlay from a thumbnail, card, or gallery item.',
    useWhen: 'Use ngsImageViewer on a group and ngsImageViewerPicture on each clickable preview item when users should click a thumbnail or card to inspect a full-size image from sourceUrl. The overlay supports close, loading spinner, zoom in/out, drag and pan when zoomed, and optional title, caption, and description via inputs or templates. Use for galleries, attachment previews, product images, media detail previews, portfolio images, and image cards. Do not use for inline zoom inspection without an overlay; use ImageZoomViewer. Do not use for image editing, layers, crop, or resizing; use ImageDesigner, Crop, or ImageResizer. Do not use for before/after comparison; use ComparisonSlider. Do not use for static non-clickable images; use normal img. Do not use for video previews; use VideoViewer. Do not use for missing or loading placeholders; use ImagePlaceholder.',
  },
  'image-zoom-viewer': {
    purpose: 'Give an inline image a Medium-style click-to-zoom overlay animation from its current page position.',
    useWhen: 'Use ngs-image-zoom-viewer around a normal image marked with ngsImageZoomViewerImage when users should quickly enlarge one inline image without a gallery structure. Good for articles, product pages, portfolios, documentation screenshots, reports, and image-rich content. The component clones the same image into an overlay, animates it from the original position to a larger centered view, closes on backdrop click or Escape, and recalculates zoom on window resize. Do not use for thumbnail galleries that need full-size sourceUrl, title, caption, or description; use ImageViewer. Do not use for image editing, crop selection, displayed-width resizing, or before/after comparison; use ImageDesigner, Crop, ImageResizer, or ComparisonSlider. Do not use for plain static images or placeholders.',
  },
  incidents: {
    purpose: 'Show an application-level service incident or operational notice with a compact bar and expandable incident updates.',
    useWhen: 'Use for service outages, degraded service, maintenance windows, global system status, and important operational notices that users should see across the app or portal. Compose manually with ngs-incidents, ngs-incidents-bar, ngs-incidents-title, ngs-incidents-description, ngs-incidents-list, ngs-incident, ngs-incident-title, ngs-incident-details, ngsIncidentIcon, ngsIncidentButton, and ngsIncidentClose. For global dynamic incidents, place ngs-incidents-global near the app root and call IncidentsStore.show({ title, description, incidents }) or hide(). Do not use for local inline messages; use Alert. Do not use for user-required critical actions; use ActionRequired. Do not use for toast notifications, table row statuses, empty states, or full incident management/history pages; use notification components, Badge, Status, EmptyState, Table, or DataView.',
  },
  'inline-text-edit': {
    purpose: 'Let users edit already visible plain text directly in place with a contenteditable host.',
    useWhen: 'Use for quick rename and edit-in-place flows such as project names, task names, card titles, table labels, short descriptions, headings, and other small text values where opening a separate form would be too heavy. It saves on Enter or blur, cancels on Escape, emits the trimmed value through contentChanged, supports placeholder, and can delay emissions with delay. Do not use for normal labeled forms, validation-heavy fields, or textarea workflows; use ngs-form-field with ngsInput or textarea. Do not use for rich text, long content, comments, replies, or documents; use TextEditor, ContentEditor, or CommentEditor. Do not use for value selection or complex save/cancel flows with explicit buttons.',
  },
  input: {
    purpose: 'Apply NgStarter form styling and FormField integration to native input and textarea controls.',
    useWhen: 'Use input[ngsInput] or textarea[ngsInput] for regular text entry such as search, email, password, URL, plain phone-like text, textarea values in forms, filters, settings forms, profile forms, and admin forms. Usually place exactly one ngsInput control inside one ngs-form-field with ngs-label, ngs-hint, ngs-error, and optional prefix or suffix. It supports placeholder, required, disabled, readonly, focus behavior, Angular forms, and ErrorStateMatcher. Do not use for numeric controls with step/min/max UX; use NumberInput. Do not use for phone country/dial-code input; use PhoneInput. Do not use for masked formats by itself; pair ngsInput with InputMask directives. Do not use for Select, Autocomplete, Datepicker, Timepicker, CurrencySelect, CountrySelect, checkbox, radio, toggle, or buttons. Do not use for inline rename; use InlineTextEdit. Do not use for comments/replies or rich/block content; use CommentEditor, TextEditor, or ContentEditor. Do not use ngsInput as a layout wrapper or standalone replacement for FormField when label, hint, and error behavior are needed.',
  },
  'input-mask': {
    purpose: 'Format credit card input fields while the user types with ready-made mask directives.',
    useWhen: 'Use on native inputs, usually with ngsInput inside ngs-form-field, for payment or billing fields that need credit card formatting. Available directives are ngsCreditCardNumberMask for grouped card numbers, ngsCreditCardExpiryDateMask for MM/YY expiry, and ngsCreditCardCvvMask for CVV/CVC. The directives format the visible input, set useful mobile keyboard and autocomplete attributes where applicable, and keep the Angular form value cleaned for card number and expiry. Do not use as a universal mask engine, validator, payment security layer, or compliance solution. Do not use for phone numbers; use PhoneInput. Do not use for custom IDs, tax numbers, IBAN, postal codes, arbitrary structured text, date pickers, selects, currency fields, country fields, or formatting saved display values; use dedicated components, validators, backend checks, or a custom mask directive.',
  },
  'input-validator': {
    purpose: 'Provide ready-made Angular ValidatorFn helpers for common reusable form validation rules.',
    useWhen: 'Use in reactive forms with ngs-form-field, ngsInput, Angular Validators, and ngs-error when a preset client-side validator fits. Current payment presets include creditCardNumberValidator() for cleaned card number length and Luhn checksum, expiryDateValidator() for MMYY expiry format, valid month, and not-in-past checks, and creditCardCvvValidator() for numeric CVV/CVC length with optional minLength and maxLength. Pair these validators with InputMask directives when the user also needs formatted payment input. Do not use InputValidator as a UI component, input formatter, input mask, replacement for Angular built-in validators, backend validation, payment processor validation, or security/compliance layer. Do not use for arbitrary custom business rules unless a dedicated preset exists; write a project validator.',
  },
  'kanban-board': {
    purpose: 'Render a horizontal workflow board with status columns and draggable cards.',
    useWhen: 'Use ngs-kanban-board for tasks, issues, CRM deals, hiring pipelines, content workflows, support tickets, and other status-based boards where users drag items within a column or between columns. Provide columns with id, name, color, and items; each item should include at least name and position. Render cards through a custom ngsKanbanItemDef template and compose card content with NgStarter components such as Avatar, Badge, Icon, Button, and text. The board mutates local arrays with CDK moveItemInArray and transferArrayItem and emits itemSorted, itemTransferred, itemDropped, itemClick, itemAdd, columnEdit, and columnDelete; the app must persist the new order, status, and business data to the backend. Do not use for simple record tables; use Table or DataView. Do not use for static lists; use List. Do not use for dashboard widget layouts; use Grid. Do not use for calendars, timelines, arbitrary drag-and-drop builders, or screens without real workflow/status columns.',
  },
  kbd: {
    purpose: 'Display visual keyboard keys and shortcut hints.',
    useWhen: 'Use ngs-kbd for a single key such as Cmd, Shift, K, Esc, or an arrow key, and ngs-kbd-group for key combinations with plus signs between keys. Use in menus, command palettes, toolbars, help text, onboarding, documentation, and shortcut hints next to commands. Kbd is visual only: it does not register shortcuts, handle keyboard events, trigger actions, or provide command logic. Do not use as a clickable button; use Button or IconButton. Do not use for statuses or counts; use Badge. Do not use for tags or categories; use Chips. Do not use as normal body text or for actions that do not have a real shortcut handled elsewhere.',
  },
  layout: {
    purpose: 'Provide the base top-level shell for an application, admin area, dashboard, or large workspace page.',
    useWhen: 'Use ngs-layout as the outer structural frame when the whole screen needs topbar, header, sidebar, scrollable content, aside, or footer regions. Use root for a full viewport application shell. Use ngs-layout-content for the main scroll container, and LayoutApiService with layoutId when the sidebar must be shown, hidden, or toggled. Nested layouts are appropriate when a large app shell contains another structured workspace with its own header/content/footer. Do not use Layout as a small wrapper, card, spacing helper, form grouping tool, or generic grid system. Use TailwindCSS grid, flex, and spacing classes inside layout regions. Use Grid for static dashboard widgets, Tiles for dashboards users can rearrange or customize, DataView or Table for datasets, Drawer for overlay side panels, and Navigation, Sidebar, or Sidenav components inside sidebars.',
  },
  list: {
    purpose: 'Display a vertical group of related rows with consistent icon, avatar, title, line, meta, action, and selection structure.',
    useWhen: 'Use ngs-list with ngs-list-item for settings rows, files, messages, activity feed items, compact collections, simple action rows, and small repeated row groups. Use ngs-selection-list with ngs-list-option when users choose one or more rows. Use ngs-nav-list for simple navigation rows in sidebars or compact navigation areas. Use ngs-action-list for vertical action groups that are not dropdown menus. Compose each row with ngsListItemIcon or ngsListItemAvatar, ngsListItemTitle, ngsListItemLine, and ngsListItemMeta. Do not use List for large tabular datasets, columns, sorting, pagination, or bulk operations; use Table or DataView. Do not use for trigger-based dropdown or context actions; use Menu. Do not use as a full app navigation system when Navigation fits better. Do not use as a generic layout container.',
  },
  logo: {
    purpose: 'Render a product or brand logo as a composed mark, name, and optional description.',
    useWhen: 'Use ngs-logo or a[ngs-logo] in app shells, headers, sidebars, auth screens, splash screens, and branding areas. Compose it with ngs-logo-shape for the brand mark or image, ngs-logo-text for the product name with size small, default, or large, and ngs-logo-description for a short subtitle, version, or status. Use a[ngs-logo] when the logo navigates to the home page. Do not use Logo for user or team identity; use Avatar. Do not use for standalone action icons; use Icon inside Button or IconButton. Do not use for product thumbnails, decorative images, empty states, arbitrary SVG illustrations, or general image display.',
  },
  marquee: {
    purpose: 'Display an infinite horizontal stream of repeated non-critical content.',
    useWhen: 'Use ngs-marquee for motion content that can move and repeat without losing meaning: promo text, short highlights, logos, badges, partner names, compact news, and decorative content showcases. Use reverse to change direction. Use pauseOnHover when users may need more time to read or interact with the moving content. Do not use Marquee for important system notices, errors, warnings, required actions, or content the user must read; use Announcement, Alert, ActionRequired, or Incidents. Do not use for navigation, tables, task lists, precise ticker data, forms, or interactive work surfaces.',
  },
  menu: {
    purpose: 'Show a short contextual set of commands in an overlay opened from a trigger or right-click area.',
    useWhen: 'Use ngs-menu for row actions, overflow more actions, user menus, context menus, toolbar actions, and nested command groups. Put ngsMenuTriggerFor on a button ngsButton, button ngsIconButton, row action, or toolbar control. Use ngsContextMenuTriggerFor for right-click menus. Use button ngs-menu-item for commands, and ngs-menu-divider, ngs-menu-heading, ngs-menu-header, and ngs-menu-footer for structure. Use nested menus when a command opens a secondary command group. Use ngsMenuContent with ngsMenuTriggerData when the same menu template must render lazily for a specific row, user, or item. Do not use Menu for selecting form values; use Select, Autocomplete, ColorSwitcher, Datepicker, or another dedicated form control. Do not use for persistent navigation; use Navigation, Sidebar, Sidenav, or NavList. Do not use for long lists, tables, filters, forms, modal workflows, command palettes, or bulk action bars; use List, Table/DataView, Dialog, CommandBar, or Overlay/Popover as appropriate.',
  },
  'micro-chart': {
    purpose: 'Render compact line, bar, and pie charts for small trends, comparisons, and proportional breakdowns.',
    useWhen: 'Use ngs-mchart-line for a small trend over time or ordered values, ngs-mchart-bar for a compact comparison of several numeric values, and ngs-mchart-pie for a small proportional breakdown. Use MicroChart inside KPI cards, dashboard summaries, table cells, list rows, reports, and dense admin panels. It can also be used as a simple standalone dashboard chart when the chart type and level of detail match what MicroChart can display. Provide fixed dimensions with TailwindCSS classes such as w-*, h-*, or size-* because the chart renders inside its container. Use ngs-mchart-tooltip, ngs-mchart-tooltip-title, and ngs-mchart-tooltip-body when hover context is needed. Do not use MicroChart for complex analytics, detailed axes, advanced legends, drilldown, zooming, financial charting, or advanced interactions; use ECharts for complex charts. Do not use instead of ProgressBar or Gauge for a single progress percentage, Badge for status, or DataView/Table for tabular data.',
  },
  navigation: {
    purpose: 'Render a persistent product navigation structure when ngs-sidebar is not used.',
    useWhen: 'Use ngs-navigation for custom navigation areas, section navigation, settings navigation, admin navigation, and nested navigation groups when the screen needs product links but does not use ngs-sidebar. ngs-sidebar has its own navigation model, so do not duplicate ngs-navigation inside ngs-sidebar. Use ngs-navigation-item or [ngs-navigation-item] for destinations, key with activeKey for active state, activateByRoute for URL-based activation, autoScrollToActiveItem for long navigation, ngs-navigation-heading for sections, ngs-navigation-divider for group separation, and ngs-navigation-group with ngs-navigation-group-toggle and ngs-navigation-group-menu for expandable nested destinations. Use ngsNavigationItemIcon, ngsNavigationGroupToggleIcon, and ngsNavigationItemBadge for icons, toggles, and badges. Use dataSource with ngsNavigationItemDef when navigation comes from config or backend data. Do not use Navigation for trigger-based action menus; use Menu. Do not use for ordinary row lists; use List or NavList. Do not use for breadcrumbs, tabs, wizard steps, command palettes, form selection, table row actions, or bulk actions.',
  },
  notifications: {
    purpose: 'Display user-facing notification events in a structured feed or inbox.',
    useWhen: 'Use Notifications for events addressed to the current user: comments, mentions, invitations, assignments, access requests, status changes, completed processes, and user-specific updates. Use ngs-notification for one event, ngsNotificationAvatar for the source avatar or icon, ngs-notification-message for the main sentence, ngs-notification-actor for the actor, ngs-notification-content for nested context such as a comment, file, quote, card, or preview, and ngs-notification-time for time. Use isUnread for unread state. Use ngs-notification-list with ngsNotificationDef when notifications come from an array and each type needs its own template. Use ngsNotificationControlsDef for per-notification controls such as mute, delete, or mark as read, often with Menu. Do not use Notifications for page-level system messages; use Alert or Announcement. Do not use for critical required actions; use ActionRequired. Do not use for service health; use Incidents. Do not use for generic activity feeds that are not user notifications; use List. Do not use for transient toast/snackbar messages.',
  },
  'number-input': {
    purpose: 'Capture a numeric form value with typing, stepper controls, min/max limits, and Angular forms integration.',
    useWhen: 'Use ngs-number-input inside one ngs-form-field when users need to type a number or adjust it with increase/decrease controls. Good for quantities, limits, thresholds, durations, percentages, ratings, numeric settings, seat counts, day counts, and budget-like numeric values. Use ngModel or formControlName, min and max for allowed bounds, step for increment/decrement size, readonly/disabled/required as normal form states, and ngsDecreaseControl or ngsIncreaseControl only when custom control icons are needed. Use TailwindCSS classes on ngs-form-field or surrounding layout for width and grouping. Do not use for normal text; use ngsInput. Do not use for phone numbers; use PhoneInput. Do not use for OTP, MFA, passcodes, or invite codes; use PinInput. Do not use for selecting currency; use CurrencySelect plus a numeric amount field when needed. Do not use for sliders/ranges, display-only KPI values, progress, or charts; use the dedicated component such as Gauge, ProgressBar, MicroChart, or a text/KPI layout.',
  },
  option: {
    purpose: 'Provide a low-level selectable option primitive for Select, Autocomplete, and other option-parent controls.',
    useWhen: 'Use ngs-option inside ngs-select, ngs-autocomplete, and other NgStarter dropdown/listbox controls that explicitly expect options, such as CountrySelect, CurrencySelect, DateFormatSelect, Timepicker, FilterBuilder, and similar controls. Use [value] for the form value and disabled when the option cannot be selected. Use ngs-optgroup to group related options under a label. Keep option text short and readable because the viewValue is derived from the rendered text. Do not use ngs-option as a generic list row, button, menu item, navigation item, table row, card, or custom layout block. Use MenuItem or Button for actions, Navigation/List/NavList for navigation and lists, RadioCard for rich card selection, and ColorSwitcher for fixed color choices. Agents usually should not import Option separately unless they are composing Select, Autocomplete, or another option-based component.',
  },
  overlay: {
    purpose: 'Provide low-level shared positioning utilities for components that create Angular CDK floating overlays.',
    useWhen: 'Use Overlay only when implementing a new NgStarter component or custom directive that directly manages Angular CDK Overlay, portal rendering, backdrop or outside-click behavior, close behavior, keyboard/focus handling, and anchored positioning. Use OverlayPosition values such as below-start, below-center, below-end, above-*, before-*, and after-*. Use new PositionManager().build(position) to create fallback ConnectedPosition[] pairs. Do not use Overlay directly when building a normal admin page or feature screen. Prefer higher-level components: Menu for action dropdowns and context menus, Popover for lightweight anchored content, Dialog for modal workflows, Drawer for side overlays, Select/Autocomplete/Datepicker/ColorPicker for form dropdowns, and Tooltip for simple hints.',
  },
  'page-loading-bar': {
    purpose: 'Show a global thin loading bar during Angular Router navigation.',
    useWhen: 'Use ngs-page-loading-bar once in the top-level app shell or root layout, usually near the root layout or router outlet, to provide navigation feedback. It listens to Angular Router events automatically: NavigationStart shows the bar, and NavigationEnd, NavigationCancel, or NavigationError finish it. Use fixed when the bar should stay attached to the viewport. Do not use PageLoadingBar for loading a specific block, table, card, form, submit/save/upload operation, or async work inside a page. Use ProgressBar, ProgressSpinner, BlockLoader, Skeleton, ScreenLoader, or the component-specific loading state for local loading. Do not use it as a real task completion percentage; it is route navigation feedback only.',
  },
  paginator: {
    purpose: 'Control pages of a dataset with range label, previous/next navigation, optional first/last buttons, and page size selection.',
    useWhen: 'Use ngs-paginator next to paged tables, DataView screens, search results, record lists, and server-side browsing. Provide length for total records, pageSize for records per page, zero-based pageIndex for the current page, and pageSizeOptions for allowed page sizes. Handle the page event to update local data or request the next page from an API; PageEvent includes previousPageIndex, pageIndex, pageSize, and length. Use hidePageSize when the page size is fixed. Use showFirstLastButtons when users need quick first/last navigation. Use PaginatorIntl to localize labels and range text. Do not use Paginator for app route navigation; use Navigation, Tabs, or Breadcrumbs. Do not use for wizard or onboarding steps; use Stepper or HeadlessStepper. Do not use for carousel slides, media browsing, or standalone UI without a paged dataset. If DataView already owns pagination, use its pagination model instead of adding a separate paginator.',
  },
  panel: {
    purpose: 'Create a local structured work area with header, subheader, sidebar, scrollable content, aside, and footer regions.',
    useWhen: 'Use ngs-panel inside a page or workspace for admin modules, settings areas, editors, detail panes, inspectors, dashboard sections, and local surfaces that need their own header, footer, side columns, and scrollable body. Use ngs-panel-header for local title, toolbar, or actions; ngs-panel-subheader for filters or secondary status; ngs-panel-sidebar for a local left column; ngs-panel-content for the main scrollable area; ngs-panel-aside for a local right column; and ngs-panel-footer for local footer actions or status. Use absolute when the panel should fill the parent bounds. Use TailwindCSS classes for sizing, borders, spacing, and inner layout. Do not use Panel as the top-level application shell; use Layout. Do not use for small content blocks; use Card. Do not use for overlay side panels; use Drawer. Do not use as a generic spacing wrapper or form grid; use TailwindCSS grid/flex and FormField.',
  },
  'password-strength': {
    purpose: 'Show real-time password strength feedback and requirement status while users create or change a password.',
    useWhen: 'Use PasswordStrength in signup, reset password, change password, account security, and credential setup forms. Use input type="password" ngsInput inside one ngs-form-field for the actual password field, then place ngs-password-strength [password]="password.value" below it for the strength bar. Use ngs-password-strength-info with a template reference to the strength component when users need to see requirement status for lowercase, uppercase, digit, special character, min length, or custom rules. Use ngs-pass-toggle-visibility as a suffix control inside the password form field when users need show/hide password behavior. Configure min, max, enableLengthRule, enableDigitRule, enableSpecialCharRule, and customValidator as needed, and listen to strengthChanged when the screen needs the score. Do not use PasswordStrength for OTP, MFA, invite codes, or passcodes; use PinInput. Do not use for generic text validation. Do not use for a login password field unless the user is creating or changing a password and strength feedback is useful. Do not rely on it as the only password security policy; backend validation is still required.',
  },
  'phone-input': {
    purpose: 'Capture real phone numbers with country selection, flag, dial code, formatting, and libphonenumber-js validation.',
    useWhen: 'Use ngs-phone-input inside one ngs-form-field for profile, contact, billing, onboarding, checkout, support, invite, and contact forms when the value must be a real phone number. Use formControlName or ngModel, show invalidPhone with ngs-error, set defaultSelectedCountryCode when the initial country should not be us, use onlyCountries to restrict available countries, preferredCountries to pin common countries to the top, format="default | national | international" for display formatting, and countryChanged when the screen needs to react to country changes. Do not use plain ngsInput, NumberInput, or InputMask for country-aware phone numbers. Do not use CountrySelect instead of PhoneInput; CountrySelect chooses a country but does not capture a phone number. Do not use for OTP, MFA, passcodes, or invite codes; use PinInput.',
  },
  'pin-input': {
    purpose: 'Capture short one-character-per-cell codes for verification and secure access flows.',
    useWhen: 'Use ngs-pin-input as a standalone form control for OTP, MFA, SMS or email verification codes, invite codes, passcodes, payment verification, and secure access codes. Use ngModel or formControlName, length for the number of cells, placeholder for the empty-cell hint, acceptOnly for allowed symbols with digits as the default, and disabled for disabled state. The component manages one-character cells and focus movement between them. Do not use PinInput for phone numbers; use PhoneInput. Do not use for creating or changing passwords; use ngsInput with PasswordStrength. Do not use for numeric settings or quantities; use NumberInput. Do not use for long codes, serial numbers, coupons, or arbitrary text; use a normal ngsInput. Do not wrap it in ngs-form-field as if it were a single text input; the component renders its own internal form fields.',
  },
  popover: {
    purpose: 'Show lightweight contextual content in an overlay anchored to a trigger element.',
    useWhen: 'Use Popover for short details, previews, small interactive content, compact forms, and richer explanations that need more than a plain tooltip but do not require a modal workflow. Put ngsPopoverTriggerFor on the trigger element and point it to ngs-popover or a TemplateRef. Use trigger="click" for explicit opening and trigger="hover" only for preview-style content that can disappear safely. Use position for below/above/before/after placement. Use ngsPopoverContext with ngsPopoverContent for lazy content that needs trigger data. Use a raw TemplateRef only when the standard ngs-popover-panel wrapper should be replaced. Use hasBackdrop, closeOnOriginClick, closeOnOriginMouseLeave, and origin only when custom close or anchoring behavior is needed. Do not use Popover for command lists; use Menu. Do not use for short plain hints; use Tooltip. Do not use for modal workflows, confirmations, or complex forms; use Dialog or Confirm. Do not use for side panels; use Drawer. Do not use for form dropdowns; use Select, Autocomplete, Datepicker, or ColorPicker. Do not use low-level Overlay directly when Popover fits.',
  },
  'progress-bar': {
    purpose: 'Show linear progress for an operation or process.',
    useWhen: 'Use ngs-progress-bar for uploads, downloads, imports, setup completion, sync, processing, form completion, buffering, and other horizontal progress states. Use mode="determinate" with value from 0 to 100 when the percentage is known. Use mode="indeterminate" when work is happening but the percentage is unknown. Use mode="buffer" with value and bufferValue when both primary and buffered progress should be visible. Use mode="query" while waiting before known progress starts. Use animationEnd only when the screen must react after the transition finishes. Do not use ProgressBar for Angular Router navigation; use PageLoadingBar. Do not use to block a whole area; use BlockLoader. Do not use for skeleton content loading; use Skeleton. Do not use for circular KPI or percent metrics; use Gauge. Do not use for mini trends or charts; use MicroChart. Do not use as a status label; use Badge or text.',
  },
  radio: {
    purpose: 'Let users choose exactly one option from a small visible set of mutually exclusive choices.',
    useWhen: 'Use ngs-radio-group with ngs-radio-button for simple text options in forms, settings, filters, and preference screens where all options should be visible and the user can choose only one. Put value on each radio button and bind the group value with value, ngModel, or formControlName. Use name when native form grouping matters, disabled on the group or individual radio button when needed, and change when the screen must react to selection changes. Do not use Radio for multiple selection; use Checkbox. Do not use for long option lists; use Select or Autocomplete. Do not use for rich options with descriptions, icons, or large clickable blocks; use RadioCard. Do not use as a segmented view switcher; use Segmented or ButtonToggle. Do not use for yes/no boolean settings when SlideToggle or Checkbox better matches the meaning.',
  },
  'radio-card': {
    purpose: 'Let users choose exactly one option from a small set of rich card-like choices.',
    useWhen: 'Use ngs-radio-card-group as a form control group and ngs-radio-card for each option when every option needs a large clickable card with title, icon, description, or supporting content. Use ngs-radio-card-title for the option name and optional icon, ngs-radio-card-content for details, value on each card, and formControlName or ngModel on the group. Use TailwindCSS grid or flex around the group to lay cards out in columns or rows. Good for plan selection, privacy modes, template choices, payment methods, layout options, delivery methods, onboarding choices, and settings choices with explanation. Do not use for simple short text options; use Radio. Do not use for multiple selection; use Checkbox or a dedicated checkbox-card pattern when available. Do not use for long lists; use Select or Autocomplete. Do not use as a normal content card without selection; use Card. Do not use as a segmented mode switch; use Segmented or ButtonToggle.',
  },
  'rail-nav': {
    purpose: 'Provide a compact vertical navigation rail with icons and short labels.',
    useWhen: 'Use ngs-rail-nav when an app or workspace shell needs compact vertical navigation but there is not enough space for a full sidebar. Use ngs-rail-nav-item or [ngs-rail-nav-item] for destinations, ngsRailNavItemIcon for icons, key on each item, activeKey on the rail, and railNav.api.isActive(key) when the active item should change icon or styling. Good for narrow editor or workspace navigation, secondary product navigation, compact admin shells, and switching between primary sections. Do not use when you need a full sidebar with groups, nested navigation, or supporting content; use Sidebar or Sidenav. Do not use inside ngs-sidebar because Sidebar has its own navigation. Do not use for normal section navigation in content; use Navigation. Do not use for tabs, breadcrumbs, menu actions, segmented controls, or one-off icon buttons.',
  },
  'resizable-container': {
    purpose: 'Let users manually resize the width of one container with a vertical drag handle.',
    useWhen: 'Use ngs-resizable-container around content when the user should manually adjust the width of a single block. Good for resizable preview panes, editor canvas or containers, inspector or detail panels, side content areas, responsive demo areas, chart previews, and docs playgrounds. Use minWidth for the minimum allowed width, resized to persist or synchronize the new width, and TailwindCSS classes for border, height, initial width, layout, and inner content. Do not use as a full split layout between two panels; use Split or a dedicated splitter when available. Do not use for image resizing; use ImageResizer. Do not use for table or DataView column resizing; use the table/DataView resizing feature. Do not use as a normal responsive container when users should not manually resize it; use TailwindCSS responsive utilities or container queries. Do not use for Drawer or Sidebar resizing when those components own their sizing model.',
  },
  'screen-loader': {
    purpose: 'Show a full-screen blocking loading state for large global operations.',
    useWhen: 'Use ScreenLoader when the user must wait and should not interact with the app: initial app load, major route or page data loading, account switching, tenant switching, auth or session restore, heavy backend tasks, and large global operations. Prefer ScreenLoaderService.open(messageOrTemplate) for programmatic full-screen overlays, keep the returned ScreenLoaderRef, and always call ref.close() when the operation finishes. Use afterOpened() and afterClosed() only for side effects. Use ngs-screen-loader with opened and message only when the open state is controlled directly in a template. message can be a short string or TemplateRef. Do not use ScreenLoader for local block, card, table, or form loading; use BlockLoader, Skeleton, ProgressSpinner, ProgressBar, or component-specific loading states. Do not use for route navigation progress; use PageLoadingBar. Do not use for known percentage progress; use ProgressBar. Do not leave a service-opened loader without closing its ref.',
  },
  'scroll-spy': {
    purpose: 'Provide in-page navigation for sections inside a long scrollable page or local scroll container.',
    useWhen: 'Use ScrollSpy when a long page or panel has stable section ids and needs a table-of-contents style navigation that highlights the active section while scrolling and smooth-scrolls to sections on click. Use ngs-scroll-spy-nav as the nav container, ngs-scroll-spy-on with targetId matching a section id, ngs-scroll-spy-title for the nav heading, and ngs-scroll-spy-back-to-top for a top shortcut. It uses ngs-layout-content or ngs-panel-content as the scroll container when present, otherwise document body. Good for docs pages, long settings pages, profile or detail pages with many sections, policy/help pages, long form review pages, and article-like admin pages. Do not use for primary product navigation; use Navigation, Sidebar, Sidenav, or RailNav. Do not use for tabs between views; use Tabs. Do not use for route breadcrumbs; use Breadcrumbs. Do not use for wizard steps; use Stepper or HeadlessStepper. Do not use on short pages without real scrolling or without stable section ids.',
  },
  'scrollbar-area': {
    purpose: 'Provide a styled scroll container for bounded UI regions.',
    useWhen: 'Use ngs-scrollbar-area when a sized panel, grid body, editor sidebar, asset list, menu, or similar surface needs consistent NgStarter scrollbars instead of native browser scrollbars. It hides native scrollbars, renders vertical and horizontal thumbs, supports auto-hide, thumb dragging, resize and mutation tracking, scrollbarWidth, autoHide, absolute fill mode, and scrolled output. Use [absolute]="true" when the scroll area should fill a positioned parent region such as ngs-panel-content or a DataView viewport; make sure the parent already has a stable height and width. Do not use as a generic layout wrapper, spacing helper, page-level replacement for normal browser scrolling, carousel or scroll-snap component, virtualization engine, or a workaround for missing parent sizing.',
  },
  segmented: {
    purpose: 'Let users choose one value from a compact set of mutually exclusive modes or options.',
    useWhen: 'Use ngs-segmented with ngs-segmented-button when a short set of options should stay visible and only one value can be selected. Good for view modes, time ranges, display density, selection mode, chart or table mode, compact filters, and short settings. It works as an Angular form control through value, valueChange, ngModel, or formControlName, supports disabled state, sizes, text buttons, icons with ngsSegmentedIcon, and iconOnly buttons. Do not use Segmented for route or page navigation; use Tabs, Navigation, Sidebar, Sidenav, or RailNav. Do not use for independent on/off toggles; use ButtonToggle or SlideToggle. Do not use for long lists, rich option cards, dropdown choices, or fixed color palettes; use Radio, RadioCard, Select, Autocomplete, or ColorSwitcher.',
  },
  select: {
    purpose: 'Let users choose one or multiple values from a known dropdown list.',
    useWhen: 'Use ngs-select inside one ngs-form-field when a form, filter, setting, table filter, DataView filter, or admin configuration field should choose from predefined options. Use ngs-option for options, ngs-optgroup for visible grouping, multiple for array values, placeholder, required, disabled, Angular forms, value, and selectionChange for state. Use ngs-select-trigger to customize the closed label, and ngs-select-header, ngs-select-body, or ngs-select-footer when the dropdown panel needs search, custom scrolling, or supporting controls. Do not use Select as a command menu or action list; use Menu. Do not use for route or page navigation; use Navigation, Tabs, Sidebar, Sidenav, or RailNav. Do not use for compact visible mode switching; use Segmented. Do not use for simple visible choices or rich card choices; use Radio or RadioCard. Do not use for arbitrary free text or large remote search suggestion flows; use Autocomplete or a dedicated async picker. Do not use generic Select when a domain-specific control exists, such as CountrySelect, CurrencySelect, DateFormatSelect, or TimezoneSelect.',
  },
  'side-panel': {
    purpose: 'Provide an embedded side utility panel with tabbed tools beside the main content.',
    useWhen: 'Use ngs-side-panel inside an app or workspace layout when the page needs persistent secondary tools or inspectors next to the primary content. Add ngs-side-panel-tab for each tab with tabId, label, and an optional Iconify icon name or custom icon TemplateRef. Good for info, outline, layers, activity, comments, assets, properties, preview settings, contextual inspectors, and quick tools in editors or admin workspaces. It can be positioned left or right and emits opened and closed. Do not use SidePanel as a temporary overlay; use Drawer. Do not use for modal workflows or confirmations; use Dialog or Confirm. Do not use as a generic page section; use Panel or Card. Do not use for primary app navigation; use Sidebar, Sidenav, Navigation, or RailNav. Do not use for tabs inside normal content; use Tabs. Do not use for simple action lists; use Menu.',
  },
  sidebar: {
    purpose: 'Provide a complete vertical app or workspace sidebar with its own navigation system.',
    useWhen: 'Use ngs-sidebar as the content inside a shell sidebar region, usually inside Sidenav or LayoutSidebar, when an admin app or workspace needs persistent sidebar navigation and supporting sidebar content. Compose it with ngs-sidebar-header, ngs-sidebar-body, ngs-sidebar-footer, ngs-sidebar-nav, ngs-sidebar-nav-item, ngs-sidebar-nav-group, ngs-sidebar-nav-group-toggle, ngs-sidebar-nav-group-menu, ngs-sidebar-nav-heading, ngs-sidebar-divider, ngsSidebarNavItemIcon, ngsSidebarNavItemBadge, and ngsSidebarNavGroupToggleIcon. Good for brand or workspace header, main app navigation, grouped routes, badges, active item state through activeKey, autoScrollToActiveItem, and data-driven nav templates. Sidebar owns navigation; when ngs-sidebar is not used and persistent navigation is needed, use Navigation. Do not use Sidebar as a generic left column, card, drawer content, inspector, page section, tabs, menu, or compact icon rail. Use Sidenav for responsive open, collapse, or overlay shell behavior, RailNav for compact icon navigation, SidePanel for secondary tabbed tools, Drawer for temporary overlay side content, and Panel or Card for content grouping.',
  },
  sidenav: {
    purpose: 'Provide a responsive shell container for side surfaces that can open, close, collapse, overlay, or push content.',
    useWhen: 'Use ngs-sidenav-container with ngs-sidenav and ngs-sidenav-content when a page or app shell needs a side region with behavior: opened state, open/close/toggle methods, mode over/push/side, position start/end, collapsed icon-width state, disableClose, backdrop and backdropClick, adaptive mobile mode through adaptive and adaptiveBreakpoint, fixedWidth, autosize, and autoFocus. Use ngsSidenavCollapsed and ngsSidenavExpanded templates to render different content while collapsed or expanded. In admin shells, put ngs-sidebar inside ngs-sidenav when the side region is primary navigation; Sidebar owns the actual navigation items. Do not use Sidenav as the navigation structure itself; use Sidebar or Navigation inside it. Do not use for temporary task panels; use Drawer. Do not use for persistent tabbed utility tools; use SidePanel. Do not use for static local columns or content sections; use LayoutSidebar, Panel, or Tailwind layout. Do not use for modal workflows, confirmations, or action menus; use Dialog, Confirm, or Menu.',
  },
  'signature-pad': {
    purpose: 'Capture a handwritten signature and emit it as a PNG data URL.',
    useWhen: 'Use ngs-signature-pad in approval, contract, consent, delivery confirmation, onboarding, checkout, legal acknowledgement, or internal workflow forms where the user must draw a signature. It supports mouse, touch, or pen input, penColor, colors for the fixed allowed pen palette, lineWidth, backgroundColor, lazy brush smoothing through lazyRadius/lazyFriction/lazyEnabled, clear(), save(), signatureSaved with a base64 PNG data URL, and signatureCleared. Use the emitted PNG in app code to store or attach the signature to the workflow or document. Do not use SignaturePad as a general drawing canvas, image editor, annotation tool, sketch board, whiteboard, file upload, typed-name field, or legal validation system by itself. App code still needs to require the signature when needed, persist it, and enforce backend or legal rules.',
  },
  skeleton: {
    purpose: 'Show placeholder blocks for loading content when the final layout is already known.',
    useWhen: 'Use ngs-skeleton to preserve layout while cards, lists, table rows, dashboard widgets, chart areas, avatars, text lines, or media blocks are loading. Shape and size each skeleton with TailwindCSS utilities such as h-*, w-*, size-*, flex, grid, gap, and wrapper layouts so it roughly matches the UI that will replace it. Use roundedFull for circular placeholders such as avatars or icon circles. Do not use Skeleton for unknown long operations where progress matters; use ProgressBar. Do not use for global route or app loading; use PageLoadingBar or ScreenLoader. Do not use for blocking a local section; use BlockLoader. Do not use for empty results; use EmptyState. Do not use for image fallback after load failure; use ImagePlaceholder. Do not use random grey blocks that do not resemble the final content.',
  },
  'slide-toggle': {
    purpose: 'Capture a boolean on/off setting where checked means enabled.',
    useWhen: 'Use ngs-slide-toggle for settings and preferences where checked=true means the feature or state is enabled. Good for live updates, notifications, dark mode option, visibility, sidebar expanded or collapsed, animation on/off, table options, enable Wi-Fi, show archived, and allow comments. It is an Angular form control with checked, disabled, required, ngModel, formControlName, change, and toggleChange, and has its own label pattern, so do not wrap it in ngs-form-field. Do not use SlideToggle for choosing one value from many; use Radio, Segmented, or Select. Do not use for multiple independent selections in a list; use Checkbox. Do not use for button-like mode groups; use ButtonToggle. Do not use for actions, commands, navigation, or rich option cards; use Button, Navigation, or RadioCard. For “I agree” or “accept terms” confirmations, prefer Checkbox because the user is confirming, not enabling a setting.',
  },
  slider: {
    purpose: 'Let users choose one numeric value or a start/end range by dragging thumb controls.',
    useWhen: 'Use ngs-slider when approximate visual numeric adjustment is better than typing. Good for volume, opacity, zoom, size, threshold, percentage, rating or score, price range, numeric date or age range, chart settings, visual tuning, and filter ranges. Use input ngsSliderThumb for one value, or input ngsSliderStartThumb plus input ngsSliderEndThumb for a range. Configure min, max, step, disabled, discrete, showTickMarks, displayWith, Angular forms, and valueChange on thumbs. Do not use Slider to show progress or status; use ProgressBar or Gauge. Do not use when exact numeric entry is primary; use NumberInput or pair NumberInput with Slider. Do not use for named categories; use Select, Radio, or Segmented. Do not use for before/after image comparison; use ComparisonSlider. Do not use for pagination or table sorting/filter builder logic; use Paginator, Sort, or FilterBuilder.',
  },
  'snack-bar': {
    purpose: 'Show short transient overlay feedback after an action or background result.',
    useWhen: 'Use the SnackBar service for brief non-blocking messages such as Saved, Copied, Invite sent, Refresh complete, Export started, or Deleted, with an optional quick action such as Undo or View. Open with snackBar.open(message, action?, config?), openFromComponent, or openFromTemplate. Configure duration, horizontalPosition, verticalPosition, data, panelClass, custom component or template content, and use SnackBarRef.dismiss(), afterOpened(), and afterDismissed() for lifecycle handling. SnackBar should be short, temporary, and safe to miss. Do not use for field validation errors; use FormField errors. Do not use for persistent inline messages; use Alert. Do not use for global important header messages; use Announcement. Do not use for critical required actions; use ActionRequired. Do not use for confirmations before destructive actions; use Confirm. Do not use for modal workflows; use Dialog. Do not use for long-lived notification inboxes or event feeds; use Notifications. Do not use for incident/status banners or loading/progress states; use Incidents, ProgressBar, ScreenLoader, BlockLoader, or PageLoadingBar.',
  },
  spinner: {
    purpose: 'Show a circular indicator for an ongoing operation.',
    useWhen: 'Use ngs-progress-spinner when a compact circular loading indicator is needed inside a button, overlay, media viewer, widget, small page area, or next to an action. Use mode="indeterminate" when the remaining time or amount of work is unknown. Use mode="determinate" with value from 0 to 100 when progress is known. Configure diameter, strokeWidth, and color for the surface. Do not use ProgressSpinner for linear progress; use ProgressBar. Do not use it for known loading layouts; use Skeleton. Do not use it for router or page transition loading; use PageLoadingBar. Do not use it as a full-screen or blocking state by itself; use ScreenLoader or BlockLoader. Do not use it as a KPI or metric display; use Gauge or ProgressBar based on context.',
  },
  sort: {
    purpose: 'Provide sortable header behavior and sort state for table-like data.',
    useWhen: 'Use ngsSort on a sortable table/list/data container and ngs-sort-header="fieldName" on header cells that should cycle through sort states. Sort tracks active column and direction (asc, desc, or cleared), supports ngsSortActive, ngsSortDirection, ngsSortStart, ngsSortDisableClear, ngsSortDisabled, per-header disabled state, sortActionDescription, and emits ngsSortChange with { active, direction }. Use it with Table sortable column headers, custom table-like data surfaces, and when wiring sort state into a local TableDataSource or server/API query. For DataView, usually prefer its built-in sortable column config and sortChange instead of manually adding ngs-sort-header. Do not use Sort as a visual sort icon only, filter builder, search, grouping, drag reorder, tab sorting, or generic “sort these cards” button. Sort only manages header state and emits the selected sort; the app/data source still applies local sorting or sends the sort state to the backend.',
  },
  'splash-screen': {
    purpose: 'Show one full-screen branded startup overlay during the initial app bootstrap moment.',
    useWhen: 'Use ngs-splash-screen once near the root app template while Angular, routing, theme, auth/session, tenant, or essential startup data initializes. Project ngs-logo or custom branded content into it. It hides automatically after the first NavigationEnd with hideDelay, fades with animationDuration, and can be controlled through SplashScreenStore.show() and SplashScreenStore.hide(). Do not use SplashScreen for normal page loading after startup; use PageLoadingBar. Do not use for full-screen blocking operations after the app is running; use ScreenLoader. Do not use for local card, table, form, or widget loading; use BlockLoader, Skeleton, ProgressBar, or component-specific loading states. Do not use for empty states, route skeletons, modal workflows, or marketing hero screens. SplashScreen should be one per app and short-lived at the beginning, not shown for every action.',
  },
  split: {
    purpose: 'Create a resizable multi-pane layout with draggable gutters between panes.',
    useWhen: 'Use ngs-split with multiple ngs-split-pane regions when a workspace needs two or more panes that users can manually resize. Good for editors, IDE-like screens, analytics workspaces, master-detail-detail layouts, source and preview views, inspector plus canvas plus logs, and dense multi-pane tools. Supports horizontal or vertical direction, nested splits, unit percent or pixel, size, minSize, maxSize, lockSize, visible, order, withHandle dotted gutter affordance, restrictMove, disabled, gutterSize, gutterStep, dragStart, dragEnd, gutterClick, gutterDblClick, transitionEnd, getVisibleAreaSizes(), and setVisibleAreaSizes() for persistence. Do not use Split for ordinary responsive layout or static two-column admin pages; use TailwindCSS grid or flex. Do not use for one manually resized box; use ResizableContainer. Do not use for side navigation shells; use Sidenav or Sidebar. Do not use for temporary side overlays; use Drawer. Do not use for local structured page sections; use Panel. Do not use for table column resizing or image resizing; use table features or ImageResizer. The parent must have a stable height and width.',
  },
  stepper: {
    purpose: 'Render a ready-made visual wizard for several connected steps in one process.',
    useWhen: 'Use ngs-stepper with ngs-step when users must move through related steps and see their current progress. Good for onboarding, checkout, setup, import/export flows, account or tenant creation, review flows, and multi-step forms. Use linear mode with stepControl when each step must be valid before the user continues. Use ngsStepperNext and ngsStepperPrevious on NgStarter buttons for standard wizard navigation, ngsStepLabel or label for step labels, optional/completed/error states for step status, and horizontal or vertical orientation for responsive layouts. Do not use Stepper when you only need step state and validation logic without the default visual UI; use HeadlessStepper. Do not use for independent page sections; use Tabs or ExpansionPanel. Do not use for app route navigation; use Navigation, Breadcrumbs, Sidebar, or routing. Do not use for showing only a percentage; use ProgressBar. Do not use for product tours over existing UI; use GuidedTour.',
  },
  suggestions: {
    purpose: 'Render a grouped visual list of contextual suggestions, search results, recent items, or shortcuts.',
    useWhen: 'Use ngs-suggestions as the visual list inside search dropdowns, assistant inputs, command-like panels, or contextual suggestion popovers. Group related rows with ngs-suggestion-block, use ngs-suggestion for each clickable row, place icons with ngsSuggestionIcon, thumbnails or avatars with ngsSuggestionThumb, and use inline blocks for quick actions such as create buttons. Good for recently viewed items, users, files, pages, matching search results, and quick create shortcuts. Do not use Suggestions as a form value picker; use Autocomplete or Select. Do not use it for a short contextual command menu; use Menu. Do not use it for persistent app navigation; use Navigation, Sidebar, Sidenav, or RailNav. Do not use it as a complete command palette by itself; it can provide the grouped visual result list, but search state, keyboard handling, filtering, and command execution belong to the surrounding feature. Do not use it for page-level empty-state recommendations or assistant cards; compose those with EmptyState, Card, Alert, or the page layout.',
  },
  'tab-panel': {
    purpose: 'Create a compact vertical tool or navigation panel with a linked aside content area.',
    useWhen: 'Use ngs-tab-panel when a workspace or editor needs a vertical set of icon/text items that controls adjacent aside content. Use ngs-tab-panel-content with ngs-tab-panel-nav and ngs-tab-panel-item for the rail, bind items to content with matching for values and ngsTabPanelAsideContent ids inside ngs-tab-panel-aside, and use activeItemId to choose the active item. Good for image editors, design tools, asset panels, layers, inspectors, workspace switchers, tool palettes, and settings/tools inside dense work surfaces. Use compact for icon-only rails with tooltips, header/content/footer regions to group items, and ngs-tab-panel-custom-item for custom items such as avatars, workspaces, or add actions. Do not use TabPanel for ordinary horizontal page tabs; use Tabs. Do not use it for primary app navigation; use Sidebar, Navigation, Sidenav, or RailNav. Do not use it for temporary overlay side content; use Drawer. Do not use it for a structured page section; use Panel. Do not use it for workflow steps; use Stepper. Do not use it for contextual command lists; use Menu.',
  },
  table: {
    purpose: 'Render static or simple template-defined tabular data with known columns.',
    useWhen: 'Use table[ngs-table] or ngs-table for static or simple tabular data where columns are known in Angular templates: read-only tables, documentation tables, settings summaries, static comparison rows, lightweight report tables, and small non-interactive admin tables. Define columns with ngsColumnDef, header/body/footer cells with ngsHeaderCellDef, ngsCellDef, and ngsFooterCellDef, and rows with ngsHeaderRowDef, ngsRowDef, and ngsFooterRowDef. Use TableDataSource only for lightweight local table behavior, not as a replacement for a real datatable. Use sticky/stickyEnd for fixed columns and sticky row defs for sticky header or footer. Use table[ngs-native-table] only for static HTML tables without a data source. Do not build tables with div role="table" or custom grid markup when ngs-table fits. Use DataView instead when the UI is a datatable or working data surface with row actions, selection, sorting, search/filter state, pagination, column sizing/settings, saved views, server-driven data, or complex record management. Use List for simple vertical rows without real columns. Use Tree for hierarchical rows. Use Grid or Tiles for dashboard layouts. Use Sort only for sort state behavior; it does not replace Table.',
  },
  tabs: {
    purpose: 'Switch between peer views inside one page or section context, with only one panel visible at a time.',
    useWhen: 'Use ngs-tab-group with ngs-tab for local content tabs that do not require routing. Use ngs-tab-nav-bar with a[ngs-tab-link] and ngs-tab-nav-panel for route-linked tabs inside one section, such as documentation overview/API pages or detail subsections. Good for entity details, settings subsections, overview/activity/files/settings pages, alternate views of one object, or peer panels that share the same context. Supports selectedIndex, selectedIndexChange, selectedTabChange, disabled tabs, custom ngsTabLabel templates, explicit ngsTabContent templates, preserveContent, stretchTabs, alignTabs, headerPosition above/below, overflow pagination controls, and animationDuration/custom animations. Do not use Tabs for compact mode or value switches; use Segmented. Do not use for wizard or process steps; use Stepper. Do not use for vertical tool panels with linked aside content; use TabPanel. Do not use for primary app navigation; use Navigation, Sidebar, Sidenav, or RailNav. Do not use for collapsible sections; use ExpansionPanel. Do not use for route paths; use Breadcrumbs. Do not use for choosing a form value; use Select, Radio, RadioCard, Checkbox, or ButtonToggle depending on the interaction.',
  },
  'text-editor': {
    purpose: 'Provide a full Tiptap-based WYSIWYG rich text editor for formatted HTML content.',
    useWhen: 'Use ngs-text-editor when users need to create or edit rich HTML content with headings, bold, italic, strike, lists, blockquotes, inline code, code blocks, horizontal rules, links, images, YouTube embeds, toolbar commands, bubble menus, or floating menus. Good for product descriptions, project/task descriptions, CMS-like fields, articles, notes, changelog entries, release notes, knowledge base content, help content, and rich admin content bodies. Provide initial HTML through content, listen to contentChange for updated HTML, add custom Tiptap extensions through extensions, and use imageUploadFn to upload images and resolve a URL. Compose controls with ngs-text-editor-toolbar, ngs-text-editor-bubble-menu, ngs-text-editor-floating-menu, ngs-text-editor-divider, and ngsTextEditorCommand* directives. Do not use TextEditor for short comments, threads, or quick replies; use CommentEditor. Do not use it for block-based CMS/page building; use ContentEditor. Do not use it for plain text fields; use ngsInput inside FormField. Do not use it for inline renaming; use InlineTextEdit. Do not use it for read-only code or snippets; use CodeHighlighter.',
  },
  'thumbnail-maker': {
    purpose: 'Create a square 300x300 thumbnail bitmap from an image with drag positioning and zoom controls.',
    useWhen: 'Use ngs-thumbnail-maker when users need to position and zoom an image inside a fixed square frame, then save the finished thumbnail as a data URL, Blob, or canvas. Good for avatars, profile images, CMS thumbnails, media library previews, product/user/project card images, and simple square preview generation. Provide the image URL or data URL through src, add helperText when users need drag instructions, and call api.getDataUrl(), api.toBlob(callback), or api.getCanvas() when saving. Combine with Upload or ngsUploadTrigger when users must select a local image first. Do not use ThumbnailMaker when the app needs arbitrary crop shapes, crop rectangles, circles, or crop coordinates; use Crop. Do not use it only to change displayed image width; use ImageResizer. Do not use it to view images; use ImageViewer or ImageZoomViewer. Do not use it as an image placeholder; use ImagePlaceholder. Do not use it for full canvas editing, layers, text, effects, or templates; use ImageDesigner. Do not use it as a plain upload picker without editing; use Upload.',
  },
  tiles: {
    purpose: 'Lay out responsive dashboard tiles and support user-driven tile reordering/customization.',
    useWhen: 'Use ngs-tiles with ngs-tile when users can rearrange dashboard cards or widgets, customize a dashboard, or save a changed widget order. Good for editable dashboards, portal home pages, workspace widgets, configurable analytics cards, media/card boards, and dashboard builders. Tiles can be the layout host for config-driven dashboard renderers: the app can render lazy widget components inside each ngs-tile, show Skeleton while widgets load, and persist the final item order from orderChanged or layoutChanged. Use width, height, width.sm/md/lg/xl, and height.sm/md/lg/xl to define responsive tile spans, and ngsTileHandle for drag handles. Provide items so reorder events can map visual order back to app data. Use Grid only for static predefined dashboard/widget layouts that users do not rearrange. Do not use Tiles for ordinary static responsive page layout; use TailwindCSS grid/flex. Do not use for split panes with gutters; use Split. Do not use for one manually resized box; use ResizableContainer. Do not use for simple cards, lists, tables, or datasets without tile reordering; use Card, List, Table, or DataView. Do not use for status-column workflows; use KanbanBoard.',
  },
  timeline: {
    purpose: 'Show a vertical chronological history of events.',
    useWhen: 'Use ngs-timeline when users need to understand a sequence of events over time: audit logs, activity history, entity change history, project milestones, order or shipment history, workflow history, tracking events, and user actions. Use ngs-timeline-header to group events by date, month, phase, or period. Use ngs-timeline-item with ngs-timeline-timestamp, ngs-timeline-title, ngs-timeline-subtitle, ngs-timeline-description, ngs-timeline-attributes, and ngs-timeline-content to structure each event. Use ngsTimelineItemIndicator when the marker should show an actor, icon, status, or event type. Do not use Timeline for a realtime notification inbox or actionable notification feed; use Notifications. Do not use for a simple vertical collection without time/order meaning; use List. Do not use for tabular audit logs that need sorting, filtering, or many columns; use Table or DataView. Do not use for workflow steps the user must complete; use Stepper. Do not use for status columns; use KanbanBoard. Do not use for calendar/scheduler views or for a single operation status; use ProgressBar, Badge, or Status as appropriate.',
  },
  timepicker: {
    purpose: 'Let users choose or type a time of day in a form field.',
    useWhen: 'Use input[ngsTimepicker] inside one ngs-form-field, connected to an ngs-timepicker instance, when a form needs a time of day: meeting time, event time, booking time, reminder time, deadline time, availability slot, report time filter, or schedule setting. Add ngs-timepicker-toggle as an icon suffix when users should open the dropdown explicitly. Use interval to control option steps such as 15, 30, or 60 minutes. Use min and max to limit selectable times. The input supports manual typing and localized display, while the model value can be a HH:mm-like string or a Date with the selected time merged into it. Combine Datepicker and Timepicker as separate controls when users need both date and time. Do not use Timepicker to choose a date; use Datepicker. Do not use it to choose a timezone; use TimezoneSelect. Do not use it for duration or numeric amounts of hours/minutes; use NumberInput or Slider. Do not use it for plain text without time validation; use ngsInput. Do not use it as a calendar, scheduler, or day-slot planner.',
  },
  'timezone-select': {
    purpose: 'Let users choose an IANA time zone id in a form field.',
    useWhen: 'Use ngs-timezone-select inside one ngs-form-field when a form must store a real time zone id such as Europe/Warsaw or America/New_York. Good for profile timezone, account preferences, organization or tenant default timezone, scheduling settings, calendar settings, report default timezone, localization preferences, and admin settings where backend data needs an IANA timezone string. The control is searchable, groups time zones by region, supports Angular forms, required, disabled, placeholder, locale-aware labels, opened, and closed. Do not use TimezoneSelect to choose a time of day; use Timepicker. Do not use it to choose a date; use Datepicker. Do not use it to choose a country or region; use CountrySelect. Do not use it for language or locale selection; use a dedicated locale/language control or Select. Do not use it for generic custom options; use Select. Do not use it for durations, numeric offsets, or timezone math; use NumberInput, Slider, or app logic. Do not use timezone as a date format setting; use DateFormatSelect for display formats.',
  },
  toolbar: {
    purpose: 'Provide a persistent command area for a page, panel, table, editor, canvas, or workspace surface.',
    useWhen: 'Use ngs-toolbar when a local surface needs a title, short local navigation, and frequently used actions in a stable horizontal or multi-row command area. Use ngs-toolbar-title for the local title, ngs-toolbar-spacer to separate groups, ngs-toolbar-row for multi-row command areas, ngs-toolbar-item for actions that should participate in responsive overflow, and ngs-toolbar-nav with ngs-toolbar-nav-link for short local links inside the toolbar. Good places include table headers, panel headers, admin page headers, editor surfaces, dashboards, canvas tools, and workspace tool surfaces. Do not use Toolbar as a generic flex layout for arbitrary content. Do not use it for floating contextual actions on selected rows or objects; use CommandBar. Do not use it for dropdown command lists; use Menu. Do not use it for primary application navigation; use Sidebar, Sidenav, or Navigation. Do not replace specialized TextEditor or CommentEditor toolbars with the generic Toolbar.',
  },
  tooltip: {
    purpose: 'Show a short helper message for one interface element on hover, focus, or touch.',
    useWhen: 'Use ngsTooltip as a directive on a trigger element when a short non-interactive helper message should explain an icon button, abbreviation, disabled state, dense control, compact label, or unclear affordance. Configure ngsTooltipPosition, ngsTooltipShowDelay, ngsTooltipHideDelay, ngsTooltipOffset, ngsTooltipDisabled, ngsTooltipClass, or ngsTooltipPositionAtOrigin when placement and timing need tuning. Export the directive as ngsTooltip when app logic must call show(), hide(), or toggle(). Keep tooltip text short and plain. Do not use Tooltip for interactive content, forms, action lists, rich previews, or long explanations; use Popover. Do not use it for command menus; use Menu. Do not use it for visible page messages; use Alert, Announcement, ActionRequired, or Incidents based on scope. Do not use it for form helper or validation text; use FormField hint and error. Do not use it for onboarding flows; use GuidedTour.',
  },
  tree: {
    purpose: 'Display hierarchical data with expandable parent and child nodes.',
    useWhen: 'Use ngs-tree when users need to inspect or navigate hierarchical data where parent and child levels matter: folders and files, categories, permissions, taxonomies, organization structures, nested settings, product/entity hierarchies, and other expandable trees. Use dataSource with childrenAccessor for nested/static data, or treeControl with a custom DataSource for flat trees and dynamic loading. Define node templates with *ngsTreeNodeDef and use when for different node types. Use ngsTreeNodePadding for indentation and ngsTreeNodeToggle for expand/collapse controls. Use ProgressBar or Skeleton inside node templates when children load on demand. Do not use Tree for a simple vertical collection; use List. Do not use it for primary application navigation; use Sidebar, Sidenav, Navigation, or RailNav. Do not use it for FAQ or settings sections; use ExpansionPanel. Do not use it for dense row data with columns, sorting, filters, or bulk actions; use Table or DataView. Do not use it for step-by-step workflows; use Stepper.',
  },
  upload: {
    purpose: 'Provide UI for selecting files, drag-and-drop upload areas, and file progress displays.',
    useWhen: 'Use Upload components when users need to choose local files, drop files into an upload area, or see selected/uploading files with progress, errors, retry, remove, or cancel actions. Use ngsUploadTrigger on a button or clickable element to open the native file picker. Use ngs-upload-area for drag-and-drop with ngsUploadAreaMainState, ngsUploadAreaDropState, ngsUploadAreaInvalidState, and ngsUploadAreaIcon. Use accept and multiple to control allowed file types and multi-select. Use ngs-upload-container with ngs-upload-allowed-types and ngs-upload-max-file-size for upload hints. Use ngs-file-list with ngs-file for vertical file rows, or ngs-files-grid with ngs-grid-file for compact file cards. Use ngs-file-control and ngsGridFileControl for file-level actions. The component emits fileSelected with the selected File objects; the application must perform validation, backend upload, retry, deletion, persistence, and security checks. Do not treat Upload as a backend uploader, storage manager, or import wizard by itself. Do not use it for editing selected images; use Crop, ImageResizer, ThumbnailMaker, or ImageDesigner after selection. Do not use it for rich editor image upload flows; use the TextEditor or CommentEditor upload APIs. Do not use it to manage an existing document table with sorting and filtering; use Table or DataView.',
  },
  'video-player': {
    purpose: 'Play video inline inside the current page, card, carousel, media preview, lesson, or workspace layout.',
    useWhen: 'Use ngs-video-player when video should stay embedded in the current layout with NgStarter-controlled playback UI. Pass src for the video source, optional thumbnailUrl for the poster preview, and orientation or payload.orientation for landscape, portrait, or square aspect ratio. Configure autoPlay, muted, disableClickToPlay, withCredentials, showPlayButton, showSpeaker, showFullscreen, and showDurationSlider to match the surface. Listen to play, pause, ended, loaded, and error for application state. Good for media previews, lessons, product videos, content previews, cards, carousel slides, and dashboard/workspace media blocks. The player wraps video.js and supports HLS m3u8 sources through video.js. Do not use VideoPlayer when the video should open as a focused overlay or lightbox; use VideoViewer. Do not use it as a gallery or list by itself; compose it with Carousel, Card, Grid, VideoViewer, or a layout component. Do not use it for YouTube, Vimeo, or other iframe-provider embeds when the provider player is required. Do not use it as a content editing API directly; use the ContentEditor video block for editable content.',
  },
  'video-viewer': {
    purpose: 'Open videos in a focused overlay or lightbox above the current page.',
    useWhen: 'Use VideoViewer when a thumbnail, preview card, compact inline player, attachment, gallery item, or media library item should open a larger focused video viewing experience. Put ngsVideoViewer on the preview container and ngsVideoViewerVideo on each clickable preview item. Pass sourceUrl for the video source, plus optional title, caption, description, or template directives ngsVideoViewerVideoTitle, ngsVideoViewerVideoCaption, and ngsVideoViewerVideoDescription. Configure orientation, payload, autoPlay, muted, showPlayButton, showSpeaker, showFullscreen, and showDurationSlider to control the underlying VideoPlayer in the overlay. Good for video attachments, media previews, galleries, lessons, product videos, and media detail flows. Do not use VideoViewer when video should stay inline in the current layout; use VideoPlayer. Do not use it as a carousel, grid, or gallery layout by itself; compose previews with Card, Grid, Carousel, or another layout. Do not use it as a generic modal or form dialog; use Dialog or Drawer. Do not use it for YouTube, Vimeo, or iframe-provider embeds when the provider player is required.',
  },
  'visual-builder': {
    purpose: 'Experimental scaffold for a future no-code or low-code visual workspace.',
    useWhen: 'Do not use ngs-visual-builder for production admin screens, dashboards, visual editors, page builders, or real no-code/low-code workflows yet. The current component is only a placeholder: it has no inputs, outputs, layout regions, canvas, drag and drop, inspector, persistence, or editable block model. Mention it only as an experimental scaffold for future visual builder work. Use ContentEditor for block-based CMS/page content, ImageDesigner for creative image composition, Tiles for editable dashboard widgets or config-driven dashboard renderers, Grid for static dashboard layouts, FormRenderer for backend-driven forms, KanbanBoard for workflow columns, and normal NgStarter layout/components for admin screens.',
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
    '- Put global component style overrides and global CSS variable overrides only in `styles.scss`; for component-scoped overrides, define them in that component\'s stylesheet so they apply only there.',
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
    '  providers: [provideNgsTheme({ theme: \'modern\', colorScheme: \'auto\' })],',
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
