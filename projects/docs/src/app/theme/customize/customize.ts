import { Component, signal } from '@angular/core';
import { CodeHighlighter } from '@ngstarter-ui/components/code-highlighter';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  selector: 'app-customize',
  imports: [
    CodeHighlighter,
    Page,
    PageContentDirective,
    PageTitleDirective,
  ],
  templateUrl: './customize.html',
  styleUrl: './customize.scss'
})
export class Customize {
  importThemes = signal(`@use '@ngstarter-ui/components/styles/themes/default';
@use '@ngstarter-ui/components/styles/themes/enterprise';
@use '@ngstarter-ui/components/styles/themes/modern';
@use './styles/themes/acme';`);

  createTheme = signal(`@use '@ngstarter-ui/components/styles/common';
@use '@ngstarter-ui/components/styles/global';

[data-ngs-theme='acme']:not([data-ngs-color-scheme='dark']):not(.dark) {
  color-scheme: light;

  --ngs-color-primary: #2563eb;
  --ngs-color-on-primary: #ffffff;
  --ngs-color-primary-container: #dbeafe;
  --ngs-color-on-primary-container: #1e3a8a;

  --ngs-color-secondary: #475569;
  --ngs-color-on-secondary: #ffffff;
  --ngs-color-secondary-container: #f1f5f9;
  --ngs-color-on-secondary-container: #0f172a;

  --ngs-color-tertiary: #0f766e;
  --ngs-color-on-tertiary: #ffffff;
  --ngs-color-tertiary-container: #ccfbf1;
  --ngs-color-on-tertiary-container: #134e4a;

  --ngs-color-danger: #dc2626;
  --ngs-color-on-danger: #ffffff;
  --ngs-color-danger-container: #fee2e2;
  --ngs-color-on-danger-container: #7f1d1d;

  --ngs-color-info: #2563eb;
  --ngs-color-on-info: #ffffff;
  --ngs-color-info-container: #dbeafe;
  --ngs-color-on-info-container: #1e3a8a;

  --ngs-color-success: #16a34a;
  --ngs-color-on-success: #ffffff;
  --ngs-color-success-container: #dcfce7;
  --ngs-color-on-success-container: #14532d;

  --ngs-color-warning: #d97706;
  --ngs-color-on-warning: #ffffff;
  --ngs-color-warning-container: #fef3c7;
  --ngs-color-on-warning-container: #78350f;

  --ngs-color-background: #f8fafc;
  --ngs-color-on-background: #0f172a;
  --ngs-color-surface: #ffffff;
  --ngs-color-surface-bright: #ffffff;
  --ngs-color-on-surface: #0f172a;
  --ngs-color-on-surface-variant: #64748b;

  --ngs-color-surface-container-lowest: #ffffff;
  --ngs-color-surface-container-low: #f8fafc;
  --ngs-color-surface-container: #f1f5f9;
  --ngs-color-surface-container-high: #e2e8f0;
  --ngs-color-surface-container-highest: #cbd5e1;
  --ngs-color-outline: #94a3b8;
  --ngs-color-outline-variant: #cbd5e1;
  --ngs-color-border: #e2e8f0;
  --ngs-color-faint: #f1f5f9;
  --ngs-color-subtle: #e2e8f0;
  --ngs-color-muted: #cbd5e1;
  --ngs-color-emphasis: #94a3b8;
  --ngs-color-strong: #475569;

  --ngs-state-hover-bg: color-mix(in srgb, var(--ngs-color-on-surface), transparent 94%);
  --ngs-state-active-bg: color-mix(in srgb, var(--ngs-color-on-surface), transparent 90%);
  --ngs-state-selected-bg: color-mix(in srgb, var(--ngs-color-primary), transparent 88%);
  --ngs-state-focus-ring: color-mix(in srgb, var(--ngs-color-primary), transparent 64%);
}

.dark[data-ngs-theme='acme'],
[data-ngs-theme='acme'][data-ngs-color-scheme='dark'] {
  color-scheme: dark;

  --ngs-color-primary: #60a5fa;
  --ngs-color-on-primary: #0f172a;
  --ngs-color-primary-container: #1d4ed8;
  --ngs-color-on-primary-container: #dbeafe;
  --ngs-color-background: #020617;
  --ngs-color-on-background: #e2e8f0;
  --ngs-color-surface: #0f172a;
  --ngs-color-surface-bright: #1e293b;
  --ngs-color-on-surface: #e2e8f0;
  --ngs-color-on-surface-variant: #94a3b8;
  --ngs-color-surface-container-lowest: #020617;
  --ngs-color-surface-container-low: #0f172a;
  --ngs-color-surface-container: #1e293b;
  --ngs-color-surface-container-high: #334155;
  --ngs-color-surface-container-highest: #475569;
  --ngs-color-border: #334155;
}`);

  provideTheme = signal(`import { provideNgsTheme } from '@ngstarter-ui/components/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideNgsTheme({
      theme: 'acme',
      colorScheme: 'auto',
      radius: 'medium',
    }),
  ],
};`);

  switchTheme = signal(`import { Component, inject } from '@angular/core';
import { ThemeManagerService } from '@ngstarter-ui/components/core';

@Component({ ... })
export class ThemeSwitcher {
  private themeManager = inject(ThemeManagerService);

  useAcmeTheme(): void {
    this.themeManager.setTheme('acme');
  }
}`);
}
