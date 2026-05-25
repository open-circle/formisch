import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="scrollbar-none flex scroll-px-8 overflow-x-auto scroll-smooth px-8">
      <div class="relative flex-1 border-b-2 border-b-slate-200 dark:border-b-slate-800">
        <nav class="flex space-x-8 lg:space-x-14">
          @for (tab of tabs; track tab.path) {
            <a
              [routerLink]="tab.path"
              routerLinkActive="text-sky-600 dark:text-sky-400"
              class="block pb-4 lg:text-lg hover:text-slate-900 dark:hover:text-slate-200"
            >{{ tab.label }}</a>
          }
        </nav>
      </div>
    </div>
    <main>
      <router-outlet />
    </main>
  `,
})
export class AppComponent {
  readonly tabs = [
    { path: '/login', label: 'Login' },
    { path: '/payment', label: 'Payment' },
    { path: '/todos', label: 'Todos' },
  ];
}
