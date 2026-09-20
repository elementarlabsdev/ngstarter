import { afterNextRender, DOCUMENT, effect, inject, Injectable, signal } from '@angular/core';
import {
  NGS_THEME_OPTIONS,
  NgsColorScheme,
  NgsRadius,
  NgsThemeName,
  NgsThemeOptions,
} from '../tokens/theme.token';
import {
  getNgsThemePresetProperties,
  NGS_THEME_PRESET_PROPERTY_NAMES,
  NgsThemeColorPreset,
} from '../theming/theme-presets';

interface StoredThemeState {
  theme?: NgsThemeName;
  colorScheme?: NgsColorScheme;
  radius?: NgsRadius;
  colorPreset?: NgsThemeColorPreset;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeManagerService {
  private _document = inject(DOCUMENT);
  private _window = this._document.defaultView;
  private _options = inject(NGS_THEME_OPTIONS);

  private readonly _theme = signal<NgsThemeName>('default');
  private readonly _colorScheme = signal<Exclude<NgsColorScheme, 'auto'>>('light');
  private readonly _radius = signal<NgsRadius>('medium');
  private readonly _colorPreset = signal<NgsThemeColorPreset>('default');

  readonly theme = this._theme.asReadonly();
  readonly colorScheme = this._colorScheme.asReadonly();
  readonly radius = this._radius.asReadonly();
  readonly colorPreset = this._colorPreset.asReadonly();

  constructor() {
    this.applyTheme(this._getInitialState());

    effect(() => {
      this._syncDocumentAttributes();
    });

    afterNextRender(() => {
      if (this._window !== null && this._window.matchMedia) {
        this._window
          .matchMedia('(prefers-color-scheme: dark)')
          .addEventListener('change', () => {
            const storedColorScheme = this._getStoredColorScheme();

            if (storedColorScheme !== 'light' && storedColorScheme !== 'dark') {
              this.setColorScheme(this.getPreferredColorScheme(), false);
            }
          })
        ;
      }
    });
  }

  getColorScheme(): 'dark' | 'light' {
    return this._colorScheme();
  }

  toggleColorScheme(): void {
    if (this._getStoredColorScheme() === 'dark') {
      this.changeColorScheme('light');
    } else {
      this.changeColorScheme('dark');
    }
  }

  changeColorScheme(colorScheme: 'dark' | 'light'): void {
    this.setColorScheme(colorScheme);
  }

  setTheme(_theme: NgsThemeName = 'default', persist = true): void {
    this._theme.set('default');
    this._persist({ theme: 'default' }, persist);
  }

  setRadius(radius: NgsRadius, persist = true): void {
    this._radius.set(radius);
    this._persist({ radius }, persist);
  }

  setColorPreset(_colorPreset: NgsThemeColorPreset = 'default', persist = true): void {
    this._colorPreset.set('default');
    this._persist({ colorPreset: 'default' }, persist);
  }

  applyTheme(options: NgsThemeOptions, persist = false): void {
    this._theme.set('default');

    if (options.radius) {
      this._radius.set(options.radius);
    }

    this._colorPreset.set('default');

    this.setColorScheme(options.colorScheme || 'auto', persist);
    this._persist({ ...options, theme: 'default', colorPreset: 'default' }, persist);
  }

  private _getStoredColorScheme() {
    return this._getStoredState().colorScheme;
  };

  private _getStoredState(): StoredThemeState {
    if (!this._options.persist || typeof localStorage === 'undefined') {
      return {};
    }

    const rawValue = localStorage.getItem(this._storageKey);

    if (!rawValue) {
      return {};
    }

    try {
      return JSON.parse(rawValue);
    } catch {
      return {};
    }
  };

  private _persist(state: Partial<StoredThemeState>, persist = true): void {
    if (!persist || !this._options.persist || typeof localStorage === 'undefined') {
      return;
    }

    const meta = this._getStoredState();
    localStorage.setItem(this._storageKey, JSON.stringify({ ...meta, ...state }));
  };

  private _setStoredColorScheme(colorScheme: string): void {
    this._persist({ colorScheme: colorScheme as NgsColorScheme });
  };

  getPreferredColorScheme(): 'dark' | 'light' {
    const storedTheme = this._getStoredColorScheme();

    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }

    if (this._window !== null && this._window.matchMedia) {
      return this._window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    return 'light';
  };

  setColorScheme(colorScheme: NgsColorScheme, persist = true): void {
    if (colorScheme === 'auto') {
      this._colorScheme.set(this.getPreferredColorScheme());
    } else {
      this._colorScheme.set(colorScheme);
    }

    if (persist) {
      this._setStoredColorScheme(colorScheme);
    }
  };

  private _getInitialState(): NgsThemeOptions {
    return {
      ...this._options,
      ...this._getStoredState(),
      theme: 'default',
      colorPreset: 'default',
    };
  }

  private _syncDocumentAttributes(): void {
    const root = this._document.documentElement;
    const colorPreset = this._colorPreset();
    const colorScheme = this._colorScheme();

    if (!root) {
      return;
    }

    root.classList?.toggle('dark', this._colorScheme() === 'dark');
    root.setAttribute('data-ngs-theme', this._theme());
    root.setAttribute('data-ngs-color-scheme', this._colorScheme());
    root.setAttribute('data-ngs-radius', this._radius());
    root.setAttribute('data-ngs-color-preset', colorPreset);

    if (!root.style) {
      return;
    }

    for (const name of NGS_THEME_PRESET_PROPERTY_NAMES) {
      root.style.removeProperty(name);
    }

    for (const [name, value] of Object.entries(
      getNgsThemePresetProperties(colorPreset, colorScheme),
    )) {
      root.style.setProperty(name, value);
    }
  }

  private get _storageKey(): string {
    return this._options.storageKey || 'ngs-admin';
  }
}
