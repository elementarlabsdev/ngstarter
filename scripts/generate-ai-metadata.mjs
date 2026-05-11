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
    purpose: 'Provide shared primitives, utilities, pipes, directives, theming services, and low-level behavior used by NgStarter components.',
    useWhen: 'Import from core for theme setup, shared directives, utility pipes, ripple, focus helpers, and library infrastructure.',
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
    useWhen: 'Use for admin screens, CRM and ERP records, users, orders, invoices, logs, tasks, assets, and any dataset where the table is the main work surface. DataView is configured with columnDefs plus local data or a server-side datasource, and supports sorting, search/filter state, pagination, row selection, loading states, empty states, column resizing, column visibility and order, pinned or sticky columns, custom cell renderers, refresh, snapshots, and ngsDataViewActionBar. Do not use for small static tables or simple read-only tabular content; use Table. Do not use as a card list, layout grid, chart widget, report summary, or form editor.',
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
    purpose: 'Render configuration-driven dashboard widgets in a 12-column grid.',
    useWhen: 'Use for admin dashboards, configurable widget layouts, analytics home screens, portal start pages, and nested dashboard sections where widget components are selected from configuration or data. Provide configs that map item types to lazy-loaded components and optional skeletons, and items with id, type, columns, height, content, skeletonHeight, and children. Widgets can inject GRID and call markItemAsLoaded(id), especially with waitWhenAllItemsLoaded. Do not use Grid as a normal CSS layout helper for forms, pages, cards, or repeated elements; use TailwindCSS grid/flex classes. Do not use for tables or datasets; use Table or DataView. Do not use for file/media grids; use upload/media components. Do not use as a drag-and-drop dashboard builder when interactive rearranging/resizing is required.',
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
