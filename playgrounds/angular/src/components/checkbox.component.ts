import { Component, computed, input } from '@angular/core';
import { type FieldStore, FormischControl } from '@formisch/angular';
import { InputErrorsComponent } from './input-errors.component.ts';

/**
 * Checkbox that allows users to select an option. The label next to the
 * checkbox describes the selection option.
 */
@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [InputErrorsComponent, FormischControl],
  host: { class: 'block px-8 lg:px-10' },
  template: `
    <label class="flex space-x-4 font-medium select-none md:text-lg lg:text-xl">
      <input
        class="mt-1 h-4 w-4 cursor-pointer lg:mt-1 lg:h-5 lg:w-5"
        type="checkbox"
        [value]="value()"
        [checked]="checked()"
        [attr.aria-invalid]="!!field().errors()"
        [attr.aria-errormessage]="
          field().errors() ? field().name() + '-error' : null
        "
        [formischControl]="field()"
      />
      <span>{{ label() }}</span>
      @if (required()) {
        <span class="ml-1 text-red-600 dark:text-red-400">*</span>
      }
    </label>
    <app-input-errors [name]="field().name()" [errors]="field().errors()" />
  `,
})
export class CheckboxComponent {
  readonly field = input.required<FieldStore<any, any>>();
  readonly label = input<string>('');
  readonly value = input<string>();
  readonly required = input<boolean>(false);

  protected readonly checked = computed<boolean>(() => {
    const input = this.field().input();
    if (Array.isArray(input)) {
      return input.includes(this.value() ?? '');
    }
    return !!input;
  });
}
