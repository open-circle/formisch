import { Component, computed, input } from '@angular/core';
import { type FieldStore, FormischControl } from '@formisch/angular';
import clsx from 'clsx';
import { InputErrorsComponent } from './input-errors.component.ts';
import { InputLabelComponent } from './input-label.component.ts';

/**
 * Text input field that users can type into. Various decorations can be
 * displayed in or around the field to communicate the entry requirements.
 */
@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [InputLabelComponent, InputErrorsComponent, FormischControl],
  host: { class: 'block px-8 lg:px-10' },
  template: `
    <app-input-label
      [name]="field().name()"
      [label]="label()"
      [required]="required()"
    />
    <input
      [type]="type()"
      [id]="field().name()"
      [value]="value()"
      [placeholder]="placeholder() ?? ''"
      [attr.aria-invalid]="!!field().errors()"
      [attr.aria-errormessage]="
        field().errors() ? field().name() + '-error' : null
      "
      [class]="inputClass()"
      [formischControl]="field()"
    />
    <app-input-errors [name]="field().name()" [errors]="field().errors()" />
  `,
})
export class TextInputComponent {
  readonly field = input.required<FieldStore<any, any>>();
  readonly type = input<string>('text');
  readonly label = input<string>();
  readonly placeholder = input<string>();
  readonly required = input<boolean>(false);

  protected readonly value = computed<string | number>(() => {
    const input = this.field().input();
    return input == null ? '' : (input as string | number);
  });

  protected readonly inputClass = computed(() =>
    clsx(
      'h-14 w-full rounded-2xl border-2 bg-white px-5 outline-none placeholder:text-slate-500 md:h-16 md:text-lg lg:h-[70px] lg:px-6 lg:text-xl dark:bg-gray-900',
      this.field().errors()
        ? 'border-red-600/50 dark:border-red-400/50'
        : 'border-slate-200 hover:border-slate-300 focus:border-sky-600/50 dark:border-slate-800 dark:hover:border-slate-700 dark:focus:border-sky-400/50'
    )
  );
}
