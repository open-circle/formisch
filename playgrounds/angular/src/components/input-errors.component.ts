import { Component, input } from '@angular/core';
import { ExpandableComponent } from './expandable.component.ts';

/**
 * Input error that tells the user what to do to fix the problem.
 */
@Component({
  selector: 'app-input-errors',
  standalone: true,
  imports: [ExpandableComponent],
  template: `
    <app-expandable [expanded]="!!errors()">
      <div
        [id]="name() + '-error'"
        class="pt-4 text-sm text-red-500 md:text-base lg:pt-5 lg:text-lg dark:text-red-400"
      >
        {{ errors()?.[0] }}
      </div>
    </app-expandable>
  `,
})
export class InputErrorsComponent {
  readonly name = input.required<string>();
  readonly errors = input<[string, ...string[]] | null>(null);
}
