import { Component, input } from '@angular/core';
import clsx from 'clsx';
import { type FormStore } from '@formisch/angular';
import { ExpandableComponent } from './expandable.component.ts';

/**
 * Error component usually used at the end of a form to provide feedback to the
 * user.
 */
@Component({
  selector: 'app-form-error',
  standalone: true,
  imports: [ExpandableComponent],
  template: `
    <app-expandable [expanded]="!!of().errors()">
      <div [class]="classes()">
        {{ of().errors()?.[0] }}
      </div>
    </app-expandable>
  `,
})
export class FormErrorComponent {
  readonly of = input.required<FormStore>();
  readonly class = input<string>('');

  protected readonly classes = () =>
    clsx(
      'px-8 text-red-500 md:text-lg lg:px-10 lg:text-xl dark:text-red-400',
      this.class()
    );
}
