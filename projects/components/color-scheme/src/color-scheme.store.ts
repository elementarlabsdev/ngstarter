import { DestroyRef, effect, inject, PLATFORM_ID, DOCUMENT } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { COLOR_SCHEME_LOCAL_KEY, ColorScheme, ResolvedColorScheme } from './color-scheme.model';

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
    const platformId = inject(PLATFORM_ID);
    const document = inject(DOCUMENT);

    const resolveScheme = (scheme: ColorScheme): ResolvedColorScheme => {
      if (scheme !== 'auto') {
        return scheme;
      }

      const media = document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)');
      return media?.matches ? 'dark' : 'light';
    };

    return {
      setScheme(scheme: ColorScheme): void {
        patchState(store, {
          theme: scheme,
          resolvedTheme: resolveScheme(scheme),
        });

        if (isPlatformBrowser(platformId)) {
          localStorage.setItem(COLOR_SCHEME_LOCAL_KEY, scheme);
        }
      },
    };
  }),
  withHooks({
    onInit(store) {
      const document = inject(DOCUMENT);
      const platformId = inject(PLATFORM_ID);
      const destroyRef = inject(DestroyRef);
      const media = document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)');

      if (isPlatformBrowser(platformId) && media) {
        const updateResolvedScheme = () => {
          if (store.theme() === 'auto') {
            patchState(store, { resolvedTheme: media.matches ? 'dark' : 'light' });
          }
        };

        updateResolvedScheme();
        media.addEventListener('change', updateResolvedScheme);
        destroyRef.onDestroy(() => media.removeEventListener('change', updateResolvedScheme));
      }

      effect(() => {
        const scheme = store.theme();
        const resolvedScheme = scheme === 'auto' ? store.resolvedTheme() : scheme;

        if (resolvedScheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (resolvedScheme === 'light') {
          document.documentElement.classList.remove('dark');
        }

        document.documentElement.setAttribute('data-ngs-color-scheme', scheme);
        document.documentElement.setAttribute('data-ngs-resolved-color-scheme', resolvedScheme);
      });
    },
  }),
);
