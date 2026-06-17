# NgStarter UI

NgStarter UI is an Angular component kit for admin panels and product dashboards. The
component package is published as `@ngstarter-ui/components` and is organized around
secondary entry points such as `@ngstarter-ui/components/button`,
`@ngstarter-ui/components/dialog`, and `@ngstarter-ui/components/table`.

## Installation

For a new Angular 21 project, create the app with SCSS and add NgStarter UI:

```bash
npx @angular/cli@21 new project-name --style=scss
cd project-name
npx ng add @ngstarter-ui/components
```

For an existing Angular 21 app, run the same schematic from your project root:

```bash
npx ng add @ngstarter-ui/components
```

The `ng add` schematic also creates NgStarter Codex guidance in `AGENTS.md` and installs a local
Codex skill at `.codex/skills/ngstarter-ui` by default. To skip that setup, run:

```bash
npx ng add @ngstarter-ui/components --codex-skill=false
```

If NgStarter UI is already installed and you only want to add or refresh the Codex skill, run:

```bash
npx ng generate @ngstarter-ui/components:codex-skill
```

NgStarter components are standalone Angular components. Import each component from its
secondary entry point:

```ts
import { Button } from '@ngstarter-ui/components/button';
import { Dialog } from '@ngstarter-ui/components/dialog';
import { Input } from '@ngstarter-ui/components/input';
```

## Theming

Import one theme stylesheet once in your app styles:

```scss
@use '@ngstarter-ui/components/styles/themes/default';
```

Other presets are available for faster admin styling:

```scss
@use '@ngstarter-ui/components/styles/themes/modern';
@use '@ngstarter-ui/components/styles/themes/compact';
```

Themes are driven by `--ngs-*` design tokens. The main layers are:

- primitive tokens: spacing, radius, font sizes, shadows
- semantic tokens: `--ngs-color-primary`, `--ngs-color-surface`, `--ngs-color-danger`
- component tokens: `--ngs-button-height`, `--ngs-field-radius`, `--ngs-table-row-height`

You can switch theme, density, radius, and color scheme at runtime:

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

For user preferences or tenant branding, inject `ThemeManagerService`:

```ts
themeManager.setTheme('modern');
themeManager.setDensity('spacious');
themeManager.setRadius('large');
themeManager.setPrimaryColor('#7c3aed');
themeManager.changeColorScheme('dark');
```

The same values can be controlled with document attributes:

```html
<html data-ngs-theme="modern" data-ngs-density="compact" data-ngs-radius="small">
```

## Component Demos

The documentation site includes live demos and API examples for each component:

- [Documentation](https://docs.ngstarter.com)
- [Installation](https://docs.ngstarter.com/installation)
- [AI component registry](https://docs.ngstarter.com/ai/component-registry.json)

### Forms

- [Autocomplete](https://docs.ngstarter.com/forms/autocomplete)
- [Button](https://docs.ngstarter.com/forms/buttons)
- [Button Toggle](https://docs.ngstarter.com/forms/button-toggle)
- [Checkbox](https://docs.ngstarter.com/forms/checkbox)
- [Country Select](https://docs.ngstarter.com/forms/country)
- [Currency Select](https://docs.ngstarter.com/forms/currency-select)
- [Date Format Select](https://docs.ngstarter.com/forms/date-format-select)
- [Inline Text Edit](https://docs.ngstarter.com/forms/inline-text-edit)
- [Input](https://docs.ngstarter.com/forms/input)
- [Input Mask](https://docs.ngstarter.com/forms/input-mask)
- [Input Validator](https://docs.ngstarter.com/forms/input-validator)
- [Number Input](https://docs.ngstarter.com/forms/number-input)
- [Password Strength](https://docs.ngstarter.com/forms/password-strength)
- [Phone Input](https://docs.ngstarter.com/forms/phone-input)
- [Pin Input](https://docs.ngstarter.com/forms/pin-input)
- [Radio](https://docs.ngstarter.com/forms/radio)
- [Segmented](https://docs.ngstarter.com/forms/segmented)
- [Select](https://docs.ngstarter.com/forms/select)
- [Slide Toggle](https://docs.ngstarter.com/forms/slide-toggle)
- [Timezone Select](https://docs.ngstarter.com/forms/timezone)

### Navigation

- [Breadcrumbs](https://docs.ngstarter.com/navigation/breadcrumbs)
- [Navigation](https://docs.ngstarter.com/navigation/navigation)
- [Rail Navigation](https://docs.ngstarter.com/navigation/rail-nav)
- [Sidebar](https://docs.ngstarter.com/navigation/sidebar)
- [Side Panel](https://docs.ngstarter.com/navigation/side-panel)
- [Tab Panel](https://docs.ngstarter.com/navigation/tab-panel)

### Data, Layout, And Libraries

- [Content Editor](https://docs.ngstarter.com/libraries/content-editor)
- [Data View](https://docs.ngstarter.com/libraries/data-view)
- [Image Designer](https://docs.ngstarter.com/libraries/image-designer)
- [Kanban Board](https://docs.ngstarter.com/libraries/kanban-board)
- [Micro Charts](https://docs.ngstarter.com/micro-charts)
- [Video Player](https://docs.ngstarter.com/libraries/video-player)
- [Visual Builder](https://docs.ngstarter.com/libraries/visual-builder)

### Components

- [Action Required](https://docs.ngstarter.com/components/action-required)
- [Alert](https://docs.ngstarter.com/components/alert)
- [Announcement](https://docs.ngstarter.com/components/announcement)
- [Avatar](https://docs.ngstarter.com/components/avatar)
- [Badge](https://docs.ngstarter.com/components/badge)
- [Block Loader](https://docs.ngstarter.com/components/block-loader)
- [Bottom Sheet](https://docs.ngstarter.com/components/bottom-sheet)
- [Card](https://docs.ngstarter.com/components/card)
- [Card Overlay](https://docs.ngstarter.com/components/card-overlay)
- [Carousel](https://docs.ngstarter.com/components/carousel)
- [Chips](https://docs.ngstarter.com/components/chips)
- [Code Highlighter](https://docs.ngstarter.com/components/code-highlighter)
- [Color Picker](https://docs.ngstarter.com/components/color-picker)
- [Color Switcher](https://docs.ngstarter.com/components/color-switcher)
- [Command Bar](https://docs.ngstarter.com/components/command-bar)
- [Comment Editor](https://docs.ngstarter.com/components/comment-editor)
- [Comparison Slider](https://docs.ngstarter.com/components/comparison-slider)
- [Confirm](https://docs.ngstarter.com/components/confirm)
- [Content Fade](https://docs.ngstarter.com/components/content-fade)
- [Cookie Popup](https://docs.ngstarter.com/components/cookie-popup)
- [Crop](https://docs.ngstarter.com/components/crop)
- [Datepicker](https://docs.ngstarter.com/components/datepicker)
- [Dialog](https://docs.ngstarter.com/components/dialog)
- [Divider](https://docs.ngstarter.com/components/divider)
- [Drawer](https://docs.ngstarter.com/components/drawer)
- [Emoji Picker](https://docs.ngstarter.com/components/emoji-picker)
- [Empty State](https://docs.ngstarter.com/components/empty-state)
- [Expand](https://docs.ngstarter.com/components/expand)
- [Expansion Panel](https://docs.ngstarter.com/components/expansion-panel)
- [Filter Builder](https://docs.ngstarter.com/components/filter-builder)
- [Gauge](https://docs.ngstarter.com/components/gauge)
- [Grid](https://docs.ngstarter.com/components/grid)
- [Guided Tour](https://docs.ngstarter.com/components/guided-tour)
- [Icon](https://docs.ngstarter.com/components/icon)
- [Image Placeholder](https://docs.ngstarter.com/components/image-placeholder)
- [Image Resizer](https://docs.ngstarter.com/components/image-resizer)
- [Image Viewer](https://docs.ngstarter.com/components/image-viewer)
- [Image Zoom Viewer](https://docs.ngstarter.com/components/image-zoom-viewer)
- [Incidents](https://docs.ngstarter.com/components/incidents)
- [Kbd](https://docs.ngstarter.com/components/kbd)
- [Layout](https://docs.ngstarter.com/components/layout)
- [List](https://docs.ngstarter.com/components/list)
- [Marquee](https://docs.ngstarter.com/components/marquee)
- [Menu](https://docs.ngstarter.com/components/menu)
- [Notifications](https://docs.ngstarter.com/components/notifications)
- [Paginator](https://docs.ngstarter.com/components/paginator)
- [Panel](https://docs.ngstarter.com/components/panel)
- [Popover](https://docs.ngstarter.com/components/popover)
- [Progress Bar](https://docs.ngstarter.com/components/progress-bar)
- [Progress Spinner](https://docs.ngstarter.com/components/progress-spinner)
- [Resizable Container](https://docs.ngstarter.com/components/resizable-container)
- [Screen Loader](https://docs.ngstarter.com/components/screen-loader)
- [Sidenav](https://docs.ngstarter.com/components/sidenav)
- [Signature Pad](https://docs.ngstarter.com/components/signature-pad)
- [Skeleton](https://docs.ngstarter.com/components/skeleton)
- [Slider](https://docs.ngstarter.com/components/slider)
- [Snack Bar](https://docs.ngstarter.com/components/snackbar)
- [Split Pane](https://docs.ngstarter.com/components/split-pane)
- [Stepper](https://docs.ngstarter.com/components/stepper)
- [Suggestions](https://docs.ngstarter.com/components/suggestions)
- [Table](https://docs.ngstarter.com/components/table)
- [Tabs](https://docs.ngstarter.com/components/tabs)
- [Text Editor](https://docs.ngstarter.com/components/text-editor)
- [Thumbnail Maker](https://docs.ngstarter.com/components/thumbnail-maker)
- [Tiles](https://docs.ngstarter.com/components/tiles)
- [Timeline](https://docs.ngstarter.com/components/timeline)
- [Timepicker](https://docs.ngstarter.com/components/timepicker)
- [Toolbar](https://docs.ngstarter.com/components/toolbar)
- [Tooltip](https://docs.ngstarter.com/components/tooltip)
- [Tree](https://docs.ngstarter.com/components/tree)
- [Upload](https://docs.ngstarter.com/components/upload)
- [Video Viewer](https://docs.ngstarter.com/components/video-viewer)
