import { Component, input, output, signal } from '@angular/core';
import clsx from 'clsx';
import { SpinnerComponent } from './spinner.component.ts';

/**
 * Basic button component with loading state and spinner animation.
 */
@Component({
  selector: 'app-unstyled-button',
  standalone: true,
  imports: [SpinnerComponent],
  template: `
    <button
      [type]="type()"
      [class]="class()"
      [disabled]="isLoading() || loading()"
      (click)="handleClick()"
    >
      <span
        [class]="clsx(
          'transition-[opacity,transform,visibility] duration-200',
          isLoading() || loading()
            ? 'invisible translate-x-5 opacity-0'
            : 'visible delay-300'
        )"
      >
        <ng-content />
      </span>
      <span
        [class]="clsx(
          'absolute duration-200',
          isLoading() || loading()
            ? 'visible delay-300'
            : 'invisible -translate-x-5 opacity-0'
        )"
      >
        <app-spinner />
      </span>
    </button>
  `,
})
export class UnstyledButtonComponent {
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly class = input<string>('');
  readonly loading = input<boolean>(false);
  readonly onClick = input<(() => unknown) | undefined>(undefined);
  readonly clicked = output<void>();

  protected readonly isLoading = signal(false);
  protected readonly clsx = clsx;

  protected async handleClick(): Promise<void> {
    const handler = this.onClick();
    this.clicked.emit();
    if (!handler) return;
    this.isLoading.set(true);
    try {
      await handler();
    } finally {
      this.isLoading.set(false);
    }
  }
}
