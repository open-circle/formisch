import { Component, input, output } from '@angular/core';
import { type FieldElementProps, FormischFieldRef } from '@formisch/angular';
import { InputErrorsComponent } from './input-errors.component.ts';

/**
 * Checkbox that allows users to select an option. The label next to the
 * checkbox describes the selection option.
 */
@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [InputErrorsComponent, FormischFieldRef],
  host: { class: 'block px-8 lg:px-10' },
  template: `
    <label class="flex space-x-4 font-medium select-none md:text-lg lg:text-xl">
      <input
        class="mt-1 h-4 w-4 cursor-pointer lg:mt-1 lg:h-5 lg:w-5"
        type="checkbox"
        [id]="name()"
        [name]="name()"
        [value]="value()"
        [checked]="!!input()"
        [required]="!!required()"
        [attr.aria-invalid]="!!errors()"
        [attr.aria-errormessage]="errors() ? name() + '-error' : null"
        [formischFieldRef]="fieldRef()"
        (focus)="fieldFocus.emit($event)"
        (input)="fieldInput.emit($event)"
        (change)="fieldChange.emit($event)"
        (blur)="fieldBlur.emit($event)"
      />
      <span>{{ label() }}</span>
      @if (required()) {
        <span class="ml-1 text-red-600 dark:text-red-400">*</span>
      }
    </label>
    <app-input-errors [name]="name()" [errors]="errors()" />
  `,
})
export class CheckboxComponent {
  readonly name = input.required<string>();
  readonly label = input<string>('');
  readonly value = input<string>();
  readonly input = input<boolean | undefined>();
  readonly required = input<boolean>(false);
  readonly errors = input<[string, ...string[]] | null>(null);
  readonly fieldRef = input<FieldElementProps['ref']>();

  readonly fieldFocus = output<FocusEvent>();
  readonly fieldInput = output<Event>();
  readonly fieldChange = output<Event>();
  readonly fieldBlur = output<FocusEvent>();
}
