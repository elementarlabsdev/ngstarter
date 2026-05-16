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

- [Documentation](https://ngstarter.com)
- [Installation](https://ngstarter.com/installation)
- [AI component registry](https://ngstarter.com/ai/component-registry.json)

### Forms

- [Autocomplete](https://ngstarter.com/forms/autocomplete)
- [Button](https://ngstarter.com/forms/buttons)
- [Button Toggle](https://ngstarter.com/forms/button-toggle)
- [Checkbox](https://ngstarter.com/forms/checkbox)
- [Country Select](https://ngstarter.com/forms/country)
- [Currency Select](https://ngstarter.com/forms/currency-select)
- [Date Format Select](https://ngstarter.com/forms/date-format-select)
- [Form Renderer](https://ngstarter.com/forms/form-renderer)
- [Inline Text Edit](https://ngstarter.com/forms/inline-text-edit)
- [Input](https://ngstarter.com/forms/input)
- [Input Mask](https://ngstarter.com/forms/input-mask)
- [Input Validator](https://ngstarter.com/forms/input-validator)
- [Number Input](https://ngstarter.com/forms/number-input)
- [Password Strength](https://ngstarter.com/forms/password-strength)
- [Phone Input](https://ngstarter.com/forms/phone-input)
- [Pin Input](https://ngstarter.com/forms/pin-input)
- [Radio](https://ngstarter.com/forms/radio)
- [Segmented](https://ngstarter.com/forms/segmented)
- [Select](https://ngstarter.com/forms/select)
- [Slide Toggle](https://ngstarter.com/forms/slide-toggle)
- [Timezone Select](https://ngstarter.com/forms/timezone)

### Navigation

- [Breadcrumbs](https://ngstarter.com/navigation/breadcrumbs)
- [Navigation](https://ngstarter.com/navigation/navigation)
- [Rail Navigation](https://ngstarter.com/navigation/rail-nav)
- [Sidebar](https://ngstarter.com/navigation/sidebar)
- [Side Panel](https://ngstarter.com/navigation/side-panel)
- [Tab Panel](https://ngstarter.com/navigation/tab-panel)

### Data, Layout, And Libraries

- [Content Editor](https://ngstarter.com/libraries/content-editor)
- [Data View](https://ngstarter.com/libraries/data-view)
- [Image Designer](https://ngstarter.com/libraries/image-designer)
- [Kanban Board](https://ngstarter.com/libraries/kanban-board)
- [Micro Charts](https://ngstarter.com/micro-charts)
- [Video Player](https://ngstarter.com/libraries/video-player)
- [Visual Builder](https://ngstarter.com/libraries/visual-builder)

### Components

- [Action Required](https://ngstarter.com/components/action-required)
- [Alert](https://ngstarter.com/components/alert)
- [Announcement](https://ngstarter.com/components/announcement)
- [Avatar](https://ngstarter.com/components/avatar)
- [Badge](https://ngstarter.com/components/badge)
- [Block Loader](https://ngstarter.com/components/block-loader)
- [Bottom Sheet](https://ngstarter.com/components/bottom-sheet)
- [Card](https://ngstarter.com/components/card)
- [Card Overlay](https://ngstarter.com/components/card-overlay)
- [Carousel](https://ngstarter.com/components/carousel)
- [Chips](https://ngstarter.com/components/chips)
- [Code Highlighter](https://ngstarter.com/components/code-highlighter)
- [Color Picker](https://ngstarter.com/components/color-picker)
- [Color Switcher](https://ngstarter.com/components/color-switcher)
- [Command Bar](https://ngstarter.com/components/command-bar)
- [Comment Editor](https://ngstarter.com/components/comment-editor)
- [Comparison Slider](https://ngstarter.com/components/comparison-slider)
- [Confirm](https://ngstarter.com/components/confirm)
- [Content Fade](https://ngstarter.com/components/content-fade)
- [Cookie Popup](https://ngstarter.com/components/cookie-popup)
- [Crop](https://ngstarter.com/components/crop)
- [Datepicker](https://ngstarter.com/components/datepicker)
- [Dialog](https://ngstarter.com/components/dialog)
- [Divider](https://ngstarter.com/components/divider)
- [Drawer](https://ngstarter.com/components/drawer)
- [Emoji Picker](https://ngstarter.com/components/emoji-picker)
- [Empty State](https://ngstarter.com/components/empty-state)
- [Expand](https://ngstarter.com/components/expand)
- [Expansion Panel](https://ngstarter.com/components/expansion-panel)
- [Filter Builder](https://ngstarter.com/components/filter-builder)
- [Gauge](https://ngstarter.com/components/gauge)
- [Grid](https://ngstarter.com/components/grid)
- [Guided Tour](https://ngstarter.com/components/guided-tour)
- [Icon](https://ngstarter.com/components/icon)
- [Image Placeholder](https://ngstarter.com/components/image-placeholder)
- [Image Resizer](https://ngstarter.com/components/image-resizer)
- [Image Viewer](https://ngstarter.com/components/image-viewer)
- [Image Zoom Viewer](https://ngstarter.com/components/image-zoom-viewer)
- [Incidents](https://ngstarter.com/components/incidents)
- [Kbd](https://ngstarter.com/components/kbd)
- [Layout](https://ngstarter.com/components/layout)
- [List](https://ngstarter.com/components/list)
- [Marquee](https://ngstarter.com/components/marquee)
- [Menu](https://ngstarter.com/components/menu)
- [Notifications](https://ngstarter.com/components/notifications)
- [Paginator](https://ngstarter.com/components/paginator)
- [Panel](https://ngstarter.com/components/panel)
- [Popover](https://ngstarter.com/components/popover)
- [Progress Bar](https://ngstarter.com/components/progress-bar)
- [Progress Spinner](https://ngstarter.com/components/progress-spinner)
- [Resizable Container](https://ngstarter.com/components/resizable-container)
- [Screen Loader](https://ngstarter.com/components/screen-loader)
- [Sidenav](https://ngstarter.com/components/sidenav)
- [Signature Pad](https://ngstarter.com/components/signature-pad)
- [Skeleton](https://ngstarter.com/components/skeleton)
- [Slider](https://ngstarter.com/components/slider)
- [Snack Bar](https://ngstarter.com/components/snackbar)
- [Split Pane](https://ngstarter.com/components/split-pane)
- [Stepper](https://ngstarter.com/components/stepper)
- [Suggestions](https://ngstarter.com/components/suggestions)
- [Table](https://ngstarter.com/components/table)
- [Tabs](https://ngstarter.com/components/tabs)
- [Text Editor](https://ngstarter.com/components/text-editor)
- [Thumbnail Maker](https://ngstarter.com/components/thumbnail-maker)
- [Tiles](https://ngstarter.com/components/tiles)
- [Timeline](https://ngstarter.com/components/timeline)
- [Timepicker](https://ngstarter.com/components/timepicker)
- [Toolbar](https://ngstarter.com/components/toolbar)
- [Tooltip](https://ngstarter.com/components/tooltip)
- [Tree](https://ngstarter.com/components/tree)
- [Upload](https://ngstarter.com/components/upload)
- [Video Viewer](https://ngstarter.com/components/video-viewer)
