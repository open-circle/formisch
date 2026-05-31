import { Component, computed, input, output } from '@angular/core';
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
  imports: [InputLabelComponent, InputErrorsComponent],
  host: { class: 'block px-8 lg:px-10' },
  template: `
    <app-input-label
      [name]="name()"
      [label]="label()"
      [required]="required()"
    />
    <input
      [name]="name()"
      [type]="type()"
      [id]="name()"
      [value]="value() ?? ''"
      [placeholder]="placeholder() ?? ''"
      [attr.aria-invalid]="!!errors()"
      [attr.aria-errormessage]="errors() ? name() + '-error' : null"
      [class]="inputClass()"
      (focus)="fieldFocus.emit($event)"
      (input)="fieldChange.emit($event)"
      (blur)="fieldBlur.emit($event)"
    />
    <app-input-errors [name]="name()" [errors]="errors()" />
  `,
})
export class TextInputComponent {
  readonly name = input.required<string>();
  readonly type = input<string>('text');
  readonly label = input<string>();
  readonly placeholder = input<string>();
  readonly required = input<boolean>(false);
  readonly value = input<string | number | undefined>();
  readonly errors = input<[string, ...string[]] | null>(null);

  readonly fieldFocus = output<FocusEvent>();
  readonly fieldChange = output<Event>();
  readonly fieldBlur = output<FocusEvent>();

  protected readonly inputClass = computed(() =>
    clsx(
      'h-14 w-full rounded-2xl border-2 bg-white px-5 outline-none placeholder:text-slate-500 md:h-16 md:text-lg lg:h-[70px] lg:px-6 lg:text-xl dark:bg-gray-900',
      this.errors()
        ? 'border-red-600/50 dark:border-red-400/50'
        : 'border-slate-200 hover:border-slate-300 focus:border-sky-600/50 dark:border-slate-800 dark:hover:border-slate-700 dark:focus:border-sky-400/50'
    )
  );
}
