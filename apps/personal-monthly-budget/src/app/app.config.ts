import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from '@snardev-clones/pmb/app-shell';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(appRoutes)],
};
