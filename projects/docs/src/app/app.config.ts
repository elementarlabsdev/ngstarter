import {
  ApplicationConfig,
  inject,
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
import { ColorSchemeStore } from '@ngstarter-ui/components/color-scheme';
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
      radius: 'medium',
    }),
    provideAppInitializer(() => {
      const envService = inject(EnvironmentService);
      const globalStore = inject(GlobalStore);
      const layoutSidebarStore = inject(LayoutSidebarStore);
      inject(ColorSchemeStore);
      inject(ThemeManagerService);
      return new Promise((resolve, reject) => {
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
