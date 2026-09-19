export type NgsThemeColorScheme = 'light' | 'dark';
export type NgsThemeColorPreset = 'default';

export type NgsThemeCssProperties = Record<`--ngs-${string}`, string>;

export interface NgsThemeColorPresetDefinition {
  id: NgsThemeColorPreset;
  label: string;
  swatch: string;
  light: NgsThemeCssProperties;
  dark: NgsThemeCssProperties;
}

interface PresetScheme {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  info: string;
  onInfo: string;
  infoContainer: string;
  onInfoContainer: string;
  focusRing: string;
  primaryScale: readonly [string, string, string, string, string, string];
  secondaryScale: readonly [string, string, string, string];
  tertiaryScale: readonly [string, string, string, string, string];
}

function presetProperties(scheme: PresetScheme): NgsThemeCssProperties {
  return {
    '--ngs-color-primary-seed': scheme.primary,
    '--ngs-color-primary': scheme.primary,
    '--ngs-color-on-primary': scheme.onPrimary,
    '--ngs-color-primary-container': scheme.primaryContainer,
    '--ngs-color-on-primary-container': scheme.onPrimaryContainer,
    '--ngs-color-secondary': scheme.secondary,
    '--ngs-color-on-secondary': scheme.onSecondary,
    '--ngs-color-secondary-container': scheme.secondaryContainer,
    '--ngs-color-on-secondary-container': scheme.onSecondaryContainer,
    '--ngs-color-tertiary': scheme.tertiary,
    '--ngs-color-on-tertiary': scheme.onTertiary,
    '--ngs-color-tertiary-container': scheme.tertiaryContainer,
    '--ngs-color-on-tertiary-container': scheme.onTertiaryContainer,
    '--ngs-color-info': scheme.info,
    '--ngs-color-on-info': scheme.onInfo,
    '--ngs-color-info-container': scheme.infoContainer,
    '--ngs-color-on-info-container': scheme.onInfoContainer,
    '--ngs-state-selected-bg': 'var(--ngs-color-surface-container-highest)',
    '--ngs-state-selected-color': 'var(--ngs-color-on-surface)',
    '--ngs-state-focus-ring': scheme.focusRing,
    '--ngs-color-primary-100': scheme.primaryScale[0],
    '--ngs-color-primary-200': scheme.primaryScale[1],
    '--ngs-color-primary-300': scheme.primaryScale[2],
    '--ngs-color-primary-400': scheme.primaryScale[3],
    '--ngs-color-primary-500': scheme.primaryScale[4],
    '--ngs-color-primary-600': scheme.primaryScale[5],
    '--ngs-color-secondary-100': scheme.secondaryScale[0],
    '--ngs-color-secondary-200': scheme.secondaryScale[1],
    '--ngs-color-secondary-300': scheme.secondaryScale[2],
    '--ngs-color-secondary-400': scheme.secondaryScale[3],
    '--ngs-color-secondary-fixed': scheme.secondaryContainer,
    '--ngs-color-on-secondary-fixed': scheme.onSecondaryContainer,
    '--ngs-color-tertiary-100': scheme.tertiaryScale[0],
    '--ngs-color-tertiary-200': scheme.tertiaryScale[1],
    '--ngs-color-tertiary-300': scheme.tertiaryScale[2],
    '--ngs-color-tertiary-700': scheme.tertiaryScale[3],
    '--ngs-color-tertiary-800': scheme.tertiaryScale[4],
    '--ngs-button-tonal-bg': scheme.secondaryContainer,
    '--ngs-button-tonal-color': scheme.onSecondaryContainer,
    '--ngs-button-outlined-border': scheme.secondaryScale[2],
    '--ngs-field-border-focus-color': scheme.primary,
    '--ngs-dropdown-item-selected-bg': 'var(--ngs-color-surface-container-highest)',
    '--ngs-dropdown-item-selected-color': 'var(--ngs-color-on-surface)',
    '--ngs-nav-item-active-color': 'var(--ngs-color-on-surface)',
    '--ngs-nav-item-active-bg': 'var(--ngs-color-surface-container-highest)',
    '--ngs-nav-item-active-icon-color': scheme.primary,
  };
}

const defaultPreset: NgsThemeColorPresetDefinition = {
  id: 'default',
  label: 'Default',
  swatch: '#245bff',
  light: presetProperties({
    primary: '#245bff', onPrimary: '#ffffff', primaryContainer: '#e9efff', onPrimaryContainer: '#173a9f',
    secondary: '#60718e', onSecondary: '#ffffff', secondaryContainer: '#f0f3f7', onSecondaryContainer: '#29364e',
    tertiary: '#29364e', onTertiary: '#ffffff', tertiaryContainer: '#edf2ff', onTertiaryContainer: '#173a9f',
    info: '#245bff', onInfo: '#ffffff', infoContainer: '#e9efff', onInfoContainer: '#173a9f', focusRing: '#8caaff',
    primaryScale: ['#f2f5ff', '#e9efff', '#dce6ff', '#bfd0ff', '#8caaff', '#245bff'],
    secondaryScale: ['#fbfcfe', '#f7f9fc', '#f0f3f7', '#dce2eb'],
    tertiaryScale: ['#f7f9fc', '#f3f5f7', '#edf2ff', '#29364e', '#1a2942'],
  }),
  dark: presetProperties({
    primary: '#8caaff', onPrimary: '#08142c', primaryContainer: '#173a9f', onPrimaryContainer: '#e9efff',
    secondary: '#b9c4d3', onSecondary: '#0b1427', secondaryContainer: '#29364e', onSecondaryContainer: '#f0f3f7',
    tertiary: '#aab7c9', onTertiary: '#0b1427', tertiaryContainer: '#29364e', onTertiaryContainer: '#f7f9fc',
    info: '#8caaff', onInfo: '#08142c', infoContainer: '#173a9f', onInfoContainer: '#e9efff', focusRing: '#8caaff',
    primaryScale: ['#111d35', '#17284f', '#173a9f', '#245bff', '#5680ff', '#8caaff'],
    secondaryScale: ['#172033', '#202b40', '#29364e', '#455571'],
    tertiaryScale: ['#172033', '#202b40', '#29364e', '#b9c4d3', '#dce2eb'],
  }),
};

export const NGS_THEME_COLOR_PRESETS: readonly NgsThemeColorPresetDefinition[] = [defaultPreset];
export const NGS_THEME_COLOR_PRESET_IDS: readonly NgsThemeColorPreset[] = ['default'];
export const NGS_THEME_PRESET_PROPERTY_NAMES = Object.keys(
  defaultPreset.light,
) as Array<keyof NgsThemeCssProperties>;

export function getNgsThemePreset(
  _preset: NgsThemeColorPreset = 'default',
): NgsThemeColorPresetDefinition {
  return defaultPreset;
}

export function getNgsThemePresetProperties(
  preset: NgsThemeColorPreset = 'default',
  colorScheme: NgsThemeColorScheme = 'light',
): NgsThemeCssProperties {
  return { ...getNgsThemePreset(preset)[colorScheme] };
}

export function getNgsThemePresetCssText(
  preset: NgsThemeColorPreset = 'default',
  colorScheme: NgsThemeColorScheme = 'light',
): string {
  return Object.entries(getNgsThemePresetProperties(preset, colorScheme))
    .map(([name, value]) => `${name}: ${value};`)
    .join('\n');
}
