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
7. When editing `projects/admin`, run `npm run verify:admin:components` before finishing.

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
- Admin app shells, navigation, cards, tables, form fields, pagination, buttons, icons,
  checkboxes, and progress bars must use NgStarter components.
- Do not hand-roll admin tables with `role="table"` or layout `div`s when `ngs-table` applies.
- Do not hand-roll admin search fields with plain `input`; use `ngs-form-field` and `ngsInput`.
- Use one `ngs-form-field` per form control. For groups of fields, use TailwindCSS grid/flex/layout
  classes around multiple form fields, with each individual field wrapped in its own
  `ngs-form-field`.
- Do not use `ngs-form-field` as a generic layout container, card, spacing wrapper, or wrapper for
  non-form UI. Do not wrap checkbox, radio, button, or toggle controls when they already have their
  own label pattern.
- Use TailwindCSS utility classes in templates for layout, responsive behavior, sizing, spacing,
  flex, grid, and alignment.
- Start local SCSS files that use Tailwind tokens with `@reference 'tailwindcss';`.
- In local SCSS, write spacing values with `--spacing(N)`.
- Override NgStarter components locally through selectors such as `ngs-card`, `ngs-navigation`,
  `ngs-form-field`, `table[ngs-table]`, `button[ngsButton]`, and `button[ngsIconButton]`.
- Do not restyle NgStarter components through wrapper-only classes when a component selector or
  `--ngs-*` component token fits.
- Use global CSS variables and theme tokens for global visual customization.
- Keep normal admin text calm: body, table, navigation, form, metadata, and helper text should use
  `400` by default; buttons can use `500` or `600`; reserve `700+` for brand, hero headings,
  primary KPI numbers, or deliberate emphasis.
- Do not import from private `src` paths in consumer code.
- Do not collapse secondary entry points into the root package entry point.
- Use existing `--ngs-*` tokens before adding new CSS custom properties.
- When editing the library, follow nearby component structure and run the narrowest relevant build.
