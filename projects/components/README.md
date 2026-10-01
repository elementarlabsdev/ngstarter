# NgStarter UI

NgStarter UI components and admin templates are free and open source under the [MIT License](LICENSE.md).
Use, modify, and distribute them in your projects while retaining the copyright and permission notice.

NgStarter UI is an Angular component kit for admin panels and product dashboards. The
component package is published as `@ngstarter-ui/components` and is organized around
secondary entry points such as `@ngstarter-ui/components/button`,
`@ngstarter-ui/components/dialog`, and `@ngstarter-ui/components/table`.

## Installation

The current package targets Angular 22 and Angular CDK 22. Use SCSS for the application's
global styles.

For a new Angular 22 project, create the app with SCSS and add NgStarter UI:

```bash
npx @angular/cli@22 new project-name --style=scss
cd project-name
npx ng add @ngstarter-ui/components
```

For an existing Angular 22 app, run the same schematic from your project root:

```bash
npx ng add @ngstarter-ui/components
```

The `ng add` schematic installs the required dependencies, configures Tailwind CSS 4 and
PostCSS, imports the Default theme, adds `provideNgsTheme` to the application config, and
adds the DM Sans font to the application HTML. In a workspace with multiple applications,
select the target with `--project=your-app`.

The schematic also adds NgStarter guidance to `AGENTS.md` and installs a local Codex skill at
`.codex/skills/ngstarter-ui` by default. To skip the local skill installation while keeping
the `AGENTS.md` guidance, run:

```bash
npx ng add @ngstarter-ui/components --codex-skill=false
```

If NgStarter UI is already installed and you only want to add or refresh the Codex skill, run:

```bash
npx ng generate @ngstarter-ui/components:codex-skill
```

### Basic Usage

NgStarter components are standalone Angular components. Import each component from its
public secondary entry point and include it in the component's `imports`:

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [Button],
  template: `<button ngsButton="filled">Save</button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Example {}
```

Other entry points follow the same pattern, such as `@ngstarter-ui/components/dialog`,
`@ngstarter-ui/components/form-field`, and `@ngstarter-ui/components/input`.

## Theming

NgStarter ships Default and Chalk themes, each with light and dark colors. Import the Default
theme once in the application's global `styles.scss`:

```scss
@use '@ngstarter-ui/components/styles/themes/default';
```

If the application uses Chalk or lets users switch to it at runtime, also import:

```scss
@use '@ngstarter-ui/components/styles/themes/chalk';
```

The theme includes Tailwind CSS and shared base styles; an additional Tailwind import or a
duplicate CSS reset is not needed.

Themes use fixed light and dark color tokens. Their main layers are:

- primitive tokens: spacing, radius, font sizes, shadows
- semantic tokens: `--ngs-color-primary`, `--ngs-color-surface`, `--ngs-color-danger`
- component tokens: `--ngs-button-height`, `--ngs-field-radius`, `--ngs-table-row-height`

Configure the theme and color scheme at runtime:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideNgsTheme } from '@ngstarter-ui/components/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideNgsTheme({
      theme: 'default',
      colorScheme: 'auto',
    }),
  ],
};
```

`theme` accepts `'default'` or `'chalk'`. `colorScheme` accepts `'light'`, `'dark'`, or
`'auto'`; auto follows the operating system preference. These options default to `'default'`
and `'auto'`, respectively.

`colorPreset` is optional and currently supports only `'default'`. The theme manager always
uses that value, so it can be omitted. Customize colors and geometry through CSS tokens.

Preferences are stored in localStorage under `ngs-admin` by default. Set `persist: false` to
disable persistence or use `storageKey` to choose another key. Stored preferences take
precedence over the initial theme and color scheme when persistence is enabled.

Use `ThemeManagerService` to change preferences from a component:

```ts
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { ThemeManagerService } from '@ngstarter-ui/components/core';

@Component({
  selector: 'app-theme-preferences',
  standalone: true,
  imports: [Button],
  template: `
    <button ngsButton (click)="themeManager.setTheme('chalk')">Chalk</button>
    <button ngsButton (click)="themeManager.setColorScheme('auto')">System theme</button>
    <button ngsButton (click)="themeManager.setColorScheme('dark')">Dark mode</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemePreferences {
  readonly themeManager = inject(ThemeManagerService);
}
```

The service synchronizes document attributes and the `dark` class. Without the runtime
service, the imported stylesheets can also be controlled with document attributes:

```html
<html data-ngs-theme="chalk" data-ngs-color-scheme="dark">
```

## Component Demos

The documentation site includes live demos and API examples for each component:

- [Documentation](https://docs.ngstarter.com)
- [Installation](https://docs.ngstarter.com/installation)
- [Theming](https://docs.ngstarter.com/theme)
- [AI component registry](https://docs.ngstarter.com/ai/component-registry.json)

The package also includes the registry at
`node_modules/@ngstarter-ui/components/ai/component-registry.json` for local component
discovery and AI-assisted development.

### Forms

- [Autocomplete](https://docs.ngstarter.com/forms/autocomplete)
- [Button](https://docs.ngstarter.com/forms/buttons)
- [Button Toggle](https://docs.ngstarter.com/forms/button-toggle)
- [Checkbox](https://docs.ngstarter.com/forms/checkbox)
- [Country Select](https://docs.ngstarter.com/forms/country)
- [Currency Select](https://docs.ngstarter.com/forms/currency-select)
- [Date Format Select](https://docs.ngstarter.com/forms/date-format-select)
- [Filter Select](https://docs.ngstarter.com/forms/filter-select)
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
- [Form Builder](https://docs.ngstarter.com/libraries/form-builder)
- [Headless Editor](https://docs.ngstarter.com/libraries/headless-editor)
- [Image Designer](https://docs.ngstarter.com/libraries/image-designer)
- [Kanban Board](https://docs.ngstarter.com/libraries/kanban-board)
- [Micro Charts](https://docs.ngstarter.com/micro-charts)
- [Bar Chart](https://docs.ngstarter.com/micro-charts/bar-chart)
- [Line Chart](https://docs.ngstarter.com/micro-charts/line-chart)
- [Pie Chart](https://docs.ngstarter.com/micro-charts/pie-chart)
- [PDF Builder](https://docs.ngstarter.com/libraries/pdf-builder)
- [PDF Signer](https://docs.ngstarter.com/libraries/pdf-signer)
- [PDF Viewer](https://docs.ngstarter.com/libraries/pdf-viewer)
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
- [Calendar](https://docs.ngstarter.com/components/calendar)
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
- [Cookie Popup](https://docs.ngstarter.com/components/cookie-popup)
- [Crop](https://docs.ngstarter.com/components/crop)
- [Datepicker](https://docs.ngstarter.com/components/datepicker)
- [Digit Roller](https://docs.ngstarter.com/components/digit-roller)
- [Dialog](https://docs.ngstarter.com/components/dialog)
- [Divider](https://docs.ngstarter.com/components/divider)
- [Drawer](https://docs.ngstarter.com/components/drawer)
- [Emoji Picker](https://docs.ngstarter.com/components/emoji-picker)
- [Empty State](https://docs.ngstarter.com/components/empty-state)
- [Events](https://docs.ngstarter.com/components/events)
- [Expand](https://docs.ngstarter.com/components/expand)
- [Expansion Panel](https://docs.ngstarter.com/components/expansion-panel)
- [File Type](https://docs.ngstarter.com/components/file-type)
- [Filter Builder](https://docs.ngstarter.com/components/filter-builder)
- [Gauge](https://docs.ngstarter.com/components/gauge)
- [Grid](https://docs.ngstarter.com/components/grid)
- [Guided Tour](https://docs.ngstarter.com/components/guided-tour)
- [Headless Stepper](https://docs.ngstarter.com/components/headless-stepper)
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
- [Sort](https://docs.ngstarter.com/components/sort)
- [Split Pane](https://docs.ngstarter.com/components/split-pane)
- [Step Tracker](https://docs.ngstarter.com/components/step-tracker)
- [Stepper](https://docs.ngstarter.com/components/stepper)
- [Suggestions](https://docs.ngstarter.com/components/suggestions)
- [Table](https://docs.ngstarter.com/components/table)
- [Tabs](https://docs.ngstarter.com/components/tabs)
- [Thumbnail Maker](https://docs.ngstarter.com/components/thumbnail-maker)
- [Tiles](https://docs.ngstarter.com/components/tiles)
- [Timeline](https://docs.ngstarter.com/components/timeline)
- [Timepicker](https://docs.ngstarter.com/components/timepicker)
- [Toolbar](https://docs.ngstarter.com/components/toolbar)
- [Tooltip](https://docs.ngstarter.com/components/tooltip)
- [Tree](https://docs.ngstarter.com/components/tree)
- [Typed Signature Pad](https://docs.ngstarter.com/components/typed-signature-pad)
- [Upload](https://docs.ngstarter.com/components/upload)
- [Video Viewer](https://docs.ngstarter.com/components/video-viewer)

## Repository Development

Clone the repository and install its dependencies to run the docs locally:

```bash
git clone https://github.com/elementarlabsdev/ngstarter.git
cd ngstarter
npm ci
npm run start:docs
```

The workspace contains:

| Directory | Purpose |
| --- | --- |
| `projects/components` | Publishable library, secondary entry points, themes, and schematics |
| `projects/docs` | Documentation application and live component examples |
| `projects/admin` | Admin demo application |
| `projects/admin-modern` | Modern admin application |
| `projects/admin-corporate` | Corporate admin application |
| `projects/admin-classic` | Placeholder for a future admin application |

Use the relevant command for the part of the workspace you are changing:

| Command | Purpose |
| --- | --- |
| `npm run build:components:prod` | Build the library, AI metadata, and schematics |
| `npm run verify:components:package` | Validate the generated package after building it |
| `npm run build:docs:prod` | Build the documentation application |
| `npm run start:admin:modern` | Run the Modern admin application |
| `npm run start:admin:corporate` | Run the Corporate admin application |
| `npm run verify:admin:components` | Check admin composition against NgStarter conventions |
| `npm run test:components` | Run library unit tests |
| `npm run test:docs` | Run documentation application tests |
| `npm run test` | Run all configured unit test targets |
| `npm run generate:ai` | Regenerate the AI component registry and usage guidance |

Follow `AGENTS.md` for component structure, public imports, admin composition, and validation.
Keep changes in source files; do not edit generated files under `dist/`.
