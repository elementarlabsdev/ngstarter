import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideNgsTheme, ThemeManagerService } from '@ngstarter-ui/components/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideNgsTheme({
      theme: 'minto',
      colorScheme: 'light',
      density: 'comfortable',
      radius: 'large',
      persist: false,
    }),
    provideAppInitializer(() => {
      inject(ThemeManagerService);
    }),
  ]
};
