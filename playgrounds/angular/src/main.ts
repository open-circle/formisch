import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app.component.ts';
import { appConfig } from './app.config.ts';
import './global.css';

bootstrapApplication(AppComponent, appConfig).catch(console.error);
