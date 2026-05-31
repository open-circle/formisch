import { Component } from '@angular/core';
import { FormischField, FormischForm, injectForm } from '@formisch/angular';
import * as v from 'valibot';
import { CheckboxComponent } from '../../components/checkbox.component.ts';
import { FileInputComponent } from '../../components/file-input.component.ts';
import { FormFooterComponent } from '../../components/form-footer.component.ts';
import { FormHeaderComponent } from '../../components/form-header.component.ts';
import { RadioGroupComponent } from '../../components/radio-group.component.ts';
import { SelectComponent } from '../../components/select.component.ts';
import { SliderComponent } from '../../components/slider.component.ts';
import { TextInputComponent } from '../../components/text-input.component.ts';

const SpecialFormSchema = v.object({
  number: v.optional(v.string()),
  range: v.optional(v.string(), '50'),
  checkbox: v.object({
    array: v.array(v.string()),
    boolean: v.optional(v.boolean(), false),
  }),
  radio: v.optional(v.string()),
  select: v.object({
    array: v.array(v.string()),
    string: v.optional(v.string()),
  }),
  file: v.object({
    list: v.array(v.file()),
    item: v.optional(v.file()),
  }),
});

@Component({
  selector: 'app-special',
  standalone: true,
  imports: [
    FormischForm,
    FormischField,
    FormHeaderComponent,
    FormFooterComponent,
    TextInputComponent,
    SliderComponent,
    CheckboxComponent,
    RadioGroupComponent,
    SelectComponent,
    FileInputComponent,
  ],
  template: `
    <form
      [formischForm]="form"
      (formischSubmit)="handleSubmit($event)"
      class="space-y-12 md:space-y-14 lg:space-y-16"
    >
      <app-form-header [form]="form" heading="Special form" />

      <div class="space-y-8 md:space-y-10 lg:space-y-12">
        <ng-container *formischField="['number'] of form; let field">
          <app-text-input [field]="field" type="number" label="Number" />
        </ng-container>

        <ng-container *formischField="['range'] of form; let field">
          <app-slider [field]="field" label="Range" />
        </ng-container>

        <label
          class="block px-8 font-medium md:text-lg lg:mb-5 lg:px-10 lg:text-xl"
        >
          Checkbox array
        </label>

        <ng-container *formischField="['checkbox', 'array'] of form; let field">
          <div
            class="mx-8 flex flex-wrap gap-6 rounded-2xl border-2 border-slate-200 p-6 lg:gap-10 lg:p-10 dark:border-slate-800"
          >
            @for (option of checkboxOptions; track option.value) {
              <app-checkbox
                [field]="field"
                [label]="option.label"
                [value]="option.value"
                class="p-0!"
              />
            }
          </div>
        </ng-container>

        <ng-container
          *formischField="['checkbox', 'boolean'] of form; let field"
        >
          <app-checkbox [field]="field" label="Checkbox boolean" />
        </ng-container>

        <ng-container *formischField="['radio'] of form; let field">
          <app-radio-group
            [field]="field"
            label="Radio group"
            [options]="radioOptions"
          />
        </ng-container>

        <ng-container *formischField="['select', 'array'] of form; let field">
          <app-select
            [field]="field"
            [options]="selectOptions"
            label="Select array"
            [multiple]="true"
          />
        </ng-container>

        <ng-container *formischField="['select', 'string'] of form; let field">
          <app-select
            [field]="field"
            [options]="selectOptions"
            label="Select string"
          />
        </ng-container>

        <ng-container *formischField="['file', 'list'] of form; let field">
          <app-file-input [field]="field" label="File list" [multiple]="true" />
        </ng-container>

        <ng-container *formischField="['file', 'item'] of form; let field">
          <app-file-input [field]="field" label="File item" />
        </ng-container>
      </div>

      <app-form-footer [form]="form" />
    </form>
  `,
})
export class SpecialComponent {
  readonly form = injectForm({ schema: SpecialFormSchema });

  readonly checkboxOptions = [
    { label: 'Option 1', value: 'option_1' },
    { label: 'Option 2', value: 'option_2' },
    { label: 'Option 3', value: 'option_3' },
  ];

  readonly radioOptions = [
    { label: 'Option 1', value: 'option_1' },
    { label: 'Option 2', value: 'option_2' },
    { label: 'Option 3', value: 'option_3' },
  ];

  readonly selectOptions = [
    { label: 'Option 1', value: 'option_1' },
    { label: 'Option 2', value: 'option_2' },
    { label: 'Option 3', value: 'option_3' },
  ];

  handleSubmit(output: v.InferOutput<typeof SpecialFormSchema>): void {
    console.log(output);
  }
}
