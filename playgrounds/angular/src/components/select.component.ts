import { Component, computed, input } from '@angular/core';
import { type FieldStore, FormischControl } from '@formisch/angular';
import clsx from 'clsx';
import { AngleDownIconComponent } from '../icons/angle-down-icon.component.ts';
import { InputErrorsComponent } from './input-errors.component.ts';
import { InputLabelComponent } from './input-label.component.ts';

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
  host: { class: 'block' },
  imports: [
    InputLabelComponent,
    InputErrorsComponent,
    AngleDownIconComponent,
    FormischControl,
  ],
  template: `
    <div [class]="containerClasses()">
      <app-input-label
        [name]="field().name()"
        [label]="label()"
        [required]="required()"
      />
      <div class="relative flex items-center">
        <select
          [id]="field().name()"
          [multiple]="!!multiple()"
          [required]="!!required()"
          [class]="selectClasses()"
          [attr.size]="size()"
          [attr.aria-invalid]="!!field().errors()"
          [attr.aria-errormessage]="
            field().errors() ? field().name() + '-error' : null
          "
          [formischControl]="field()"
        >
          <option value="" disabled hidden [selected]="!values().length">
            {{ placeholder() }}
          </option>
          @for (option of options(); track option.value) {
            <option
              [value]="option.value"
              [selected]="isSelected(option.value)"
            >
              {{ option.label }}
            </option>
          }
        </select>
        @if (!multiple()) {
          <app-angle-down-icon
            class="pointer-events-none absolute right-6 h-5 lg:right-8 lg:h-6"
          />
        }
      </div>
      <app-input-errors [name]="field().name()" [errors]="field().errors()" />
    </div>
  `,
})
export class SelectComponent {
  readonly field = input.required<FieldStore<any, any>>();
  readonly label = input<string>();
  readonly options = input.required<SelectOption[]>();
  readonly multiple = input<boolean>(false);
  readonly size = input<number>();
  readonly placeholder = input<string>();
  readonly required = input<boolean>(false);
  readonly class = input<string>('');

  protected readonly values = computed<string[]>(() => {
    const value = this.field().input();
    if (Array.isArray(value)) {
      return value as string[];
    }
    if (value && typeof value === 'string') {
      return [value];
    }
    return [];
  });

  protected readonly containerClasses = () =>
    clsx('px-8 lg:px-10', this.class());

  protected isSelected(value: string): boolean {
    return this.values().includes(value);
  }

  protected readonly selectClasses = computed(() =>
    clsx(
      'w-full appearance-none space-y-2 rounded-2xl border-2 bg-transparent px-5 outline-none md:text-lg lg:space-y-3 lg:px-6 lg:text-xl',
      this.field().errors()
        ? 'border-red-600/50 dark:border-red-400/50'
        : 'border-slate-200 hover:border-slate-300 focus:border-sky-600/50 dark:border-slate-800 dark:hover:border-slate-700 dark:focus:border-sky-400/50',
      this.multiple() ? 'py-5' : 'h-14 md:h-16 lg:h-[70px]',
      this.placeholder() && !this.values().length && 'text-slate-500'
    )
  );
}
