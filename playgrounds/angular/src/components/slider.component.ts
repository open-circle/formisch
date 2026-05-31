import { Component, input, output } from '@angular/core';
import { type FieldElementProps, FormischFieldRef } from '@formisch/angular';
import clsx from 'clsx';
import { InputErrorsComponent } from './input-errors.component.ts';
import { InputLabelComponent } from './input-label.component.ts';

/**
 * Range slider that allows users to select predefined numbers. Various
 * decorations can be displayed in or around the field to communicate the
 * entry requirements.
 */
@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [InputLabelComponent, InputErrorsComponent, FormischFieldRef],
  template: `
    <div [class]="containerClasses()">
      <app-input-label
        [name]="name()"
        [label]="label()"
        [required]="required()"
      />
      <input
        class="w-full"
        type="range"
        [id]="name()"
        [name]="name()"
        [value]="input()"
        [attr.min]="min()"
        [attr.max]="max()"
        [attr.step]="step()"
        [attr.aria-invalid]="!!errors()"
        [attr.aria-errormessage]="errors() ? name() + '-error' : null"
        [formischFieldRef]="fieldRef()"
        (focus)="fieldFocus.emit($event)"
        (input)="fieldInput.emit($event)"
        (change)="fieldChange.emit($event)"
        (blur)="fieldBlur.emit($event)"
      />
      <app-input-errors [name]="name()" [errors]="errors()" />
    </div>
  `,
})
export class SliderComponent {
  readonly name = input.required<string>();
  readonly label = input<string>();
  readonly min = input<number>();
  readonly max = input<number>();
  readonly step = input<number>();
  readonly required = input<boolean>(false);
  readonly input = input<string | number | undefined>();
  readonly errors = input<[string, ...string[]] | null>(null);
  readonly class = input<string>('');
  readonly fieldRef = input<FieldElementProps['ref']>();

  readonly fieldFocus = output<FocusEvent>();
  readonly fieldInput = output<Event>();
  readonly fieldChange = output<Event>();
  readonly fieldBlur = output<FocusEvent>();

  protected readonly containerClasses = () =>
    clsx('px-8 lg:px-10', this.class());
}
