import { Component, effect, input, signal } from '@angular/core';
import { ExpandableComponent } from './expandable.component.ts';

/**
 * Input error that tells the user what to do to fix the problem.
 */
@Component({
  selector: 'app-input-errors',
  standalone: true,
  imports: [ExpandableComponent],
  host: { class: 'block' },
  template: `
    <app-expandable [expanded]="!!errors()">
      <div
        [id]="name() + '-error'"
        class="pt-4 text-sm text-red-500 md:text-base lg:pt-5 lg:text-lg dark:text-red-400"
      >
        {{ frozenError() }}
      </div>
    </app-expandable>
  `,
})
export class InputErrorsComponent {
  readonly name = input.required<string>();
  readonly errors = input<[string, ...string[]] | null>(null);

  // Keep the last error message rendered while the expandable collapses so it
  // stays visible throughout the animation, matching the other frameworks.
  protected readonly frozenError = signal<string | undefined>(undefined);

  constructor() {
    effect((onCleanup) => {
      const errors = this.errors();
      if (errors) {
        this.frozenError.set(errors[0]);
      } else {
        const timeout = setTimeout(() => this.frozenError.set(undefined), 200);
        onCleanup(() => clearTimeout(timeout));
      }
    });
  }
}
