import {
  AfterViewInit,
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  forwardRef,
  inject,
  input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { AVATAR_ACCESSOR, AvatarKey, AvatarPresenceIndicator, AvatarPreset, AvatarVariant } from '../types';

const alreadyLoadedImages: string[] = [];
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
  'd81b60',
  '8e24aa',
  '5e35b1',
  '3949ab',
  '1e88e5',
  '039be5',
  '00acc1',
  '00897b',
  '43a047',
  '7cb342',
  'c0ca33',
  'fdd835',
  'ffb300',
  'fb8c00',
  'f4511e'
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

interface GeneratedAvatarCell {
  id: string;
  x: number;
  y: number;
}

interface GeneratedAvatar {
  kind: 'identicon' | 'initials';
  background: string;
  foreground: string;
  label: string;
  cells: GeneratedAvatarCell[];
}

@Component({
  selector: 'ngs-avatar,[ngs-avatar]',
  exportAs: 'ngsAvatar',
  templateUrl: './avatar.html',
  styleUrl: './avatar.scss',
  providers: [
    {
      provide: AVATAR_ACCESSOR,
      useExisting: forwardRef(() => Avatar),
      multi: true
    }
  ],
  host: {
    'class': 'ngs-avatar',
    '[class.is-clickable]': 'clickable()',
    '[class.has-automatic-color]': '!!automaticColor()',
    '[class.has-generated-avatar]': '!!generatedAvatar()',
    '[class.has-loaded-image]': 'image() && imageLoaded',
    '[class.is-solid]': 'variant() === "solid"',
    '[class.is-tonal]': 'variant() === "tonal"',
    '[class.is-outlined]': 'variant() === "outlined"',
    '[class.is-plain]': 'variant() === "plain"',
  }
})
export class Avatar implements OnInit, OnChanges, AfterViewInit {
  private _elementRef = inject(ElementRef);

  image = input<string>('');
  variant = input<AvatarVariant>('');
  clickable = input(false, {
    transform: booleanAttribute
  });
  label = input('');
  key = input<AvatarKey>('');
  preset = input<AvatarPreset>('');
  backgroundColors = input<string[]>([]);
  foregroundColors = input<string[]>([]);
  alt = input('');
  automaticColor = input();
  presenceIndicator = input<AvatarPresenceIndicator>(null);

  protected imageLoaded: boolean;
  protected showLabel = false;
  protected readonly generatedAvatar = computed<GeneratedAvatar | null>(() => {
    const preset = this.preset();

    if (preset !== 'identicon' && preset !== 'initials') {
      return null;
    }

    if (preset === 'initials') {
      return this._initialsAvatar(this._seed());
    }

    return this._identiconAvatar(this._seed());
  });

  ngOnInit() {
    if (!this.image()) {
      return;
    }

    this.imageLoaded = alreadyLoadedImages.includes(<string>this.image());
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.showLabel = true;
    }, 0);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['image']) {
      this.imageLoaded = alreadyLoadedImages.includes(<string>this.image());
    }

    if (changes['automaticColor'] && changes['automaticColor'].currentValue) {
      this._setAutomaticColor(changes['automaticColor'].currentValue);
    }
  }

  onImageLoaded(): void {
    if (this.imageLoaded) {
      return;
    }

    alreadyLoadedImages.push(<string>this.image());
    this.imageLoaded = true;
  }

  private _setAutomaticColor(color: any): void {
    if (!this.isValidHex(color)) {
      throw new Error(`Invalid ${color} color, automatic color supports only a valid hex color`);
    }

    const element = this._elementRef.nativeElement as HTMLElement;
    element.style.setProperty('--ngs-avatar-bg', color);
    element.style.setProperty('--ngs-avatar-border-color-auto', this._newShade(color, -25));
    element.style.setProperty('--ngs-avatar-color', this._newShade(color, -150));
  }

  private _newShade(hexColor: string, magnitude: number): string {
    hexColor = hexColor.replace(`#`, ``);
      if (hexColor.length === 6) {
      const decimalColor = parseInt(hexColor, 16);
      let r = (decimalColor >> 16) + magnitude;
      r > 255 && (r = 255);
      r < 0 && (r = 0);
      let g = (decimalColor & 0x0000ff) + magnitude;
      g > 255 && (g = 255);
      g < 0 && (g = 0);
      let b = ((decimalColor >> 8) & 0x00ff) + magnitude;
      b > 255 && (b = 255);
      b < 0 && (b = 0);
      return `#${(g | (b << 8) | (r << 16)).toString(16)}`;
    } else {
      return hexColor;
    }
  };

  private _seed(): string {
    return String(this.key() || this.label() || this.alt() || '');
  }

  private _identiconAvatar(seed: string): GeneratedAvatar {
    const hash = this._hash(seed || 'avatar');
    const pattern = GENERATED_AVATAR_PATTERNS[hash % GENERATED_AVATAR_PATTERNS.length];
    const foregroundColors = this._colorPalette(this.foregroundColors(), GENERATED_AVATAR_PATTERN_COLORS);
    const backgroundColors = this._colorPalette(this.backgroundColors(), GENERATED_AVATAR_BACKGROUND_COLORS);
    const foreground = foregroundColors[Math.floor(hash / GENERATED_AVATAR_PATTERNS.length) % foregroundColors.length];
    const background = backgroundColors[Math.floor(hash / GENERATED_AVATAR_PATTERNS.length / foregroundColors.length) % backgroundColors.length];

    return {
      kind: 'identicon',
      background,
      foreground,
      label: '',
      cells: this._identiconCells(pattern)
    };
  }

  private _initialsAvatar(seed: string): GeneratedAvatar {
    const hash = this._hash(seed || 'avatar');
    const colors = this._colorPalette(this.backgroundColors(), GENERATED_INITIALS_BACKGROUND_COLORS);

    return {
      kind: 'initials',
      background: colors[hash % colors.length],
      foreground: '#ffffff',
      label: this._initials(seed),
      cells: []
    };
  }

  private _initials(seed: string): string {
    const source = (this.label() || seed).trim();

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

  private _colorPalette(colors: string[], fallbackColors: string[]): string[] {
    return (colors.length ? colors : fallbackColors).map(color => {
      return color === 'transparent' ? color : `#${color.replace('#', '')}`;
    });
  }

  private _hash(value: string): number {
    let hash = 2166136261;

    for (let index = 0; index < value.length; index++) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
  }

  isValidHex(color: any): boolean {
    if(!color || typeof color !== 'string') {
      return false;
    }

    // Validate hex values
    if(color.substring(0, 1) === '#') {
      color = color.substring(1);
    }

    switch(color.length) {
      case 3: {
        return /^[0-9A-F]{3}$/i.test(color);
      }
      case 6: {
        return /^[0-9A-F]{6}$/i.test(color);
      }
      case 8: {
        return /^[0-9A-F]{8}$/i.test(color);
      }
      default: {
        return false;
      }
    }
  }
}
