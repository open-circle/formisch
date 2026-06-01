import { Component, input, output } from '@angular/core';
import clsx from 'clsx';

type Color = 'green' | 'yellow' | 'purple' | 'blue' | 'red';

/**
 * Button with a specified color used for demo purposes in the playground.
 */
@Component({
  selector: 'app-color-button',
  standalone: true,
  template: `
    <button [type]="type()" [class]="classes()" (click)="clicked.emit()">
      {{ label() }}
    </button>
  `,
})
export class ColorButtonComponent {
  readonly type = input<'button' | 'submit'>('button');
  readonly color = input.required<Color>();
  readonly label = input.required<string>();
  readonly width = input<'auto' | undefined>(undefined);
  readonly clicked = output<void>();

  protected readonly classes = () =>
    clsx(
      'h-14 rounded-2xl border-2 bg-white px-5 font-medium md:h-16 md:text-lg lg:h-[70px] lg:px-6 lg:text-xl dark:bg-gray-900',
      this.color() === 'green' &&
        'border-emerald-600/20 text-emerald-600 hover:bg-emerald-600/10 dark:border-emerald-400/20 dark:text-emerald-400 dark:hover:bg-emerald-400/10',
      this.color() === 'yellow' &&
        'border-yellow-600/20 text-yellow-600 hover:bg-yellow-600/10 dark:border-amber-300/20 dark:text-amber-300 dark:hover:bg-amber-300/10',
      this.color() === 'purple' &&
        'border-purple-600/20 text-purple-600 hover:bg-purple-600/10 dark:border-purple-400/20 dark:text-purple-400 dark:hover:bg-purple-400/10',
      this.color() === 'blue' &&
        'border-sky-600/20 text-sky-600 hover:bg-sky-600/10 dark:border-sky-400/20 dark:text-sky-400 dark:hover:bg-sky-400/10',
      this.color() === 'red' &&
        'border-red-600/20 text-red-600 hover:bg-red-600/10 dark:border-red-400/20 dark:text-red-400 dark:hover:bg-red-400/10',
      this.width() !== 'auto' && 'w-full md:w-auto'
    );
}
