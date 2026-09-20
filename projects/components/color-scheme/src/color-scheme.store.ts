import { effect, inject, untracked } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { ThemeManagerService } from '@ngstarter-ui/components/core';
import { ColorScheme, ResolvedColorScheme } from './color-scheme.model';

type ColorSchemeState = {
  theme: ColorScheme;
  resolvedTheme: ResolvedColorScheme;
};

const initialState: ColorSchemeState = {
  theme: 'auto',
  resolvedTheme: 'light',
};

export const ColorSchemeStore = signalStore(
  withState(initialState),
  withMethods((store) => {
    const themeManager = inject(ThemeManagerService);

    return {
      setScheme(scheme: ColorScheme): void {
        themeManager.setColorScheme(scheme);

        patchState(store, {
          theme: scheme,
          resolvedTheme: themeManager.getColorScheme(),
        });
      },
    };
  }),
  withHooks({
    onInit(store) {
      const themeManager = inject(ThemeManagerService);

      effect(() => {
        const theme = themeManager.selectedColorScheme();
        const resolvedTheme = themeManager.colorScheme();

        untracked(() => patchState(store, { theme, resolvedTheme }));
      });
    },
  }),
);
