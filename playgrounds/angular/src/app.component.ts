import { Location } from '@angular/common';
import {
  afterNextRender,
  Component,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter } from 'rxjs';
import { disableTransitions } from './utils/disable-transitions.ts';

interface IndicatorStyle {
  left: string;
  width: string;
}

/**
 * Root application component with tab navigation and sliding indicator.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  host: {
    '(window:resize)': 'onResize()',
  },
  template: `
    <div
      class="scrollbar-none flex scroll-px-8 overflow-x-auto scroll-smooth px-8"
    >
      <div
        class="relative flex-1 border-b-2 border-b-slate-200 dark:border-b-slate-800"
      >
        <nav #navEl class="flex space-x-8 lg:space-x-14">
          @for (tab of tabs; track tab.path) {
            <a
              [routerLink]="tab.path"
              routerLinkActive
              #rla="routerLinkActive"
              [class]="
                'block pb-4 lg:text-lg ' +
                (rla.isActive
                  ? 'text-sky-600 dark:text-sky-400'
                  : 'hover:text-slate-900 dark:hover:text-slate-200')
              "
              (click)="scrollIntoView($event)"
              >{{ tab.label }}</a
            >
          }
        </nav>
        @if (indicatorStyle()) {
          <div
            class="absolute -bottom-0.5 m-0 h-0.5 rounded bg-sky-600 duration-200 dark:bg-sky-400"
            [style.left]="indicatorStyle()!.left"
            [style.width]="indicatorStyle()!.width"
          ></div>
        }
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
    { path: '/special', label: 'Special' },
    { path: '/nested', label: 'Nested' },
  ];

  private readonly navEl = viewChild<ElementRef<HTMLElement>>('navEl');
  private readonly injector = inject(Injector);
  private readonly location = inject(Location);
  protected readonly indicatorStyle = signal<IndicatorStyle | undefined>(
    undefined
  );

  constructor() {
    const router = inject(Router);

    router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        afterNextRender(
          { read: () => this.updateIndicatorStyle() },
          { injector: this.injector }
        );
      });
  }

  onResize(): void {
    disableTransitions();
    this.updateIndicatorStyle();
  }

  private updateIndicatorStyle(): void {
    const nav = this.navEl()?.nativeElement;
    if (!nav) return;
    const activeEl = [...nav.children].find((el) =>
      (el as HTMLAnchorElement).href?.endsWith(this.location.path())
    ) as HTMLAnchorElement | undefined;
    this.indicatorStyle.set(
      activeEl
        ? {
            left: `${activeEl.offsetLeft}px`,
            width: `${activeEl.offsetWidth}px`,
          }
        : undefined
    );
  }

  protected scrollIntoView(event: MouseEvent): void {
    (event.currentTarget as HTMLElement).scrollIntoView({
      block: 'nearest',
      inline: 'center',
    });
  }
}
