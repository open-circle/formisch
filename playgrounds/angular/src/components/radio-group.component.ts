import { Component, input, output } from '@angular/core';
import clsx from 'clsx';
import { InputErrorsComponent } from './input-errors.component.ts';
import { InputLabelComponent } from './input-label.component.ts';
import { RadioComponent } from './radio.component.ts';

interface RadioOption {
  label: string;
  value: string;
}

/**
 * Radio group that allows users to select a single option from a list.
 * Uses fieldset and legend for proper HTML semantics and accessibility.
 */
@Component({
  selector: 'app-radio-group',
  standalone: true,
  imports: [InputLabelComponent, InputErrorsComponent, RadioComponent],
  template: `
    <fieldset
      [class]="containerClasses()"
      [attr.aria-invalid]="!!errors()"
      [attr.aria-errormessage]="name() + '-error'"
    >
      <app-input-label
        component="legend"
        [label]="label()"
        [required]="required()"
      />
      <div
        class="flex flex-wrap gap-6 rounded-2xl border-2 border-slate-200 p-6 lg:gap-10 lg:p-10 dark:border-slate-800"
      >
        @for (option of options(); track option.value) {
          <app-radio
            [name]="name()"
            [label]="option.label"
            [value]="option.value"
            [checked]="input() === option.value"
            (fieldFocus)="fieldFocus.emit($event)"
            (fieldChange)="fieldChange.emit($event)"
            (fieldBlur)="fieldBlur.emit($event)"
          />
        }
      </div>
      <app-input-errors [name]="name()" [errors]="errors()" />
    </fieldset>
  `,
})
export class RadioGroupComponent {
  readonly name = input.required<string>();
  readonly label = input<string>();
  readonly options = input.required<RadioOption[]>();
  readonly required = input<boolean>(false);
  readonly input = input<string | undefined>();
  readonly errors = input<[string, ...string[]] | null>(null);
  readonly class = input<string>('');

  readonly fieldFocus = output<FocusEvent>();
  readonly fieldChange = output<Event>();
  readonly fieldBlur = output<FocusEvent>();

  protected readonly containerClasses = () =>
    clsx('px-8 lg:px-10', this.class());
}
