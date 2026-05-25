import { Component, computed, input, output } from '@angular/core';
import clsx from 'clsx';

@Component({
  selector: 'app-text-input',
  standalone: true,
  template: `
    <div class="px-8 lg:px-10">
      @if (label()) {
        <label
          [for]="name()"
          class="mb-4 inline-block font-medium md:text-lg lg:mb-5 lg:text-xl"
        >
          {{ label() }}
          @if (required()) {
            <span class="ml-1 text-red-600 dark:text-red-400">*</span>
          }
        </label>
      }
      <input
        [name]="name()"
        [type]="type()"
        [id]="name()"
        [value]="value() ?? ''"
        [placeholder]="placeholder() ?? ''"
        [attr.aria-invalid]="!!errors()"
        [attr.aria-errormessage]="name() + '-error'"
        [class]="inputClass()"
        (focus)="fieldFocus.emit($event)"
        (change)="fieldChange.emit($event)"
        (blur)="fieldBlur.emit($event)"
      />
      @if (errors()) {
        <div
          [id]="name() + '-error'"
          class="pt-4 text-sm text-red-500 md:text-base lg:pt-5 lg:text-lg dark:text-red-400"
        >
          {{ errors()![0] }}
        </div>
      }
    </div>
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
