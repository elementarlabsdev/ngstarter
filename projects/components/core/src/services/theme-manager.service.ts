import { afterNextRender, DOCUMENT, effect, inject, Injectable, signal } from '@angular/core';
import {
  NGS_THEME_OPTIONS,
  NgsColorScheme,
  NgsThemeName,
  NgsThemeOptions,
} from '../tokens/theme.token';
import { NgsThemeColorPreset } from '../theming/theme-presets';

interface StoredThemeState {
  theme?: NgsThemeName;
  colorScheme?: NgsColorScheme;
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
  private readonly _selectedColorScheme = signal<NgsColorScheme>('auto');
  private readonly _colorScheme = signal<Exclude<NgsColorScheme, 'auto'>>('light');
  private readonly _colorPreset = signal<NgsThemeColorPreset>('default');

  readonly theme = this._theme.asReadonly();
  readonly selectedColorScheme = this._selectedColorScheme.asReadonly();
  readonly colorScheme = this._colorScheme.asReadonly();
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
            if (this._selectedColorScheme() === 'auto') {
              this.setColorScheme('auto', false);
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
    if (this._colorScheme() === 'dark') {
      this.changeColorScheme('light');
    } else {
      this.changeColorScheme('dark');
    }
  }

  changeColorScheme(colorScheme: 'dark' | 'light'): void {
    this.setColorScheme(colorScheme);
  }

  setTheme(theme: NgsThemeName = 'default', persist = true): void {
    this._theme.set(theme);
    this._persist({ theme }, persist);
  }

  setColorPreset(_colorPreset: NgsThemeColorPreset = 'default', persist = true): void {
    this._colorPreset.set('default');
    this._persist({ colorPreset: 'default' }, persist);
  }

  applyTheme(options: NgsThemeOptions, persist = false): void {
    const theme = this._isThemeName(options.theme) ? options.theme : 'default';

    this._theme.set(theme);

    this._colorPreset.set('default');

    this.setColorScheme(options.colorScheme || 'auto', persist);
    this._persist({ ...options, theme, colorPreset: 'default' }, persist);
  }

  private _getStoredColorScheme() {
    return this._getStoredState().colorScheme;
  };

  private _getStoredState(): StoredThemeState {
    const storage = this._getStorage();

    if (!this._options.persist || storage === null) {
      return {};
    }

    try {
      const rawValue = storage.getItem(this._storageKey);

      if (!rawValue) {
        return {};
      }

      return JSON.parse(rawValue);
    } catch {
      return {};
    }
  };

  private _persist(state: Partial<StoredThemeState>, persist = true): void {
    const storage = this._getStorage();

    if (!persist || !this._options.persist || storage === null) {
      return;
    }

    const meta = this._getStoredState();

    try {
      storage.setItem(this._storageKey, JSON.stringify({ ...meta, ...state }));
    } catch {
      // Keep the active theme in memory when browser storage is unavailable.
    }
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
    this._selectedColorScheme.set(colorScheme);

    if (colorScheme === 'auto') {
      this._colorScheme.set(this._getSystemColorScheme());
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
    root.setAttribute('data-ngs-color-scheme', colorScheme);
    root.setAttribute('data-ngs-resolved-color-scheme', colorScheme);
    root.setAttribute('data-ngs-color-preset', colorPreset);
  }

  private _isThemeName(theme: NgsThemeName | undefined): theme is NgsThemeName {
    return theme === 'default' || theme === 'chalk';
  }

  private get _storageKey(): string {
    return this._options.storageKey || 'ngs-admin';
  }

  private _getStorage(): Storage | null {
    try {
      return this._window?.localStorage ?? null;
    } catch {
      return null;
    }
  }

  private _getSystemColorScheme(): 'dark' | 'light' {
    if (this._window !== null && this._window.matchMedia) {
      return this._window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    return 'light';
  }
}
