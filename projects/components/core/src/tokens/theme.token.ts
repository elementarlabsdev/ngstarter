import { InjectionToken, Provider } from '@angular/core';
import type { NgsThemeColorPreset } from '../theming/theme-presets';

export type NgsThemeName = 'default' | 'chalk';
export type NgsColorScheme = 'light' | 'dark' | 'auto';

export interface NgsThemeOptions {
  theme?: NgsThemeName;
  colorScheme?: NgsColorScheme;
  colorPreset?: NgsThemeColorPreset;
  persist?: boolean;
  storageKey?: string;
}

export const NGS_THEME_OPTIONS = new InjectionToken<NgsThemeOptions>('NGS_THEME_OPTIONS', {
  factory: () => ({
    theme: 'default',
    colorScheme: 'auto',
    colorPreset: 'default',
    persist: true,
    storageKey: 'ngs-admin',
  }),
});

export function provideNgsTheme(options: NgsThemeOptions = {}): Provider {
  return {
    provide: NGS_THEME_OPTIONS,
    useValue: {
      theme: 'default',
      colorScheme: 'auto',
      colorPreset: 'default',
      persist: true,
      storageKey: 'ngs-admin',
      ...options,
    },
  };
}
