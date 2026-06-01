import { Component, effect, input, signal } from '@angular/core';
import { type FormStore } from '@formisch/angular';
import clsx from 'clsx';
import { ExpandableComponent } from './expandable.component.ts';

/**
 * Error component usually used at the end of a form to provide feedback to the
 * user.
 */
@Component({
  selector: 'app-form-error',
  standalone: true,
  imports: [ExpandableComponent],
  host: { class: 'block' },
  template: `
    <app-expandable [expanded]="!!of().errors()">
      <div [class]="classes()">
        {{ frozenError() }}
      </div>
    </app-expandable>
  `,
})
export class FormErrorComponent {
  readonly of = input.required<FormStore>();
  readonly class = input<string>('');

  // Keep the last error message rendered while the expandable collapses so it
  // stays visible throughout the animation, matching the other frameworks.
  protected readonly frozenError = signal<string | undefined>(undefined);

  constructor() {
    effect((onCleanup) => {
      const errors = this.of().errors();
      if (errors) {
        this.frozenError.set(errors[0]);
      } else {
        const timeout = setTimeout(() => this.frozenError.set(undefined), 200);
        onCleanup(() => clearTimeout(timeout));
      }
    });
  }

  protected readonly classes = () =>
    clsx(
      'px-8 text-red-500 md:text-lg lg:px-10 lg:text-xl dark:text-red-400',
      this.class()
    );
}
