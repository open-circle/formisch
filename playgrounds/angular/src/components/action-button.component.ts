import { Component, input, output } from '@angular/core';
import clsx from 'clsx';
import { UnstyledButtonComponent } from './unstyled-button.component.ts';

/**
 * Button used for navigation, to confirm form entries, or perform actions.
 */
@Component({
  selector: 'app-action-button',
  standalone: true,
  imports: [UnstyledButtonComponent],
  template: `
    <app-unstyled-button
      [type]="type()"
      [class]="classes()"
      [loading]="loading()"
      [onClick]="onClick()"
      (clicked)="clicked.emit()"
    >
      {{ label() }}
    </app-unstyled-button>
  `,
})
export class ActionButtonComponent {
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly variant = input.required<'primary' | 'secondary'>();
  readonly label = input.required<string>();
  readonly loading = input<boolean>(false);
  readonly onClick = input<(() => unknown) | undefined>(undefined);
  readonly clicked = output<void>();

  protected readonly classes = () =>
    clsx(
      'relative flex cursor-pointer items-center justify-center rounded-2xl px-5 py-2.5 font-medium no-underline transition-colors md:text-lg lg:rounded-2xl lg:px-6 lg:py-3 lg:text-xl',
      this.variant() === 'primary' &&
        'bg-sky-600 text-white hover:bg-sky-600/80 dark:bg-sky-400 dark:text-gray-900 dark:hover:bg-sky-400/80',
      this.variant() === 'secondary' &&
        'bg-sky-600/10 text-sky-600 hover:bg-sky-600/20 dark:bg-sky-400/10 dark:text-sky-400 dark:hover:bg-sky-400/20'
    );
}
