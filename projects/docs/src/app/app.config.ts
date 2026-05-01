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
import { FORM_FIELD_DEFAULT_OPTIONS } from '@ngstarter/components/form-field';
import { provideNativeDateAdapter } from '@ngstarter/components/datepicker';
import { ENVIRONMENT, EnvironmentService, GlobalStore, PageTitleStrategyService } from '@ngstarter/components/core';
import { LayoutSidebarStore } from '@ngstarter/components/layout';
import { COLOR_SCHEME_LOCAL_KEY, ColorScheme, ColorSchemeStore } from '@ngstarter/components/color-scheme';
import { isPlatformBrowser } from '@angular/common';
import {
  FORM_RENDERER_FIELD_REGISTRY,
} from '@ngstarter/components/form-renderer';

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
    provideAppInitializer(() => {
      const platformId = inject(PLATFORM_ID);
      const envService = inject(EnvironmentService);
      const globalStore = inject(GlobalStore);
      const layoutSidebarStore = inject(LayoutSidebarStore);
      const colorSchemeStore = inject(ColorSchemeStore);
      return new Promise((resolve, reject) => {
        if (isPlatformBrowser(platformId)) {
          const localColorScheme = localStorage
            ? (localStorage.getItem(COLOR_SCHEME_LOCAL_KEY) as ColorScheme || 'light')
            : 'light';
          // but the best solution set it from backend
          colorSchemeStore.setScheme(localColorScheme);
        }

        layoutSidebarStore.showSidebarVisibility('root', true); // show or hide main sidebar on initial state
        globalStore.setPageTitle(envService.getValue('pageTitle'));
        resolve(true);
      });
    }),
    {
      provide: ENVIRONMENT,
      useValue: {}
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
      useClass: PageTitleStrategyService
    },
    {
      provide: FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline' }
    },
  ]
};
