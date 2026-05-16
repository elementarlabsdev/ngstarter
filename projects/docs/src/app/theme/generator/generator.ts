import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from '@ngstarter-ui/components/button';
import {
  ColorPicker,
  ColorPickerThumbnail,
  ColorPickerTriggerForDirective,
} from '@ngstarter-ui/components/color-picker';
import { CodeHighlighter } from '@ngstarter-ui/components/code-highlighter';
import { FormField, Label, Suffix } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import { Card, CardContent } from '@ngstarter-ui/components/card';
import { generateNgsThemeProperties, ThemeManagerService } from '@ngstarter-ui/components/core';
import { Page } from '@meta/page/page';
import { PageContentDirective } from '@meta/page/page-content.directive';
import { PageTitleDirective } from '@meta/page/page-title.directive';

@Component({
  selector: 'app-theme-generator',
  imports: [
    FormsModule,
    Button,
    ColorPicker,
    ColorPickerThumbnail,
    ColorPickerTriggerForDirective,
    CodeHighlighter,
    FormField,
    Label,
    Suffix,
    Input,
    Card,
    CardContent,
    Page,
    PageContentDirective,
    PageTitleDirective,
  ],
  templateUrl: './generator.html',
  styleUrl: './generator.scss',
})
export class ThemeGenerator {
  private readonly themeManager = inject(ThemeManagerService);

  seedColor = signal(this.themeManager.primaryColor() ?? '#036fe3');

  presets = [
    '#036fe3',
    '#155eef',
    '#2563eb',
    '#7c3aed',
    '#9333ea',
    '#c026d3',
    '#0f766e',
    '#059669',
    '#16a34a',
    '#db2777',
    '#e11d48',
    '#ea580c',
    '#d97706',
    '#ca8a04',
    '#0891b2',
    '#475569',
  ];

  readonly cssSeed = computed(() => `:root,
[data-ngs-theme='default'] {
  --ngs-color-primary-seed: ${this.seedColor()};
}`);

  readonly runtimeTheme = computed(() => `import { provideNgsTheme } from '@ngstarter-ui/components/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideNgsTheme({
      theme: 'default',
      colorScheme: 'auto',
      primaryColor: '${this.seedColor()}',
    }),
  ],
};`);

  readonly typescriptGenerator = computed(() => `import { generateNgsThemeCssText } from '@ngstarter-ui/components/core';

const lightCss = generateNgsThemeCssText('${this.seedColor()}', 'light');
const darkCss = generateNgsThemeCssText('${this.seedColor()}', 'dark');`);

  readonly lightRoles = computed(() => this.themeRoles('light'));
  readonly darkRoles = computed(() => this.themeRoles('dark'));

  setSeedColor(color: string): void {
    const nextColor = color.trim();

    this.seedColor.set(nextColor);

    if (this.isSeedColor(nextColor)) {
      this.themeManager.setPrimaryColor(nextColor);
    }
  }

  private themeRoles(colorScheme: 'light' | 'dark') {
    const properties = generateNgsThemeProperties(this.seedColor(), colorScheme);

    return [
      '--ngs-color-primary',
      '--ngs-color-primary-container',
      '--ngs-color-secondary',
      '--ngs-color-secondary-container',
      '--ngs-color-tertiary',
      '--ngs-color-tertiary-container',
      '--ngs-color-info',
      '--ngs-color-info-container',
      '--ngs-color-surface',
      '--ngs-color-surface-container',
      '--ngs-color-border',
      '--ngs-color-outline',
      '--ngs-color-outline-variant',
      '--ngs-state-selected-bg',
    ].map(name => ({
      name,
      value: properties[name as keyof typeof properties] ?? '',
    }));
  }

  private isSeedColor(color: string): boolean {
    return /^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(color);
  }
}
