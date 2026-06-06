import { Component, computed, input } from '@angular/core';
import { type FieldStore, FormischControl } from '@formisch/angular';
import clsx from 'clsx';
import { InputErrorsComponent } from './input-errors.component.ts';
import { InputLabelComponent } from './input-label.component.ts';

/**
 * File input field that users can click or drag files into. Various
 * decorations can be displayed in or around the field to communicate the entry
 * requirements.
 */
@Component({
  selector: 'app-file-input',
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
      <label [class]="labelClasses()">
        {{ displayText() }}
        <input
          class="absolute h-full w-full cursor-pointer opacity-0"
          type="file"
          [id]="field().name()"
          [attr.accept]="accept()"
          [multiple]="!!multiple()"
          [attr.aria-invalid]="!!field().errors()"
          [attr.aria-errormessage]="
            field().errors() ? field().name() + '-error' : null
          "
          [formischControl]="field()"
        />
      </label>
      <app-input-errors [name]="field().name()" [errors]="field().errors()" />
    </div>
  `,
})
export class FileInputComponent {
  readonly field = input.required<FieldStore>();
  readonly label = input<string>();
  readonly accept = input<string>();
  readonly multiple = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly class = input<string>('');

  protected readonly files = computed<File[]>(() => {
    const value = this.field().input();
    if (!value) {
      return [];
    }
    return (Array.isArray(value) ? value : [value]) as File[];
  });

  protected readonly displayText = computed(() => {
    const files = this.files();
    if (files.length) {
      return `Selected file${this.multiple() ? 's' : ''}: ${files.map((file) => file.name).join(', ')}`;
    }
    return `Click or drag and drop file${this.multiple() ? 's' : ''}`;
  });

  protected readonly containerClasses = () =>
    clsx('px-8 lg:px-10', this.class());

  protected readonly labelClasses = computed(() =>
    clsx(
      'relative flex min-h-24 w-full items-center justify-center rounded-2xl border-[3px] border-dashed border-slate-200 p-8 text-center focus-within:border-sky-600/50 hover:border-slate-300 md:min-h-28 md:text-lg lg:min-h-32 lg:p-10 lg:text-xl dark:border-slate-800 dark:focus-within:border-sky-400/50 dark:hover:border-slate-700',
      !this.files().length && 'text-slate-500'
    )
  );
}
