import { Component, computed, input, output } from '@angular/core';
import clsx from 'clsx';
import { InputLabelComponent } from './input-label.component.ts';
import { InputErrorsComponent } from './input-errors.component.ts';
import { AngleDownIconComponent } from '../icons/angle-down-icon.component.ts';

interface SelectOption {
  label: string;
  value: string;
}

/**
 * Select field that allows users to select predefined values. Various
 * decorations can be displayed in or around the field to communicate the
 * entry requirements.
 */
@Component({
  selector: 'app-select',
  standalone: true,
  imports: [InputLabelComponent, InputErrorsComponent, AngleDownIconComponent],
  template: `
    <div [class]="containerClasses()">
      <app-input-label [name]="name()" [label]="label()" [required]="required()" />
      <div class="relative flex items-center">
        <select
          [id]="name()"
          [name]="name()"
          [multiple]="!!multiple()"
          [required]="!!required()"
          [class]="selectClasses()"
          [attr.size]="size()"
          [attr.aria-invalid]="!!errors()"
          [attr.aria-errormessage]="name() + '-error'"
          (focus)="fieldFocus.emit($event)"
          (change)="fieldChange.emit($event)"
          (blur)="fieldBlur.emit($event)"
        >
          @if (placeholder()) {
            <option value="" disabled hidden>{{ placeholder() }}</option>
          }
          @for (option of options(); track option.value) {
            <option [value]="option.value" [selected]="isSelected(option.value)">
              {{ option.label }}
            </option>
          }
        </select>
        @if (!multiple()) {
          <app-angle-down-icon class="pointer-events-none absolute right-6 h-5 lg:right-8 lg:h-6" />
        }
      </div>
      <app-input-errors [name]="name()" [errors]="errors()" />
    </div>
  `,
})
export class SelectComponent {
  readonly name = input.required<string>();
  readonly label = input<string>();
  readonly options = input.required<SelectOption[]>();
  readonly multiple = input<boolean>(false);
  readonly size = input<number>();
  readonly placeholder = input<string>();
  readonly required = input<boolean>(false);
  readonly input = input<string | string[] | null | undefined>();
  readonly errors = input<[string, ...string[]] | null>(null);
  readonly class = input<string>('');

  readonly fieldFocus = output<FocusEvent>();
  readonly fieldChange = output<Event>();
  readonly fieldBlur = output<FocusEvent>();

  protected readonly values = computed(() => {
    const val = this.input();
    if (Array.isArray(val)) return val;
    if (val && typeof val === 'string') return [val];
    return [];
  });

  protected isSelected(value: string): boolean {
    return this.values().includes(value);
  }

  protected readonly containerClasses = () =>
    clsx('px-8 lg:px-10', this.class());

  protected readonly selectClasses = computed(() =>
    clsx(
      'w-full appearance-none space-y-2 rounded-2xl border-2 bg-transparent px-5 outline-none md:text-lg lg:space-y-3 lg:px-6 lg:text-xl',
      this.errors()
        ? 'border-red-600/50 dark:border-red-400/50'
        : 'border-slate-200 hover:border-slate-300 focus:border-sky-600/50 dark:border-slate-800 dark:hover:border-slate-700 dark:focus:border-sky-400/50',
      this.multiple() ? 'py-5' : 'h-14 md:h-16 lg:h-[70px]',
      this.placeholder() && !this.values().length && 'text-slate-500'
    )
  );
}
