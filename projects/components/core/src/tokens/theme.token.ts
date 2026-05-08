import { InjectionToken, Provider } from '@angular/core';

export type NgsThemeName = 'default' | 'enterprise' | 'modern' | string;
export type NgsColorScheme = 'light' | 'dark' | 'auto';
export type NgsDensity = 'compact' | 'comfortable' | 'spacious';
export type NgsRadius = 'none' | 'small' | 'medium' | 'large';

export interface NgsThemeOptions {
  theme?: NgsThemeName;
  colorScheme?: NgsColorScheme;
  density?: NgsDensity;
  radius?: NgsRadius;
  primaryColor?: string;
  persist?: boolean;
  storageKey?: string;
}

export const NGS_THEME_OPTIONS = new InjectionToken<NgsThemeOptions>('NGS_THEME_OPTIONS', {
  factory: () => ({
    theme: 'default',
    colorScheme: 'auto',
    density: 'comfortable',
    radius: 'medium',
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
      density: 'comfortable',
      radius: 'medium',
      persist: true,
      storageKey: 'ngs-admin',
      ...options,
    },
  };
}
