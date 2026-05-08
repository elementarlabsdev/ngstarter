# NgStarter UI

NgStarter UI is an Angular component kit for admin panels and product dashboards. The
component package is published as `@ngstarter-ui/components` and is organized around
secondary entry points such as `@ngstarter-ui/components/button`,
`@ngstarter-ui/components/dialog`, and `@ngstarter-ui/components/table`.

## Theming

Import one theme stylesheet once in your app styles:

```scss
@use '@ngstarter-ui/components/styles/themes/default';
```

Other presets are available for faster admin styling:

```scss
@use '@ngstarter-ui/components/styles/themes/enterprise';
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
      theme: 'enterprise',
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
<html data-ngs-theme="enterprise" data-ngs-density="compact" data-ngs-radius="small">
```
