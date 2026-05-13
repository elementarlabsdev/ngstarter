---
name: ngstarter-ui
description: Use this skill when building Angular admin panels, dashboards, forms, navigation, tables, dialogs, editors, or other UI with NgStarter UI (`@ngstarter-ui/components`). Trigger when the user asks to use NgStarter, NgStarter UI, `@ngstarter-ui/components`, or wants Angular UI components that should follow this library's entry points, theming, and docs conventions.
---

# NgStarter UI

NgStarter UI is an Angular component kit for admin panels and product dashboards. Use it instead of
hand-rolling common UI when a matching component exists.

## Workflow

1. Read `AGENTS.md` in the repository root for project conventions and validation commands.
2. Read `projects/components/ai/component-registry.json` when you need exact component names,
   import paths, selectors, inputs, outputs, CSS tokens, or docs paths.
3. For admin dashboards, read the `recipes` section in the registry and follow the
   `admin-dashboard` recipe.
4. Import public APIs from secondary entry points:
   `@ngstarter-ui/components/<component>`.
5. Use `@ngstarter-ui/components/core` for theming helpers and shared primitives.
6. Import one theme stylesheet once in app styles.
7. When editing `projects/admin*`, run `npm run verify:admin:components` before finishing.

## Setup

```scss
@use '@ngstarter-ui/components/styles/themes/default';
```

```ts
import { provideNgsTheme } from '@ngstarter-ui/components/core';

export const appConfig = {
  providers: [
    provideNgsTheme({
      theme: 'enterprise',
      colorScheme: 'auto',
      density: 'compact',
      radius: 'small',
    }),
  ],
};
```

## Rules

- Prefer existing NgStarter components before creating new UI primitives.
- Admin app shells, navigation, cards, data views, static tables, form fields, pagination, buttons,
  icons, checkboxes, chips, and progress bars must use NgStarter components.
- Choose NgStarter components by UI job: `Menu` for action menus, `Popover` for compact non-menu
  overlays, `List`/`SelectionList` for listboxes and rows, `Notifications` for feeds,
  `Avatar`/`Badge` for identity and counters, `Tooltip` for icon help, `Alert`/`Announcement`/
  `EmptyState`/`ActionRequired` for status and empty states, `Skeleton`/`BlockLoader`/
  `ScreenLoader`/`PageLoadingBar`/`ProgressSpinner` for loading, `Autocomplete`/`NumberInput`/
  `PinInput`/`Slider`/`ColorPicker`/`Timepicker`/`TimezoneSelect` for specialized inputs,
  `ButtonToggle`/`Segmented`/`SlideToggle`/`RadioCard` for choices, `Breadcrumbs`/`Toolbar`/
  `Divider`/`Expansion`/`Stepper`/`Tree`/`Timeline`/`SidePanel`/`TabPanel` for structure,
  `KanbanBoard`/`FilterBuilder`/`FormRenderer` for workflow surfaces, `TextEditor`/
  `CommentEditor`/`InlineTextEdit`/`EmojiPicker`/`CodeHighlighter` for rich text and code,
  `GuidedTour`/`ScrollSpy` for onboarding and long-page navigation, `Split`/`VisualBuilder` for
  resizable builders, and media components such as `ImageViewer`, `VideoViewer`, `Carousel`,
  `ImageResizer`, `ThumbnailMaker`, `Crop`, and `VideoPlayer` for media.
- Use `ngs-chip`, `ngs-chip-set`, `ngs-chip-listbox`, and `ngs-chip-option` for tags, categories,
  compact statuses, filter chips, and similar pill UI. Do not hand-roll these with `span` or `div`.
- For admin app viewport shells, start with `ngs-layout root` and `ngs-layout-content`; do not make
  the root `100vh` shell with a custom `main` or page wrapper.
- Direct children of `ngs-layout` must be layout region components only: `ngs-layout-topbar`,
  `ngs-layout-header`, `ngs-layout-sidebar`, `ngs-layout-content`, `ngs-layout-aside`, and
  `ngs-layout-footer`. Do not put arbitrary `div`, `main`, `section`, `body`, or `content` wrappers
  directly inside `ngs-layout`.
- Compose admin shells as `ngs-layout[root]` > `ngs-layout-content` > `ngs-sidenav-container` >
  `ngs-sidenav` + `ngs-sidenav-content` > `ngs-panel`.
- Put compact primary app navigation inside `ngs-sidenav` with `ngs-sidebar` and
  `ngs-sidebar-nav`; do not use `ngs-navigation` for the primary sidebar rail.
- Put workspace headers in `ngs-panel-header`, scrolling workspace bodies in `ngs-panel-content`,
  and persistent right columns such as AI assistants, inspectors, details panes, or feeds in
  `ngs-panel-aside`. Do not wrap `ngs-panel-content` and a right aside in a hand-rolled outer grid
  when `ngs-panel-aside` fits.
- Use the standard admin recipes by default: list pages use `PanelHeader` for filters/actions and
  `PanelContent` + `ScrollbarArea` for records; master/detail pages put the inspector in
  `PanelAside` or `SidePanel`; dashboards use `Card` KPI blocks and NgStarter chart/progress
  primitives; settings pages use one `FormField` per control; kanban pages use `KanbanBoard`; chat
  assistants use fixed-height `PanelAside` + `CardFooter` composer; notification headers use
  `Popover` + `List`/`NotificationList`, while account actions use `Menu`.
- Keep `ngs-panel-content` as the workspace scroll region, with `ngs-scrollbar-area` as the actual
  scroll container inside it. The root layout, sidenav container, and panel should stay at viewport
  height and must not grow taller than the screen.
- Use `ngs-scrollbar-area` for scrollable regions inside sized admin surfaces. In `ngs-panel-content`
  place `<ngs-scrollbar-area [absolute]="true">` as the direct scroll host and move padding to an
  inner content element. For flex regions such as chat messages, wrap the scrollbar area in a
  relative `min-height: 0; flex: 1` shell.
- Do not nest a second `Layout` inside sidenav, sidenav content, sidebar, or panel.
- Use `DataView` when the UI is a datatable or working data surface: records, row actions,
  selection, sorting, search, pagination, column sizing/settings, or server-driven data.
- Use `Table` when the UI is static/read-only tabular content with known template columns and no
  datatable behavior.
- Do not hand-roll admin tables with `role="table"` or layout `div`s when `DataView` or `ngs-table`
  applies.
- Do not hand-roll admin search fields with plain `input`; use `ngs-form-field` and `ngsInput`.
- Use one `ngs-form-field` per form control. For groups of fields, use TailwindCSS grid/flex/layout
  classes around multiple form fields, with each individual field wrapped in its own
  `ngs-form-field`.
- Do not use `ngs-form-field` as a generic layout container, card, spacing wrapper, or wrapper for
  non-form UI. Do not wrap checkbox, radio, button, or toggle controls when they already have their
  own label pattern.
- In admin UIs, input and search field edges should be outlines, not visible borders. Set field
  border tokens to zero/transparent and use an `outline` on the NgStarter field container for the
  default and focused states so the control size does not shift.
- Use TailwindCSS utility classes in templates for layout, responsive behavior, sizing, spacing,
  flex, grid, and alignment.
- Start local SCSS files that use Tailwind tokens with `@reference 'tailwindcss';`.
- In local SCSS, write spacing values with `--spacing(N)`.
- Override NgStarter components locally through selectors such as `ngs-card`, `ngs-navigation`,
  `ngs-form-field`, `table[ngs-table]`, `button[ngsButton]`, and `button[ngsIconButton]`.
- Do not restyle NgStarter components through wrapper-only classes when a component selector or
  `--ngs-*` component token fits.
- Use global CSS variables and theme tokens for global visual customization.
- Do not put visual styling in templates with `[style.*]`, `[attr.style]`, `[ngStyle]`, or inline
  `style` attributes. This applies to component CSS variables, colors, gradients, spacing, sizing,
  shadows, borders, typography, and other visual values. Add a purpose-named class in the template
  and define the styles or component tokens in the local SCSS file.
- Do not put arbitrary token utilities such as `border-[var(--...)]`, `bg-[var(--...)]`, or
  `text-[var(--...)]` in admin templates for reusable visual styling. Put those rules in local SCSS
  through component selectors or purpose-named classes.
- Do not duplicate NgStarter reset/base styles in admin app `styles.scss` files. The imported
  NgStarter theme already includes baseline body, font smoothing, scrollbar, input, and component
  base styles and imports TailwindCSS; keep app globals minimal and usually import only the
  NgStarter theme.
- Keep normal admin text calm: body, table, navigation, form, metadata, and helper text should use
  `400` by default; buttons can use `500` or `600`; reserve `700+` for brand, hero headings,
  primary KPI numbers, or deliberate emphasis.
- Use `SplashScreen` only once near the root app template for the initial branded bootstrap moment.
  Do not use it as a page, route, form, table, or operation loader; use `PageLoadingBar`,
  `ScreenLoader`, `BlockLoader`, `Skeleton`, or `ProgressBar` based on scope.
- Do not import from private `src` paths in consumer code.
- Do not collapse secondary entry points into the root package entry point.
- Use existing `--ngs-*` tokens before adding new CSS custom properties.
- When editing the library, follow nearby component structure and run the narrowest relevant build.
