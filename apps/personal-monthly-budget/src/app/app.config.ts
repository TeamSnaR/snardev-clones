import {
  ApplicationConfig,
  DEFAULT_CURRENCY_CODE,
  LOCALE_ID,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from '@snardev-clones/pmb/app-shell';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    { provide: LOCALE_ID, useValue: 'en-GB' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'GBP' },
  ],
};
