import { Component, input, output } from '@angular/core';
import { type FieldElementProps, FormischFieldRef } from '@formisch/angular';

/**
 * Simple radio button input. Should be used inside a RadioGroup component.
 */
@Component({
  selector: 'app-radio',
  standalone: true,
  imports: [FormischFieldRef],
  template: `
    <label
      class="flex cursor-pointer items-center space-x-3 font-medium select-none md:text-lg lg:text-xl"
    >
      <input
        class="h-4 w-4 cursor-pointer lg:h-5 lg:w-5"
        type="radio"
        [name]="name()"
        [value]="value()"
        [checked]="checked()"
        [formischFieldRef]="fieldRef()"
        (focus)="fieldFocus.emit($event)"
        (input)="fieldInput.emit($event)"
        (change)="fieldChange.emit($event)"
        (blur)="fieldBlur.emit($event)"
      />
      <span>{{ label() }}</span>
    </label>
  `,
})
export class RadioComponent {
  readonly name = input.required<string>();
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly checked = input<boolean>(false);
  readonly fieldRef = input<FieldElementProps['ref']>();

  readonly fieldFocus = output<FocusEvent>();
  readonly fieldInput = output<Event>();
  readonly fieldChange = output<Event>();
  readonly fieldBlur = output<FocusEvent>();
}
