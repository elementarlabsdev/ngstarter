export type NgsGeneratedThemeColorScheme = 'light' | 'dark';

export type NgsThemeCssProperties = Record<`--ngs-${string}`, string>;

interface Rgb {
  r: number;
  g: number;
  b: number;
}

interface Hsl {
  h: number;
  s: number;
  l: number;
}

export const NGS_GENERATED_THEME_PROPERTY_NAMES = [
  '--ngs-color-primary-seed',
  '--ngs-color-primary',
  '--ngs-color-on-primary',
  '--ngs-color-primary-container',
  '--ngs-color-on-primary-container',
  '--ngs-color-secondary',
  '--ngs-color-on-secondary',
  '--ngs-color-secondary-container',
  '--ngs-color-on-secondary-container',
  '--ngs-color-tertiary',
  '--ngs-color-on-tertiary',
  '--ngs-color-tertiary-container',
  '--ngs-color-on-tertiary-container',
  '--ngs-color-info',
  '--ngs-color-on-info',
  '--ngs-color-info-container',
  '--ngs-color-on-info-container',
  '--ngs-color-danger',
  '--ngs-color-on-danger',
  '--ngs-color-danger-container',
  '--ngs-color-on-danger-container',
  '--ngs-color-danger-container-lowest',
  '--ngs-color-danger-container-low',
  '--ngs-color-danger-container-high',
  '--ngs-color-danger-container-highest',
  '--ngs-color-success',
  '--ngs-color-on-success',
  '--ngs-color-success-container',
  '--ngs-color-on-success-container',
  '--ngs-color-warning',
  '--ngs-color-on-warning',
  '--ngs-color-warning-container',
  '--ngs-color-on-warning-container',
  '--ngs-color-orange-container',
  '--ngs-color-on-orange-container',
  '--ngs-color-green-500',
  '--ngs-color-background',
  '--ngs-color-on-background',
  '--ngs-color-surface',
  '--ngs-color-surface-bright',
  '--ngs-color-on-surface',
  '--ngs-color-on-surface-variant',
  '--ngs-color-neutral-50',
  '--ngs-color-neutral-100',
  '--ngs-color-neutral-200',
  '--ngs-color-neutral-300',
  '--ngs-color-neutral-400',
  '--ngs-color-neutral-500',
  '--ngs-color-neutral-600',
  '--ngs-color-neutral-650',
  '--ngs-color-neutral-700',
  '--ngs-color-neutral-800',
  '--ngs-color-neutral-900',
  '--ngs-color-neutral-950',
  '--ngs-color-surface-container-lowest',
  '--ngs-color-surface-container-low',
  '--ngs-color-surface-container',
  '--ngs-color-surface-container-high',
  '--ngs-color-surface-container-highest',
  '--ngs-color-outline',
  '--ngs-color-outline-variant',
  '--ngs-color-border',
  '--ngs-color-faint',
  '--ngs-color-subtle',
  '--ngs-color-muted',
  '--ngs-color-emphasis',
  '--ngs-color-strong',
  '--ngs-state-hover-bg',
  '--ngs-state-active-bg',
  '--ngs-state-selected-bg',
  '--ngs-state-selected-color',
  '--ngs-state-focus-ring',
  '--ngs-state-disabled-bg',
  '--ngs-state-disabled-color',
  '--ngs-state-disabled-border',
  '--ngs-color-primary-100',
  '--ngs-color-primary-200',
  '--ngs-color-primary-300',
  '--ngs-color-primary-400',
  '--ngs-color-primary-500',
  '--ngs-color-primary-600',
  '--ngs-color-secondary-100',
  '--ngs-color-secondary-200',
  '--ngs-color-secondary-300',
  '--ngs-color-secondary-400',
  '--ngs-color-secondary-fixed',
  '--ngs-color-on-secondary-fixed',
  '--ngs-color-tertiary-100',
  '--ngs-color-tertiary-200',
  '--ngs-color-tertiary-300',
  '--ngs-color-tertiary-700',
  '--ngs-color-tertiary-800',
  '--ngs-button-tonal-bg',
  '--ngs-button-tonal-color',
  '--ngs-button-outlined-border',
  '--ngs-field-border-color',
  '--ngs-field-border-focus-color',
  '--ngs-field-filled-bg',
  '--ngs-dropdown-item-selected-bg',
  '--ngs-dropdown-item-selected-color',
  '--ngs-nav-item-active-color',
  '--ngs-nav-item-active-bg',
  '--ngs-nav-item-active-icon-color',
] as const;

export function generateNgsThemeProperties(
  primaryColor: string,
  colorScheme: NgsGeneratedThemeColorScheme = 'light',
): NgsThemeCssProperties {
  const seed = parseColor(primaryColor);

  if (!seed) {
    return {
      '--ngs-color-primary-seed': primaryColor,
      '--ngs-color-primary': primaryColor,
      '--ngs-color-on-primary': contrastColor('--ngs-color-primary'),
    };
  }

  return colorScheme === 'dark'
    ? generateDarkThemeProperties(seed)
    : generateLightThemeProperties(seed);
}

export function generateNgsThemeCssText(
  primaryColor: string,
  colorScheme: NgsGeneratedThemeColorScheme = 'light',
): string {
  return Object.entries(generateNgsThemeProperties(primaryColor, colorScheme))
    .map(([name, value]) => `${name}: ${value};`)
    .join('\n');
}

function generateLightThemeProperties(seed: Rgb): NgsThemeCssProperties {
  const source = rgbToHsl(seed);
  const primary = toHex(seed);
  const primaryContainer = colorFromTone(source, 93, 0.62);
  const secondary = colorFromTone(source, 36, 0.36, -8);
  const secondaryContainer = colorFromTone(source, 92, 0.28, -8);
  const tertiary = colorFromTone(source, 42, 0.72, 48);
  const tertiaryContainer = colorFromTone(source, 92, 0.42, 48);
  const info = colorFromTone(source, 48, 0.9, 8);
  const infoContainer = colorFromTone(source, 92, 0.38, 8);
  const status = makeStatusColors('light');
  const neutral = makeNeutralScale(source, 'light');
  const border = colorFromTone(source, 90, 0.08);
  const outline = colorFromTone(source, 56, 0.12);
  const outlineVariant = colorFromTone(source, 86, 0.08);

  return withSharedGeneratedProperties({
    '--ngs-color-primary': primary,
    '--ngs-color-primary-seed': primary,
    '--ngs-color-on-primary': contrastColor('--ngs-color-primary'),
    '--ngs-color-primary-container': primaryContainer,
    '--ngs-color-on-primary-container': contrastColor('--ngs-color-primary-container'),
    '--ngs-color-secondary': secondary,
    '--ngs-color-on-secondary': contrastColor('--ngs-color-secondary'),
    '--ngs-color-secondary-container': secondaryContainer,
    '--ngs-color-on-secondary-container': contrastColor('--ngs-color-secondary-container'),
    '--ngs-color-tertiary': tertiary,
    '--ngs-color-on-tertiary': contrastColor('--ngs-color-tertiary'),
    '--ngs-color-tertiary-container': tertiaryContainer,
    '--ngs-color-on-tertiary-container': contrastColor('--ngs-color-tertiary-container'),
    '--ngs-color-info': info,
    '--ngs-color-on-info': contrastColor('--ngs-color-info'),
    '--ngs-color-info-container': infoContainer,
    '--ngs-color-on-info-container': contrastColor('--ngs-color-info-container'),
    ...status,
    '--ngs-color-background': neutral[0],
    '--ngs-color-on-background': contrastColor('--ngs-color-background'),
    '--ngs-color-surface': neutral[1],
    '--ngs-color-surface-bright': '#ffffff',
    '--ngs-color-on-surface': contrastColor('--ngs-color-surface'),
    '--ngs-color-on-surface-variant': neutral[6],
    '--ngs-color-neutral-50': neutral[0],
    '--ngs-color-neutral-100': neutral[1],
    '--ngs-color-neutral-200': neutral[2],
    '--ngs-color-neutral-300': neutral[3],
    '--ngs-color-neutral-400': neutral[4],
    '--ngs-color-neutral-500': neutral[5],
    '--ngs-color-neutral-600': neutral[6],
    '--ngs-color-neutral-650': neutral[7],
    '--ngs-color-neutral-700': neutral[8],
    '--ngs-color-neutral-800': neutral[9],
    '--ngs-color-neutral-900': neutral[10],
    '--ngs-color-neutral-950': neutral[11],
    '--ngs-color-surface-container-lowest': '#ffffff',
    '--ngs-color-surface-container-low': neutral[0],
    '--ngs-color-surface-container': neutral[1],
    '--ngs-color-surface-container-high': neutral[2],
    '--ngs-color-surface-container-highest': neutral[3],
    '--ngs-color-outline': outline,
    '--ngs-color-outline-variant': outlineVariant,
    '--ngs-color-border': border,
    '--ngs-color-faint': neutral[1],
    '--ngs-color-subtle': neutral[2],
    '--ngs-color-muted': neutral[3],
    '--ngs-color-emphasis': neutral[5],
    '--ngs-color-strong': neutral[6],
    '--ngs-state-selected-color': primary,
    '--ngs-button-tonal-bg': secondaryContainer,
    '--ngs-button-tonal-color': 'var(--ngs-color-on-secondary-container)',
    '--ngs-button-outlined-border': outlineVariant,
    '--ngs-field-border-color': outlineVariant,
    '--ngs-field-border-focus-color': primary,
    '--ngs-field-filled-bg': neutral[1],
    '--ngs-dropdown-item-selected-bg': primaryContainer,
    '--ngs-dropdown-item-selected-color': 'var(--ngs-color-on-primary-container)',
    '--ngs-nav-item-active-color': primary,
    '--ngs-nav-item-active-bg': primaryContainer,
    '--ngs-nav-item-active-icon-color': primary,
  });
}

function generateDarkThemeProperties(seed: Rgb): NgsThemeCssProperties {
  const source = rgbToHsl(seed);
  const primary = colorFromTone(source, 76, 0.82);
  const primaryContainer = colorFromTone(source, 28, 0.78);
  const secondary = colorFromTone(source, 78, 0.36, -8);
  const secondaryContainer = colorFromTone(source, 28, 0.3, -8);
  const tertiary = colorFromTone(source, 78, 0.62, 48);
  const tertiaryContainer = colorFromTone(source, 30, 0.52, 48);
  const info = colorFromTone(source, 76, 0.84, 8);
  const infoContainer = colorFromTone(source, 30, 0.62, 8);
  const status = makeStatusColors('dark');
  const neutral = makeNeutralScale(source, 'dark');
  const border = colorFromTone(source, 22, 0.08);
  const outline = colorFromTone(source, 66, 0.12);
  const outlineVariant = colorFromTone(source, 28, 0.08);

  return withSharedGeneratedProperties({
    '--ngs-color-primary': primary,
    '--ngs-color-primary-seed': toHex(seed),
    '--ngs-color-on-primary': contrastColor('--ngs-color-primary'),
    '--ngs-color-primary-container': primaryContainer,
    '--ngs-color-on-primary-container': contrastColor('--ngs-color-primary-container'),
    '--ngs-color-secondary': secondary,
    '--ngs-color-on-secondary': contrastColor('--ngs-color-secondary'),
    '--ngs-color-secondary-container': secondaryContainer,
    '--ngs-color-on-secondary-container': contrastColor('--ngs-color-secondary-container'),
    '--ngs-color-tertiary': tertiary,
    '--ngs-color-on-tertiary': contrastColor('--ngs-color-tertiary'),
    '--ngs-color-tertiary-container': tertiaryContainer,
    '--ngs-color-on-tertiary-container': contrastColor('--ngs-color-tertiary-container'),
    '--ngs-color-info': info,
    '--ngs-color-on-info': contrastColor('--ngs-color-info'),
    '--ngs-color-info-container': infoContainer,
    '--ngs-color-on-info-container': contrastColor('--ngs-color-info-container'),
    ...status,
    '--ngs-color-background': neutral[0],
    '--ngs-color-on-background': contrastColor('--ngs-color-background'),
    '--ngs-color-surface': neutral[1],
    '--ngs-color-surface-bright': neutral[2],
    '--ngs-color-on-surface': contrastColor('--ngs-color-surface'),
    '--ngs-color-on-surface-variant': neutral[8],
    '--ngs-color-neutral-50': neutral[0],
    '--ngs-color-neutral-100': neutral[1],
    '--ngs-color-neutral-200': neutral[2],
    '--ngs-color-neutral-300': neutral[3],
    '--ngs-color-neutral-400': neutral[4],
    '--ngs-color-neutral-500': neutral[5],
    '--ngs-color-neutral-600': neutral[6],
    '--ngs-color-neutral-650': neutral[7],
    '--ngs-color-neutral-700': neutral[8],
    '--ngs-color-neutral-800': neutral[9],
    '--ngs-color-neutral-900': neutral[10],
    '--ngs-color-neutral-950': neutral[11],
    '--ngs-color-surface-container-lowest': neutral[0],
    '--ngs-color-surface-container-low': neutral[1],
    '--ngs-color-surface-container': neutral[2],
    '--ngs-color-surface-container-high': neutral[3],
    '--ngs-color-surface-container-highest': neutral[4],
    '--ngs-color-outline': outline,
    '--ngs-color-outline-variant': outlineVariant,
    '--ngs-color-border': border,
    '--ngs-color-faint': neutral[1],
    '--ngs-color-subtle': neutral[2],
    '--ngs-color-muted': neutral[3],
    '--ngs-color-emphasis': neutral[7],
    '--ngs-color-strong': neutral[9],
    '--ngs-state-selected-color': primary,
    '--ngs-button-tonal-bg': secondaryContainer,
    '--ngs-button-tonal-color': 'var(--ngs-color-on-secondary-container)',
    '--ngs-button-outlined-border': outlineVariant,
    '--ngs-field-border-color': outlineVariant,
    '--ngs-field-border-focus-color': primary,
    '--ngs-field-filled-bg': neutral[2],
    '--ngs-dropdown-item-selected-bg': primaryContainer,
    '--ngs-dropdown-item-selected-color': 'var(--ngs-color-on-primary-container)',
    '--ngs-nav-item-active-color': primary,
    '--ngs-nav-item-active-bg': primaryContainer,
    '--ngs-nav-item-active-icon-color': primary,
  });
}

function withSharedGeneratedProperties(properties: NgsThemeCssProperties): NgsThemeCssProperties {
  return {
    ...properties,
    '--ngs-state-hover-bg': 'color-mix(in srgb, var(--ngs-color-on-surface), transparent 94%)',
    '--ngs-state-active-bg': 'color-mix(in srgb, var(--ngs-color-on-surface), transparent 90%)',
    '--ngs-state-selected-bg': 'color-mix(in srgb, var(--ngs-color-primary), transparent 88%)',
    '--ngs-state-focus-ring': 'var(--ngs-field-border-focus-color)',
    '--ngs-state-disabled-bg': 'color-mix(in srgb, var(--ngs-color-on-surface), transparent 95%)',
    '--ngs-state-disabled-color': 'color-mix(in srgb, var(--ngs-color-on-surface), transparent 62%)',
    '--ngs-state-disabled-border': 'color-mix(in srgb, var(--ngs-color-on-surface), transparent 90%)',
    '--ngs-color-primary-100': 'color-mix(in srgb, var(--ngs-color-primary), transparent 90%)',
    '--ngs-color-primary-200': 'color-mix(in srgb, var(--ngs-color-primary), transparent 80%)',
    '--ngs-color-primary-300': 'color-mix(in srgb, var(--ngs-color-primary), transparent 70%)',
    '--ngs-color-primary-400': 'color-mix(in srgb, var(--ngs-color-primary), transparent 60%)',
    '--ngs-color-primary-500': 'color-mix(in srgb, var(--ngs-color-primary), transparent 50%)',
    '--ngs-color-primary-600': 'color-mix(in srgb, var(--ngs-color-primary), transparent 40%)',
    '--ngs-color-secondary-100': 'color-mix(in srgb, var(--ngs-color-secondary), transparent 90%)',
    '--ngs-color-secondary-200': 'color-mix(in srgb, var(--ngs-color-secondary), transparent 80%)',
    '--ngs-color-secondary-300': 'color-mix(in srgb, var(--ngs-color-secondary), transparent 70%)',
    '--ngs-color-secondary-400': 'color-mix(in srgb, var(--ngs-color-secondary), transparent 60%)',
    '--ngs-color-secondary-fixed': 'var(--ngs-color-secondary-container)',
    '--ngs-color-on-secondary-fixed': 'var(--ngs-color-on-secondary-container)',
    '--ngs-color-tertiary-100': 'color-mix(in srgb, var(--ngs-color-tertiary), transparent 90%)',
    '--ngs-color-tertiary-200': 'color-mix(in srgb, var(--ngs-color-tertiary), transparent 80%)',
    '--ngs-color-tertiary-300': 'color-mix(in srgb, var(--ngs-color-tertiary), transparent 70%)',
    '--ngs-color-tertiary-700': 'color-mix(in srgb, var(--ngs-color-tertiary), #000000 35%)',
    '--ngs-color-tertiary-800': 'color-mix(in srgb, var(--ngs-color-tertiary), #000000 50%)',
  };
}

function makeNeutralScale(source: Hsl, colorScheme: NgsGeneratedThemeColorScheme): string[] {
  const saturation = Math.min(source.s * 0.12, 8);
  const lightness = colorScheme === 'dark'
    ? [5, 8, 12, 17, 24, 39, 55, 64, 73, 84, 92, 97]
    : [98, 96, 91, 84, 72, 56, 43, 36, 28, 19, 11, 4];

  return lightness.map(l => hslToHex({ h: source.h, s: saturation, l }));
}

function makeStatusColors(colorScheme: NgsGeneratedThemeColorScheme): NgsThemeCssProperties {
  if (colorScheme === 'dark') {
    return {
      '--ngs-color-danger': '#f87171',
      '--ngs-color-on-danger': contrastColor('--ngs-color-danger'),
      '--ngs-color-danger-container': '#7f1d1d',
      '--ngs-color-on-danger-container': contrastColor('--ngs-color-danger-container'),
      '--ngs-color-danger-container-lowest': '#1f0707',
      '--ngs-color-danger-container-low': '#2f0b0b',
      '--ngs-color-danger-container-high': '#5f1717',
      '--ngs-color-danger-container-highest': '#7f1d1d',
      '--ngs-color-success': '#4ade80',
      '--ngs-color-on-success': contrastColor('--ngs-color-success'),
      '--ngs-color-success-container': '#166534',
      '--ngs-color-on-success-container': contrastColor('--ngs-color-success-container'),
      '--ngs-color-warning': '#fbbf24',
      '--ngs-color-on-warning': contrastColor('--ngs-color-warning'),
      '--ngs-color-warning-container': '#78350f',
      '--ngs-color-on-warning-container': contrastColor('--ngs-color-warning-container'),
      '--ngs-color-orange-container': '#78350f',
      '--ngs-color-on-orange-container': contrastColor('--ngs-color-orange-container'),
      '--ngs-color-green-500': '#4ade80',
    };
  }

  return {
    '--ngs-color-danger': '#dc2626',
    '--ngs-color-on-danger': contrastColor('--ngs-color-danger'),
    '--ngs-color-danger-container': '#fee2e2',
    '--ngs-color-on-danger-container': contrastColor('--ngs-color-danger-container'),
    '--ngs-color-danger-container-lowest': '#fffafa',
    '--ngs-color-danger-container-low': '#fef2f2',
    '--ngs-color-danger-container-high': '#fecaca',
    '--ngs-color-danger-container-highest': '#fca5a5',
    '--ngs-color-success': '#16a34a',
    '--ngs-color-on-success': contrastColor('--ngs-color-success'),
    '--ngs-color-success-container': '#dcfce7',
    '--ngs-color-on-success-container': contrastColor('--ngs-color-success-container'),
    '--ngs-color-warning': '#d97706',
    '--ngs-color-on-warning': contrastColor('--ngs-color-warning'),
    '--ngs-color-warning-container': '#fef3c7',
    '--ngs-color-on-warning-container': contrastColor('--ngs-color-warning-container'),
    '--ngs-color-orange-container': '#fef3c7',
    '--ngs-color-on-orange-container': contrastColor('--ngs-color-orange-container'),
    '--ngs-color-green-500': '#16a34a',
  };
}

function colorFromTone(source: Hsl, lightness: number, saturationMultiplier = 1, hueShift = 0): string {
  return hslToHex({
    h: normalizeHue(source.h + hueShift),
    s: clamp(source.s * saturationMultiplier, 8, 92),
    l: lightness,
  });
}

function contrastColor(propertyName: `--ngs-${string}`): string {
  return `contrast-color(var(${propertyName}))`;
}

function parseColor(color: string): Rgb | null {
  const value = color.trim().toLowerCase();

  if (value.startsWith('#')) {
    return parseHexColor(value);
  }

  if (value.startsWith('rgb(') || value.startsWith('rgba(')) {
    return parseRgbColor(value);
  }

  if (value.startsWith('hsl(') || value.startsWith('hsla(')) {
    return parseHslColor(value);
  }

  return null;
}

function parseHexColor(value: string): Rgb | null {
  const hex = value.slice(1);

  if (!/^[\da-f]+$/i.test(hex)) {
    return null;
  }

  if (hex.length === 3 || hex.length === 4) {
    return {
      r: parseInt(hex[0] + hex[0], 16),
      g: parseInt(hex[1] + hex[1], 16),
      b: parseInt(hex[2] + hex[2], 16),
    };
  }

  if (hex.length === 6 || hex.length === 8) {
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }

  return null;
}

function parseRgbColor(value: string): Rgb | null {
  const matches = value.match(/rgba?\(([^)]+)\)/);

  if (!matches) {
    return null;
  }

  const channels = matches[1]
    .replace(/\s*\/\s*[\d.]+%?\s*$/, '')
    .split(/[\s,]+/)
    .filter(Boolean)
    .slice(0, 3)
    .map(channel => parseFloat(channel));

  if (channels.length < 3 || channels.some(Number.isNaN)) {
    return null;
  }

  return {
    r: clamp(Math.round(channels[0]), 0, 255),
    g: clamp(Math.round(channels[1]), 0, 255),
    b: clamp(Math.round(channels[2]), 0, 255),
  };
}

function parseHslColor(value: string): Rgb | null {
  const matches = value.match(/hsla?\(([^)]+)\)/);

  if (!matches) {
    return null;
  }

  const channels = matches[1]
    .replace(/\s*\/\s*[\d.]+%?\s*$/, '')
    .split(/[\s,]+/)
    .filter(Boolean)
    .slice(0, 3);

  if (channels.length < 3) {
    return null;
  }

  const h = parseFloat(channels[0]);
  const s = parseFloat(channels[1]);
  const l = parseFloat(channels[2]);

  if ([h, s, l].some(Number.isNaN)) {
    return null;
  }

  return hslToRgb({ h, s, l });
}

function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const lightness = (max + min) / 2;

  if (delta === 0) {
    return { h: 0, s: 0, l: lightness * 100 };
  }

  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  let hue = 0;

  if (max === red) {
    hue = ((green - blue) / delta) % 6;
  } else if (max === green) {
    hue = (blue - red) / delta + 2;
  } else {
    hue = (red - green) / delta + 4;
  }

  return {
    h: normalizeHue(hue * 60),
    s: saturation * 100,
    l: lightness * 100,
  };
}

function hslToRgb({ h, s, l }: Hsl): Rgb {
  const saturation = clamp(s, 0, 100) / 100;
  const lightness = clamp(l, 0, 100) / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const hue = normalizeHue(h) / 60;
  const x = chroma * (1 - Math.abs((hue % 2) - 1));
  const match = lightness - chroma / 2;
  let red = 0;
  let green = 0;
  let blue = 0;

  if (hue >= 0 && hue < 1) {
    red = chroma;
    green = x;
  } else if (hue >= 1 && hue < 2) {
    red = x;
    green = chroma;
  } else if (hue >= 2 && hue < 3) {
    green = chroma;
    blue = x;
  } else if (hue >= 3 && hue < 4) {
    green = x;
    blue = chroma;
  } else if (hue >= 4 && hue < 5) {
    red = x;
    blue = chroma;
  } else if (hue >= 5 && hue < 6) {
    red = chroma;
    blue = x;
  }

  return {
    r: Math.round((red + match) * 255),
    g: Math.round((green + match) * 255),
    b: Math.round((blue + match) * 255),
  };
}

function hslToHex(hsl: Hsl): string {
  return toHex(hslToRgb(hsl));
}

function toHex({ r, g, b }: Rgb): string {
  return `#${toHexChannel(r)}${toHexChannel(g)}${toHexChannel(b)}`;
}

function toHexChannel(value: number): string {
  return clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0');
}

function normalizeHue(hue: number): number {
  return ((hue % 360) + 360) % 360;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
