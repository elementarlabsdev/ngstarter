import { afterNextRender, DOCUMENT, effect, inject, Injectable, signal } from '@angular/core';
import {
  NGS_THEME_OPTIONS,
  NgsColorScheme,
  NgsRadius,
  NgsThemeName,
  NgsThemeOptions,
} from '../tokens/theme.token';
import {
  NGS_GENERATED_THEME_PROPERTY_NAMES,
} from '../theming/theme-generator';

interface StoredThemeState {
  theme?: NgsThemeName;
  colorScheme?: NgsColorScheme;
  radius?: NgsRadius;
  primaryColor?: string;
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
  private readonly _primaryColor = signal<string | null>(null);

  readonly theme = this._theme.asReadonly();
  readonly colorScheme = this._colorScheme.asReadonly();
  readonly radius = this._radius.asReadonly();
  readonly primaryColor = this._primaryColor.asReadonly();

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

  setTheme(theme: NgsThemeName, persist = true): void {
    this._theme.set(theme);
    this._persist({ theme }, persist);
  }

  setRadius(radius: NgsRadius, persist = true): void {
    this._radius.set(radius);
    this._persist({ radius }, persist);
  }

  setPrimaryColor(primaryColor: string | null, persist = true): void {
    this._primaryColor.set(primaryColor);
    this._persist({ primaryColor: primaryColor || undefined }, persist);
  }

  applyTheme(options: NgsThemeOptions, persist = false): void {
    if (options.theme) {
      this._theme.set(options.theme);
    }

    if (options.radius) {
      this._radius.set(options.radius);
    }

    if (options.primaryColor !== undefined) {
      this._primaryColor.set(options.primaryColor || null);
    }

    this.setColorScheme(options.colorScheme || 'auto', persist);
    this._persist(options, persist);
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
    };
  }

  private _syncDocumentAttributes(): void {
    const root = this._document.documentElement;
    const primaryColor = this._primaryColor();

    if (!root) {
      return;
    }

    root.classList?.toggle('dark', this._colorScheme() === 'dark');
    root.setAttribute('data-ngs-theme', this._theme());
    root.setAttribute('data-ngs-color-scheme', this._colorScheme());
    root.setAttribute('data-ngs-radius', this._radius());

    if (!root.style) {
      return;
    }

    if (primaryColor) {
      for (const name of NGS_GENERATED_THEME_PROPERTY_NAMES) {
        root.style.removeProperty(name);
      }

      root.style.setProperty('--ngs-color-primary-seed', primaryColor);
    } else {
      for (const name of NGS_GENERATED_THEME_PROPERTY_NAMES) {
        root.style.removeProperty(name);
      }
    }
  }

  private get _storageKey(): string {
    return this._options.storageKey || 'ngs-admin';
  }
}
