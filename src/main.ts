import { environment } from './environments/environment';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  provideRouter,
  withInMemoryScrolling,
  withComponentInputBinding,
  withHashLocation,
} from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { App } from './app/app';
import { routes } from './app/app.routes';
bootstrapApplication(App, {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
      withComponentInputBinding(),
      ...(environment.githubPages ? [withHashLocation()] : []),
    ),
    provideHttpClient(),
  ],
}).catch(console.error);
