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
- `projects/admin` and `projects/admin-corporate` are admin demo applications.

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
- Public component APIs are exported from `projects/components/<component>/public-api.ts`.
- Secondary entry points have their own `index.ts` and `ng-package.json`.
- Keep imports from public entry points when writing docs or consumer-facing examples:
  `@ngstarter-ui/components/<component>`.
- Use Angular signal APIs such as `input()` where the surrounding component already uses them.
- Keep `ChangeDetectionStrategy.OnPush` for UI components unless there is a specific reason not to.
- Keep styles component-scoped unless a value belongs in shared theme tokens.

## Admin App Construction Rules

When building or changing admin pages in `projects/admin`, agents MUST compose UI from NgStarter
components before writing custom primitives.

Required admin mappings:

- App shell: `Sidenav`, `SidenavContainer`, `SidenavContent` from
  `@ngstarter-ui/components/sidenav`.
- Navigation: `Navigation`, `NavigationItem`, `NavigationItemIconDirective` from
  `@ngstarter-ui/components/navigation`.
- Cards and KPI panels: `Card`, `CardContent`, and `CardFooter` when needed from
  `@ngstarter-ui/components/card`.
- Data tables: `Table`, `ColumnDef`, `HeaderCell`, `HeaderCellDef`, `Cell`, `CellDef`,
  `HeaderRow`, `HeaderRowDef`, `Row`, and `RowDef` from `@ngstarter-ui/components/table`.
- Search and text fields: `FormField`, `Label`, prefix/suffix directives, and `Input`.
- Pagination: `Paginator`.
- Actions: `Button` and `Icon`.
- Selection: `Checkbox`.
- Progress and completion: `ProgressBar`.
- Startup splash: `SplashScreen` only once near the root app template for initial branded bootstrap
  loading; do not use it as a general page, route, form, table, or operation loader.

Agents MUST NOT hand-roll these primitives with plain `div`, `table`, `button`, or `input` unless
no matching NgStarter component exists. CSS may tune layout, spacing, and visual fidelity, but it
must not replace NgStarter component structure.

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

Styling rules for admin UIs:

- Build page layout, responsive behavior, sizing, spacing, flex, grid, and alignment with
  TailwindCSS utility classes in templates.
- Start local component SCSS files that use Tailwind tokens with `@reference 'tailwindcss';`.
- In local SCSS, express spacing values with the Tailwind function `--spacing(N)`.
- Locally override NgStarter components through component or directive selectors such as
  `ngs-card`, `ngs-navigation`, `ngs-form-field`, `table[ngs-table]`, `button[ngsButton]`, and
  `button[ngsIconButton]`.
- Do not restyle NgStarter components through wrapper-only classes such as `.stat-card`,
  `.tasks-panel`, or `.admin-navigation` when a component selector or component token fits.
- Global visual customization should use CSS custom properties and theme tokens, especially
  `--ngs-*` variables.

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

If the verifier fails, refactor to NgStarter components before reporting completion.

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
<button ngsButton="filled">Save</button>
<button ngsIconButton aria-label="Settings">...</button>
```

For app setup:

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

## Safety Rules

- Do not edit generated files under `dist/`.
- Do not collapse secondary entry points into the root package entry point.
- Do not use private implementation imports in consumer examples.
- Do not remove peer dependencies from `projects/components/package.json` without checking package
  compatibility.
- Keep changes scoped to the component or shared primitive being modified.
