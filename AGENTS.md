# NgStarter UI Agent Guide

NgStarter UI is an Angular component kit for admin panels and product dashboards. The published
package is `@ngstarter-ui/components`; components are exposed through secondary entry points such
as `@ngstarter-ui/components/button`, `@ngstarter-ui/components/dialog`, and
`@ngstarter-ui/components/table`.

## Repository Shape

- `projects/components` is the publishable Angular library.
- `projects/components/<component>` is one secondary entry point.
- `projects/components/<component>/src/<component>` contains the component implementation.
- `projects/components/core` contains shared primitives, services, directives, theming helpers, and
  low-level utilities.
- `projects/components/styles/themes` contains theme stylesheet entry points.
- `projects/docs` is the documentation/demo application.
- `projects/admin`, `projects/admin-modern`, and `projects/admin-corporate` are admin demo
  applications. `projects/admin-classic` is a placeholder until it is converted to a real admin
  demo and is intentionally skipped by the admin verifier.

## Commands

- `npm run build:components:prod` builds the publishable component package and schematics.
- `npm run verify:components:package` validates the generated package.
- `npm run build:docs:prod` builds the docs app.
- `npm run start:docs` runs the docs app locally.
- `npm run test` runs the Angular unit test target.

Prefer the narrowest command that verifies the change. For component library changes, start with
`npm run build:components:prod`.

## Component Conventions

- Components are standalone Angular components.
- Library selectors use the `ngs` prefix.
- Every Angular component should live in its own folder, with its `.ts`, `.html`, `.scss`, tests,
  and related local files grouped together under that component folder.
- Public component APIs are exported from `projects/components/<component>/public-api.ts`.
- Secondary entry points have their own `index.ts` and `ng-package.json`.
- Keep imports from public entry points when writing docs or consumer-facing examples:
  `@ngstarter-ui/components/<component>`.
- Always use the latest Angular APIs supported by the current project version in new components,
  docs, and examples. Prefer standalone components, `inject()`, `signal()`, `computed()`,
  `input()`, `output()`, `model()`, and Angular control flow such as `@if`, `@for`, and `@switch`
  instead of older class-field state, constructor injection, decorators, or structural directives
  unless existing local patterns or interoperability require the older API.
- Keep `ChangeDetectionStrategy.OnPush` for UI components unless there is a specific reason not to.
- Keep styles component-scoped unless a value belongs in shared theme tokens.

## Admin App Construction Rules

When building or changing admin pages in `projects/admin*`, agents MUST compose UI from NgStarter
components before writing custom primitives.

When implementing UI from screenshots, mockups, or visual references, agents MUST first map every
visible region, control, list, table, card, chart, grid, tile, toolbar, navigation element, form
field, popover, and status indicator to existing NgStarter components. Visual fidelity is achieved
by composing and theming those components, not by recreating component behavior with plain `div`,
`span`, `button`, `input`, CSS-only grids, or ad hoc primitives. If a screenshot shows a dashboard
or widget layout, use `Grid` for a fixed app-defined dashboard and `Tiles`/`Tile` only when users can
reorder, customize, or persist dashboard tile layout.

Required admin mappings:

- Root viewport shell: `Layout` and `LayoutContent` from `@ngstarter-ui/components/layout`.
- App shell: `Sidenav`, `SidenavContainer`, and `SidenavContent` from
  `@ngstarter-ui/components/sidenav`.
- Primary app navigation inside the sidenav: compact `Sidebar`, `SidebarHeader`, `SidebarBody`,
  `SidebarFooter`, `SidebarNav`, `SidebarNavItem`, `SidebarNavItemIconDirective`, and
  `SidebarNavItemBadgeDirective` from `@ngstarter-ui/components/sidebar`.
- Local workspace surfaces: `Panel`, `PanelHeader`, `PanelContent`, `PanelAside`, `PanelSidebar`,
  and `PanelFooter` from `@ngstarter-ui/components/panel`.
- Secondary workspaces, inspectors, and persistent tool tabs: `SidePanel` and `SidePanelTab` from
  `@ngstarter-ui/components/side-panel`; use `TabPanel`, `TabPanelHeader`, `TabPanelNav`,
  `TabPanelContent`, `TabPanelAside`, and related tab panel parts from
  `@ngstarter-ui/components/tab-panel` for tabbed work surfaces.
- Secondary in-page navigation only when it is not the app rail: `Navigation`, `NavigationItem`,
  and `NavigationItemIconDirective` from `@ngstarter-ui/components/navigation`.
- Rail-style compact secondary navigation: `RailNav`, `RailNavItem`, and
  `RailNavItemIconDirective` from `@ngstarter-ui/components/rail-nav`; do not use it for the
  primary admin app rail when `Sidebar` inside `Sidenav` is the intended shell.
- Breadcrumb trails and page hierarchy: `Breadcrumbs`, `Breadcrumb`, `BreadcrumbItem`, and related
  breadcrumb directives from `@ngstarter-ui/components/breadcrumbs`.
- Toolbars, dense action rows, and editor/action headers: `Toolbar`, `ToolbarRow`, `ToolbarItem`,
  `ToolbarNav`, `ToolbarNavLink`, `ToolbarSpacer`, and `ToolbarTitle` from
  `@ngstarter-ui/components/toolbar`.
- Section separators and labeled separators: `Divider` and `TextDivider` from
  `@ngstarter-ui/components/divider`.
- Cards and KPI panels: `Card`, `CardContent`, and `CardFooter` when needed from
  `@ngstarter-ui/components/card`.
- Card-hover media/action overlays: `CardOverlay` and `CardOverlayContainerDirective` from
  `@ngstarter-ui/components/card-overlay`.
- Datatables, operational admin datasets, and rich data grids: `DataView` from
  `@ngstarter-ui/components/data-view`.
- Static, read-only, or simple template-defined tables: `Table`, `ColumnDef`, `HeaderCell`, `HeaderCellDef`,
  `Cell`, `CellDef`, `HeaderRow`, `HeaderRowDef`, `Row`, and `RowDef` from
  `@ngstarter-ui/components/table`.
- Search and text fields: `FormField`, `Label`, prefix/suffix directives, and `Input`.
- Autocomplete fields and suggestions attached to text inputs: `Autocomplete` and `Option` from
  `@ngstarter-ui/components/autocomplete`.
- Select-like date/time/location format controls: `DateFormatSelect` from
  `@ngstarter-ui/components/date-format-select`, `TimezoneSelect` from
  `@ngstarter-ui/components/timezone-select`, and `Timepicker`, `TimepickerInput`, and
  `TimepickerToggle` from `@ngstarter-ui/components/timepicker`.
- Numeric, masked, PIN, slider, and color inputs: `NumberInput` and number controls from
  `@ngstarter-ui/components/number-input`, mask directives from
  `@ngstarter-ui/components/input-mask`, `PinInput` from `@ngstarter-ui/components/pin-input`,
  `Slider` and thumb directives from `@ngstarter-ui/components/slider`, and `ColorPicker` from
  `@ngstarter-ui/components/color-picker`.
- Input validation helpers: validators and validator options from
  `@ngstarter-ui/components/input-validator`.
- Generated or schema-driven forms: `FormRenderer` and related field/layout configs from
  `@ngstarter-ui/components/form-renderer`.
- Pagination: `Paginator`.
- Actions: `Button` and `Icon`.
- Action menus, command menus, and contextual action lists: `Menu`, `MenuItem`, `MenuHeader`,
  `MenuFooter`, `MenuDivider`, `MenuTrigger`, and `ContextMenuTrigger` from
  `@ngstarter-ui/components/menu`.
- Popover content such as notifications, compact previews, pickers, and non-menu overlays:
  `Popover`, `PopoverContent`, `PopoverTriggerForDirective`, and `PopoverOriginDirective` from
  `@ngstarter-ui/components/popover`.
- Tooltips for icon-only controls and dense UI affordances: `Tooltip` and `TooltipContent` from
  `@ngstarter-ui/components/tooltip`.
- Dialog confirmations and transient feedback: `Confirm` and `ConfirmManager` from
  `@ngstarter-ui/components/confirm`, `SnackBar` and related snack-bar classes from
  `@ngstarter-ui/components/snack-bar`.
- Larger temporary overlays: `Drawer` from `@ngstarter-ui/components/drawer` and `BottomSheet` from
  `@ngstarter-ui/components/bottom-sheet`.
- Command palettes and command bars: `CommandBar`, `CommandBarCommand`, and `CommandBarDivider`
  from `@ngstarter-ui/components/command-bar`.
- Selection: `Checkbox`, `RadioButton`, `RadioGroup`, `RadioCard`, and `RadioCardGroup` where
  appropriate; use `ButtonToggle`/`ButtonToggleGroup` or `Segmented`/`SegmentedButton` for
  segmented choices, and `SlideToggle` for binary switches.
- Tags, categories, compact statuses, and filter chips: `Chip`, `ChipSet`, `ChipListbox`, and
  `ChipOption` from `@ngstarter-ui/components/chips`.
- Lists, listboxes, and notification rows: `List`, `ListItem`, `SelectionList`, `ListOption`, and
  list item avatar/icon/title/line/meta directives from `@ngstarter-ui/components/list`.
- Notifications and activity feeds: `NotificationList`, `NotificationDefDirective`, and
  notification primitives from `@ngstarter-ui/components/notifications`.
- Avatars, people indicators, and avatar stacks: `Avatar`, `AvatarGroup`, `AvatarMore`,
  `AvatarPresenceIndicator`, and `AvatarTotal` from `@ngstarter-ui/components/avatar`.
- Badges and small counters: `Badge`.
- Progress and completion: `ProgressBar`, `ProgressSpinner`, `Skeleton`, `BlockLoader`,
  `ScreenLoader`, and `PageLoadingBar` according to loading scope.
- Empty, blocked, required-action, and informational states: `EmptyState`, `ActionRequired`,
  `Alert`, `Announcement`, and `Incidents`.
- Disclosure and multi-step flows: `ExpansionPanel`, `Accordion`, `Stepper`, `Step`,
  `StepperNext`, `StepperPrevious`, `HeadlessStepper`, and `HeadlessStep`.
- Keyboard shortcut hints: `Kbd` and `KbdGroup`.
- Trees and hierarchical data: `Tree`, `TreeNode`, `TreeNodeDef`, `TreeNodePadding`, and
  `TreeNodeToggle`.
- Timelines and activity history: `Timeline`, `TimelineItem`, `TimelineHeader`,
  `TimelineTimestamp`, `TimelineTitle`, `TimelineSubtitle`, `TimelineDescription`, and
  `TimelineContent`.
- Kanban and drag-sort work boards: `KanbanBoard`, `KanbanColumn`, `KanbanItem`, and
  `KanbanItemDefDirective`.
- Filter/query builders: `FilterBuilder` and related filter builder definitions/directives.
- Charts and compact metrics: `Gauge`, `GaugeValue`, and micro chart components from
  `@ngstarter-ui/components/gauge` and `@ngstarter-ui/components/micro-chart`.
- Rich text, comments, and code: `TextEditor`, `CommentEditor`, their toolbar/command directives,
  `InlineTextEdit`, `EmojiPicker`, `EmojiPickerTriggerForDirective`, and `CodeHighlighter`.
- Media previews and editing: `ImageViewer`, `VideoViewer`, `ImagePlaceholder`, `ImageResizer`,
  `ImageZoomViewer`, `Crop`, `Carousel`, `ComparisonSlider`, `ThumbnailMaker`, and `VideoPlayer`.
- Resizable split panes and spatial layout editing: `Split`, `SplitArea`, `SplitPane`, and
  `VisualBuilder`.
- Content affordances and utilities: `ContentFade`, `Expand`, `Marquee`, `Suggestions`,
  `ScrollSpy`, `ScrollSpyNav`, `ScrollSpyContainerDirective`, `GuidedTour`/`TourService` via
  `@ngstarter-ui/components/guided-tour`, `ColorSwitcher`, `CookiePopup`, `Logo`, `Tiles`, and
  `ResizableContainer`.
- `ngs-logo-shape` is only for compact square or near-square logo marks/emblems. Do not use it for
  long wordmark images or full-width brand logos; place those directly inside `ngs-logo` or compose
  them with `ngs-logo-text`.
- Scrollable panel, grid, sidebar, inspector, and chat message regions: `ScrollbarArea` from
  `@ngstarter-ui/components/scrollbar-area`.
- Startup splash: `SplashScreen` only once near the root app template for initial branded bootstrap
  loading; do not use it as a general page, route, form, table, or operation loader.

Agents MUST NOT hand-roll these primitives with plain `div`, `table`, `button`, or `input` unless
no matching NgStarter component exists. If the UI is a datatable or working data surface with
records, actions, selection, sorting, search, pagination, column sizing, column settings, or
server-driven data, use `DataView`. If the UI is only static/read-only tabular content with known
template columns and no datatable behavior, use `Table`. CSS may tune layout, spacing, and visual
fidelity, but it must not replace NgStarter component structure.

Admin shell defaults:

- Make the root admin app height through `<ngs-layout root>` and keep document/app containers at
  viewport height with overflow hidden. Do not create the root `100vh` shell with a custom `main`,
  route wrapper, or page `div`.
- Direct children of `ngs-layout` must be layout region components only: `ngs-layout-topbar`,
  `ngs-layout-header`, `ngs-layout-sidebar`, `ngs-layout-content`, `ngs-layout-aside`, and
  `ngs-layout-footer`. Do not put arbitrary `div`, `main`, `section`, `body`, or `content` wrappers
  directly inside `ngs-layout`.
- Compose admin shells in this order: `ngs-layout[root]` > `ngs-layout-content` >
  `ngs-sidenav-container` > `ngs-sidenav` + `ngs-sidenav-content` > `ngs-panel`.
- Do not place another `Layout` inside `Sidenav`, `SidenavContent`, `Sidebar`, or `Panel`; the
  single root `Layout` owns viewport sizing.
- Put the compact app rail inside `ngs-sidenav` with `ngs-sidebar`. Do not use `ngs-navigation` for
  the primary sidebar/rail.
- When content inside `ngs-sidenav` or `ngs-sidebar` must render different blocks for expanded and
  compact states, use `*ngsSidenavExpanded` and `*ngsSidenavCollapsed` from
  `@ngstarter-ui/components/sidenav`. Do not use ad hoc CSS classes such as
  `.ngs-sidebar-full-view-mode` or `.ngs-sidebar-compact-view-mode` in docs or admin examples.
- Put the page/workspace header in `ngs-panel-header`, the scrollable main body in
  `ngs-panel-content`, and any persistent right column such as an assistant, inspector, details
  pane, or activity feed in `ngs-panel-aside`. Do not build a manual outer CSS grid that wraps
  content and right aside when `ngs-panel-aside` fits.
- `ngs-panel-content` should own the workspace scroll region. The actual scroll container inside it
  should be `ngs-scrollbar-area`. The overall admin app, root layout, sidenav container, and panel
  should not become taller than the viewport.
- Use `ngs-scrollbar-area` for actual scrollable regions inside sized admin surfaces. For
  `ngs-panel-content`, put `<ngs-scrollbar-area [absolute]="true">` inside the panel content and
  move content padding to an inner element. For chat messages or other flex children, wrap the
  scrollbar area in a `position: relative; min-height: 0; flex: 1` shell.
- Chat-like assistants should be structured as a fixed-height panel aside with a scrollable messages
  region and a composer anchored at the bottom, using `Card`, `CardHeader`, `CardContent`,
  `FormField`, `Input`, `Button`, and `Icon` where applicable.

Admin generation recipes:

- List page: `Layout` > `LayoutContent` > `SidenavContainer` > `Sidenav` with `Sidebar` +
  `SidenavContent` > `Panel`; put filters/search/actions in `PanelHeader`, records in
  `PanelContent` with `ScrollbarArea`, and use `DataView` for operational datasets or `Card` grids
  for browse-style records.
- Master/detail page: keep the list in `PanelContent` and put the details inspector in
  `PanelAside` or `SidePanel`; use `List`, `DataView`, `Tabs`/`TabPanel`, `Timeline`, and `Card`
  rather than custom split panes unless the page is genuinely resizable.
- Dashboard page: use `PanelHeader` for top controls, `PanelContent` with `ScrollbarArea`, `Grid`
  for fixed app-defined widget layouts, `Tiles`/`Tile` only for user-reorderable/customizable
  widget layouts, `Card` for KPI blocks, `ProgressBar`, `Gauge`, or micro charts for compact
  metrics, and `Table` or `DataView` for supporting records.
- Settings/form page: use `Card` or `PanelContent` sections with one `FormField` per form control;
  use `Select`, `Autocomplete`, `SlideToggle`, `ButtonToggle`, `Segmented`, `RadioCard`,
  `Checkbox`, and specialized inputs instead of custom controls.
- Kanban/workflow page: use `KanbanBoard` for columns/cards and `Drawer`, `Popover`, `Menu`, or
  `SidePanel` for card actions and details.
- Chat assistant page/aside: use a fixed-height `PanelAside`, `CardHeader`, scrollable
  `CardContent` with `ScrollbarArea`, and a `CardFooter` composer with `FormField`, `Input`, and
  an icon button suffix.
- Notification/user header: use `Popover` + `List`/`NotificationList` for notification feeds, and
  `Menu` for profile/account actions. Do not use `Menu` for listbox-like notification content.

Form construction rules:

- Use one `ngs-form-field` for one form control such as `input[ngsInput]`, `textarea[ngsInput]`,
  `ngs-select`, autocomplete inputs, datepicker inputs, country/currency/date-format/phone/number
  controls, and custom controls that implement `FormFieldControl`.
- Put groups of fields in TailwindCSS grid/flex/layout containers. Each individual field inside the
  group still gets its own `ngs-form-field`.
- Do not use `ngs-form-field` as a generic layout container, card, spacing wrapper, or wrapper for
  non-form UI.
- Do not wrap checkbox, radio, button, or toggle controls in `ngs-form-field` when they already have
  their own label pattern.
- Standalone `ngs-form-field` controls outside forms, such as header, toolbar, or compact filter
  fields, do not require `ngs-label` when they have clear placeholder text or an
  `aria-label`/`aria-labelledby` context. Form fields inside actual forms should still use
  `ngs-label`.
- In admin UIs, text inputs and search fields should not use visible CSS borders. Set form field
  border tokens to zero/transparent and render the field edge with `outline` on the NgStarter field
  container, including focused state. The outline must not change layout size.

Styling rules for admin UIs:

- Build page layout, responsive behavior, sizing, spacing, flex, grid, and alignment with
  TailwindCSS utility classes in templates.
- Treat TailwindCSS utility classes in templates as the primary styling surface. Use local SCSS only
  when TailwindCSS cannot express the styling cleanly, or when overriding CSS custom
  properties/tokens such as `--ngs-*`; routine layout, spacing, sizing, flex/grid, and alignment
  must stay in TailwindCSS first.
- Start local component SCSS files that use Tailwind tokens with `@reference 'tailwindcss';`.
- In local SCSS, express spacing values with the Tailwind function `--spacing(N)`.
- In component SCSS files, all component-local styling MUST be nested under the `:host` selector;
  do not write top-level component-local selectors outside `:host`.
- In component SCSS files, nested element/state styles MUST use nested SCSS blocks instead of flat
  descendant selectors. For example, write `:host-context(.state) { .child { ... } }`, never
  `:host-context(.state) .child { ... }`; write `:host(.state) { .child { ... } }`, never
  `:host(.state) .child { ... }`.
- Locally override NgStarter components through component or directive selectors such as
  `ngs-card`, `ngs-navigation`, `ngs-form-field`, `table[ngs-table]`, `button[ngsButton]`, and
  `button[ngsIconButton]`.
- Do not restyle NgStarter components through wrapper-only classes such as `.stat-card`,
  `.tasks-panel`, or `.admin-navigation` when a component selector or component token fits.
- Global visual customization should use CSS custom properties and theme tokens, especially
  `--ngs-*` variables.
- Do not put visual styling in templates with `[style.*]`, `[attr.style]`, `[ngStyle]`, or inline
  `style` attributes. This applies to component CSS variables, colors, gradients, spacing, sizing,
  shadows, borders, typography, and other visual values. Add a purpose-named class in the template
  and define the styles or component tokens in the local SCSS file.
- Do not put arbitrary token utilities such as `border-[var(--...)]`, `bg-[var(--...)]`, or
  `text-[var(--...)]` in admin templates for reusable visual styling. Define those visual rules in
  local SCSS with a component selector or a purpose-named class, and keep templates focused on
  structure, layout, and state.
- Do not duplicate NgStarter global reset/base styles in admin app `styles.scss` files. Theme
  styles already include baseline `body`, font smoothing, scrollbar, input, and component base
  styles. The NgStarter theme also imports TailwindCSS, so admin app global styles should usually
  import only the NgStarter theme.
- Do not add element reset rules such as `h1, h2, p, ul { margin: 0; }`; TailwindCSS and the
  NgStarter theme already provide these baseline resets.

Typography rules for admin UIs:

- Normal body, table, navigation, form, metadata, and helper text should use regular or medium
  weights; default to `400`.
- Navigation items should use `400` unless the active state needs slightly stronger emphasis.
- Buttons may use `500` or `600`.
- Section titles and compact panel headings may use `600` or `650`.
- Reserve `700+` only for brand marks, hero headings, primary KPI numbers, or deliberately strong
  emphasis.
- Do not make ordinary table rows, labels, descriptions, sidebar items, or status text bold just to
  imitate a screenshot.

Before finishing an admin UI change, run:

```bash
npm run verify:admin:components
```

Before reporting completion, also scan the changed admin templates for:

- `[style.*]`, `[attr.style]`, `[ngStyle]`, or inline `style`.
- `bg-[var(...)]`, `text-[var(...)]`, `border-[var(...)]`, or literal color utilities such as
  `text-[#...]` for reusable visual styling.
- Custom `span`/`div` pills, chips, avatars, menus, popovers, listboxes, tables, pagination, or
  form controls where an NgStarter component exists.
- Plain `<input>` without `ngsInput`, plain `<table>` without `ngs-table`, and manual
  `role="table"`, `role="row"`, or `role="cell"` data grids.
- Scrollable admin regions without `ngs-scrollbar-area`.

If the verifier fails, refactor to NgStarter components before reporting completion. Migration
warnings from older demos identify existing debt; new or modified admin UI should satisfy the
strict rules.

## Theming

Themes are driven by `--ngs-*` CSS custom properties.

- Primitive tokens cover spacing, radius, font sizes, and shadows.
- Semantic tokens include values such as `--ngs-color-primary`,
  `--ngs-color-surface`, and `--ngs-color-danger`.
- Component tokens include values such as `--ngs-button-height`,
  `--ngs-field-radius`, and `--ngs-table-row-height`.

Use existing tokens before adding new ones. When a new token is necessary, make it consistent with
the `--ngs-*` naming scheme and update the relevant theme files.

Consumers import one theme stylesheet once:

```scss
@use '@ngstarter-ui/components/styles/themes/default';
```

Runtime theming is provided through `provideNgsTheme` and `ThemeManagerService` from
`@ngstarter-ui/components/core`.

## Adding Or Updating A Component

When adding a new secondary entry point:

1. Create `projects/components/<name>/ng-package.json`.
2. Create `projects/components/<name>/index.ts`.
3. Create `projects/components/<name>/public-api.ts`.
4. Put implementation files under `projects/components/<name>/src/<name>/`.
5. Export the public API from `public-api.ts`.
6. Add docs examples under `projects/docs/src/app` when the component is user-facing.
7. Run `npm run build:components:prod`.

Follow nearby components before inventing new patterns.

## AI-Friendly Usage Examples

Prefer examples that show the actual import, template usage, and the minimum setup:

```ts
import { Button } from '@ngstarter-ui/components/button';
```

```html
<button ngsButton="filled">Save</button> <button ngsIconButton aria-label="Settings">...</button>
```

For app setup:

```ts
import { provideNgsTheme } from '@ngstarter-ui/components/core';

export const appConfig = {
  providers: [
    provideNgsTheme({
      theme: 'modern',
      colorScheme: 'auto',
      density: 'compact',
      radius: 'small',
      primaryColor: '#155eef',
    }),
  ],
};
```

## Safety Rules

- Do not edit generated files under `dist/`.
- Do not collapse secondary entry points into the root package entry point.
- Do not use private implementation imports in consumer examples.
- Do not remove peer dependencies from `projects/components/package.json` without checking package
  compatibility.
- Keep changes scoped to the component or shared primitive being modified.
