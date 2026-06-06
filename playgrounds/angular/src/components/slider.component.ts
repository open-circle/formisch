import { Component, computed, input } from '@angular/core';
import { type FieldStore, FormischControl } from '@formisch/angular';
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
  host: { class: 'block' },
  imports: [InputLabelComponent, InputErrorsComponent, FormischControl],
  template: `
    <div [class]="containerClasses()">
      <app-input-label
        [name]="field().name()"
        [label]="label()"
        [required]="required()"
      />
      <input
        class="w-full"
        type="range"
        [id]="field().name()"
        [value]="value()"
        [attr.min]="min()"
        [attr.max]="max()"
        [attr.step]="step()"
        [attr.aria-invalid]="!!field().errors()"
        [attr.aria-errormessage]="
          field().errors() ? field().name() + '-error' : null
        "
        [formischControl]="field()"
      />
      <app-input-errors [name]="field().name()" [errors]="field().errors()" />
    </div>
  `,
})
export class SliderComponent {
  readonly field = input.required<FieldStore>();
  readonly label = input<string>();
  readonly min = input<number>();
  readonly max = input<number>();
  readonly step = input<number>();
  readonly required = input<boolean>(false);
  readonly class = input<string>('');

  protected readonly value = computed<string | number>(() => {
    const input = this.field().input();
    return input == null ? '' : (input as string | number);
  });

  protected readonly containerClasses = () =>
    clsx('px-8 lg:px-10', this.class());
}
