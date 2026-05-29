import { Component, computed, input, output } from '@angular/core';
import clsx from 'clsx';
import { InputLabelComponent } from './input-label.component.ts';
import { InputErrorsComponent } from './input-errors.component.ts';

/**
 * File input field that users can click or drag files into. Various
 * decorations can be displayed in or around the field to communicate the entry
 * requirements.
 */
@Component({
  selector: 'app-file-input',
  standalone: true,
  imports: [InputLabelComponent, InputErrorsComponent],
  template: `
    <div [class]="containerClasses()">
      <app-input-label [name]="name()" [label]="label()" [required]="required()" />
      <label
        [class]="labelClasses()"
      >
        {{ displayText() }}
        <input
          class="absolute h-full w-full cursor-pointer opacity-0"
          type="file"
          [id]="name()"
          [name]="name()"
          [attr.accept]="accept()"
          [multiple]="!!multiple()"
          [attr.aria-invalid]="!!errors()"
          [attr.aria-errormessage]="name() + '-error'"
          (focus)="fieldFocus.emit($event)"
          (change)="fieldChange.emit($event)"
          (blur)="fieldBlur.emit($event)"
        />
      </label>
      <app-input-errors [name]="name()" [errors]="errors()" />
    </div>
  `,
})
export class FileInputComponent {
  readonly name = input.required<string>();
  readonly label = input<string>();
  readonly accept = input<string>();
  readonly multiple = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly input = input<File | File[] | null | undefined>();
  readonly errors = input<[string, ...string[]] | null>(null);
  readonly class = input<string>('');

  readonly fieldFocus = output<FocusEvent>();
  readonly fieldChange = output<Event>();
  readonly fieldBlur = output<FocusEvent>();

  protected readonly files = computed(() => {
    const val = this.input();
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  });

  protected readonly displayText = computed(() => {
    const files = this.files();
    if (files.length) {
      return `Selected file${this.multiple() ? 's' : ''}: ${files.map((f) => f.name).join(', ')}`;
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
