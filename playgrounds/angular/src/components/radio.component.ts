import { Component, input } from '@angular/core';
import { type FieldStore, FormischControl } from '@formisch/angular';

/**
 * Simple radio button input. Should be used inside a RadioGroup component.
 */
@Component({
  selector: 'app-radio',
  standalone: true,
  imports: [FormischControl],
  template: `
    <label
      class="flex cursor-pointer select-none items-center space-x-3 font-medium md:text-lg lg:text-xl"
    >
      <input
        class="h-4 w-4 cursor-pointer lg:h-5 lg:w-5"
        type="radio"
        [value]="value()"
        [formischControl]="field()"
      />
      <span>{{ label() }}</span>
    </label>
  `,
})
export class RadioComponent {
  readonly field = input.required<FieldStore>();
  readonly label = input.required<string>();
  readonly value = input.required<string>();
}
