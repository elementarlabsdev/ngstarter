import { AvatarAppearance, AvatarKey } from '../types';

const GENERATED_AVATAR_RANDOM_MIN = -2147483648;
const GENERATED_AVATAR_RANDOM_MAX = 2147483647;
const GENERATED_AVATAR_MAX_SEED_LENGTH = 1024;
const GENERATED_AVATAR_PATTERN_COLORS = [
  '3ead46',
  'c65abd',
  '2697d4',
  'f59e0b',
  'ef4444',
  '14b8a6',
  '8b5cf6',
  '64748b',
  '22c55e',
  'e11d48',
  '0ea5e9',
  'a855f7'
];
const GENERATED_AVATAR_BACKGROUND_COLORS = [
  'bbf7d0',
  'f0abfc',
  'bae6fd',
  'fed7aa',
  'fecaca',
  '99f6e4',
  'ddd6fe',
  'cbd5e1',
  '86efac',
  'fecdd3',
  '7dd3fc',
  'e9d5ff'
];
const GENERATED_INITIALS_BACKGROUND_COLORS = [
  'e53935',
  '3949ab',
  '43a047',
  'ffb300',
  '8e24aa',
  '039be5',
  'fb8c00',
  '00897b',
  'd81b60',
  'fbc02d',
  '5e35b1',
  '00acc1',
  'f4511e',
  '7cb342',
  '1e88e5',
  'c0ca33'
];
const GENERATED_AVATAR_PATTERNS = [
  [
    '0x0x0',
    '0x0x0',
    'x0x0x',
    'x000x',
    '0xxx0'
  ],
  [
    'xxxxx',
    'xx0xx',
    'xx0xx',
    '0x0x0',
    'xx0xx'
  ],
  [
    '0xxx0',
    'x000x',
    'x0x0x',
    'x000x',
    '0xxx0'
  ],
  [
    'xx0xx',
    '0x0x0',
    '00x00',
    '0x0x0',
    'xx0xx'
  ],
  [
    'x000x',
    'xx0xx',
    '0xxx0',
    '00x00',
    '00x00'
  ],
  [
    '00x00',
    '0xxx0',
    'xx0xx',
    '0xxx0',
    'x000x'
  ],
  [
    'xxx00',
    'x0x00',
    'xxxxx',
    '00x0x',
    '00xxx'
  ],
  [
    '00xxx',
    '00x0x',
    'xxxxx',
    'x0x00',
    'xxx00'
  ],
  [
    '0x0x0',
    'xxxxx',
    '00x00',
    'xxxxx',
    '0x0x0'
  ],
  [
    'x0x0x',
    '0xxx0',
    'xx0xx',
    '0xxx0',
    'x0x0x'
  ],
  [
    '0xxx0',
    '0x0x0',
    'xxxxx',
    '0x0x0',
    '0xxx0'
  ],
  [
    'xx0xx',
    'x000x',
    '0xxx0',
    'x000x',
    'xx0xx'
  ]
];
export interface GeneratedAvatarCell {
  id: string;
  x: number;
  y: number;
}

export interface GeneratedAvatar {
  kind: 'identicon' | 'initials';
  background: string;
  foreground: string;
  label: string;
  cells: GeneratedAvatarCell[];
}

export interface AvatarGeneratorOptions {
  appearance: AvatarAppearance;
  seed: AvatarKey;
  label: string;
  backgroundColors: string[];
  foregroundColors: string[];
}

interface GeneratedAvatarRandom {
  seed: string;
  next(): number;
  integer(min: number, max: number): number;
  pick<T>(values: readonly T[], fallback: T): T;
  shuffle<T>(values: readonly T[]): T[];
}

export class AvatarGenerator {
  generate(options: AvatarGeneratorOptions): GeneratedAvatar | null {
    const seed = String(options.seed || '');

    if (options.appearance === 'initials') {
      return this._initialsAvatar(seed, options.label, options.backgroundColors, options.foregroundColors);
    }

    if (options.appearance === 'identicon') {
      return this._identiconAvatar(seed, options.backgroundColors, options.foregroundColors);
    }

    return null;
  }

  private _identiconAvatar(seed: string, backgroundColorValues: string[], foregroundColorValues: string[]): GeneratedAvatar {
    const random = this._createGeneratedAvatarRandom(seed || 'avatar');
    const pattern = random.pick(GENERATED_AVATAR_PATTERNS, GENERATED_AVATAR_PATTERNS[0]);
    const foregroundColors = this._colorPalette(foregroundColorValues, GENERATED_AVATAR_PATTERN_COLORS);
    const backgroundColors = this._colorPalette(backgroundColorValues, GENERATED_AVATAR_BACKGROUND_COLORS);
    const foreground = random.pick(foregroundColors, foregroundColors[0]);
    const rotation = random.integer(0, 3);
    const background = this._generatedAvatarBackground(random, backgroundColors);

    return {
      kind: 'identicon',
      background,
      foreground,
      label: '',
      cells: this._transformIdenticonCells(this._identiconCells(pattern), rotation)
    };
  }

  private _initialsAvatar(seed: string, label: string, backgroundColorValues: string[], foregroundColorValues: string[]): GeneratedAvatar {
    const random = this._createGeneratedAvatarRandom(seed || 'avatar');
    const backgroundColors = this._colorPalette(backgroundColorValues, GENERATED_INITIALS_BACKGROUND_COLORS);
    const foregroundColors = this._colorPalette(foregroundColorValues, ['ffffff']);
    const foreground = random.pick(foregroundColors, foregroundColors[0]);
    const background = this._pickColorBySeed(seed || 'avatar', backgroundColors);

    return {
      kind: 'initials',
      background,
      foreground,
      label: this._initials(seed, label),
      cells: []
    };
  }

  private _initials(seed: string, label: string): string {
    const source = (label || seed).trim();

    if (!source) {
      return '?';
    }

    const parts = source.split(/\s+/).filter(Boolean);

    if (parts.length > 1) {
      return parts.slice(0, 2).map(part => part.charAt(0)).join('').toUpperCase();
    }

    return source.slice(0, 2).toUpperCase();
  }

  private _identiconCells(rowPatterns: string[]): GeneratedAvatarCell[] {
    const cells: GeneratedAvatarCell[] = [];

    rowPatterns.forEach((pattern, row) => {
      for (let column = 0; column < pattern.length; column++) {
        if (pattern[column] === 'x') {
          cells.push({
            id: `${column}-${row}`,
            x: column,
            y: row
          });
        }
      }
    });

    return cells;
  }

  private _transformIdenticonCells(cells: GeneratedAvatarCell[], rotation: number): GeneratedAvatarCell[] {
    return cells.map(cell => {
      if (rotation === 1) {
        return {
          id: `${cell.y}-${4 - cell.x}`,
          x: cell.y,
          y: 4 - cell.x
        };
      }

      if (rotation === 2) {
        return {
          id: `${4 - cell.x}-${4 - cell.y}`,
          x: 4 - cell.x,
          y: 4 - cell.y
        };
      }

      if (rotation === 3) {
        return {
          id: `${4 - cell.y}-${cell.x}`,
          x: 4 - cell.y,
          y: cell.x
        };
      }

      return cell;
    });
  }

  private _colorPalette(colors: string[], fallbackColors: string[]): string[] {
    return (colors.length ? colors : fallbackColors).map(color => {
      return color === 'transparent' ? color : `#${color.replace('#', '')}`;
    });
  }

  private _pickColorBySeed(seed: string, colors: string[]): string {
    return colors[Math.abs(this._hashGeneratedAvatarSeed(seed)) % colors.length] ?? 'transparent';
  }

  private _generatedAvatarBackground(random: GeneratedAvatarRandom, backgroundColors: string[]): string {
    let shuffledBackgroundColors = random.shuffle(backgroundColors);

    if (shuffledBackgroundColors.length <= 1) {
      shuffledBackgroundColors = backgroundColors;
      random.next();
    } else {
      shuffledBackgroundColors = random.shuffle(backgroundColors);
    }

    return shuffledBackgroundColors[0] ?? 'transparent';
  }

  private _createGeneratedAvatarRandom(seedValue: AvatarKey): GeneratedAvatarRandom {
    const seed = String(seedValue ?? '').slice(0, GENERATED_AVATAR_MAX_SEED_LENGTH);
    let value = this._hashGeneratedAvatarSeed(seed) || 1;
    const next = () => {
      value = this._generatedAvatarXorshift(value);

      return value;
    };
    const integer = (min: number, max: number) => {
      return Math.floor(((next() - GENERATED_AVATAR_RANDOM_MIN) / (GENERATED_AVATAR_RANDOM_MAX - GENERATED_AVATAR_RANDOM_MIN)) * (max + 1 - min) + min);
    };

    return {
      seed,
      next,
      integer,
      pick: <T>(values: readonly T[], fallback: T): T => {
        if (values.length === 0) {
          next();

          return fallback;
        }

        return values[integer(0, values.length - 1)] ?? fallback;
      },
      shuffle: <T>(values: readonly T[]): T[] => {
        const internalRandom = this._createGeneratedAvatarRandom(next().toString());
        const workingValues = [...values];

        for (let index = workingValues.length - 1; index > 0; index--) {
          const randomIndex = internalRandom.integer(0, index);
          [workingValues[index], workingValues[randomIndex]] = [workingValues[randomIndex], workingValues[index]];
        }

        return workingValues;
      }
    };
  }

  private _hashGeneratedAvatarSeed(seed: string): number {
    let hash = 0;

    for (let index = 0; index < seed.length; index++) {
      hash = ((hash << 5) - hash + seed.charCodeAt(index)) | 0;
      hash = this._generatedAvatarXorshift(hash);
    }

    return hash;
  }

  private _generatedAvatarXorshift(value: number): number {
    value ^= value << 13;
    value ^= value >> 17;
    value ^= value << 5;

    return value;
  }
}
