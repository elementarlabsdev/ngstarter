import {
  ApplicationConfig,
  inject, PLATFORM_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection
} from '@angular/core';
import { provideRouter, TitleStrategy, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideNativeDateAdapter } from '@ngstarter-ui/components/datepicker';
import {
  ENVIRONMENT,
  EnvironmentService,
  GlobalStore,
  provideNgsTheme,
  ThemeManagerService,
} from '@ngstarter-ui/components/core';
import { LayoutSidebarStore } from '@ngstarter-ui/components/layout';
import { COLOR_SCHEME_LOCAL_KEY, ColorScheme, ColorSchemeStore } from '@ngstarter-ui/components/color-scheme';
import { isPlatformBrowser } from '@angular/common';
import {
  FORM_RENDERER_FIELD_REGISTRY,
} from '@ngstarter-ui/components/form-renderer';
import { DocsTitleStrategy } from './seo/docs-title-strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    ColorSchemeStore,
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withViewTransitions()),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    provideStore(),
    provideNativeDateAdapter(),
    provideNgsTheme({
      theme: 'default',
      colorScheme: 'auto',
      density: 'comfortable',
      radius: 'medium',
    }),
    provideAppInitializer(() => {
      const platformId = inject(PLATFORM_ID);
      const envService = inject(EnvironmentService);
      const globalStore = inject(GlobalStore);
      const layoutSidebarStore = inject(LayoutSidebarStore);
      const colorSchemeStore = inject(ColorSchemeStore);
      inject(ThemeManagerService);
      return new Promise((resolve, reject) => {
        if (isPlatformBrowser(platformId)) {
          const localColorScheme = localStorage
            ? (localStorage.getItem(COLOR_SCHEME_LOCAL_KEY) as ColorScheme || 'auto')
            : 'auto';
          // but the best solution set it from backend
          colorSchemeStore.setScheme(localColorScheme);
        }

        layoutSidebarStore.showSidebarVisibility('root', true); // show or hide main sidebar on initial state
        globalStore.setPageTitle(envService.getValue('pageTitle', ''));
        resolve(true);
      });
    }),
    {
      provide: ENVIRONMENT,
      useValue: {
        pageTitle: 'NgStarter',
        siteUrl: 'https://docs.ngstarter.com',
      }
    },
    {
      provide: FORM_RENDERER_FIELD_REGISTRY,
      useValue: {
        // some field and import, for example
        // myAutocomplete: () =>
        //   import('./my-autocomplete-field/my-autocomplete-field')
        //     .then(c => c.MyAutocompleteField)
      }
    },
    {
      provide: TitleStrategy,
      useClass: DocsTitleStrategy
    }
  ]
};
