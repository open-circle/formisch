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
    <formisch-form
      [of]="form"
      [submitFn]="handleSubmit"
      class="space-y-12 md:space-y-14 lg:space-y-16"
    >
      <app-form-header [of]="form" heading="Special form" />

      <div class="space-y-8 md:space-y-10 lg:space-y-12">
        <formisch-field [of]="form" [path]="['number']">
          <ng-template let-field>
            <app-text-input
              [name]="field.props.name"
              [value]="field.input()"
              [errors]="field.errors()"
              type="number"
              label="Number"
              [fieldRef]="field.props.ref"
              (fieldFocus)="field.props.onFocus($event)"
              (fieldInput)="field.props.onInput($event)"
              (fieldChange)="field.props.onChange($event)"
              (fieldBlur)="field.props.onBlur($event)"
            />
          </ng-template>
        </formisch-field>

        <formisch-field [of]="form" [path]="['range']">
          <ng-template let-field>
            <app-slider
              [name]="field.props.name"
              [input]="field.input()"
              [errors]="field.errors()"
              label="Range"
              [fieldRef]="field.props.ref"
              (fieldFocus)="field.props.onFocus($event)"
              (fieldInput)="field.props.onInput($event)"
              (fieldChange)="field.props.onChange($event)"
              (fieldBlur)="field.props.onBlur($event)"
            />
          </ng-template>
        </formisch-field>

        <label
          class="block px-8 font-medium md:text-lg lg:mb-5 lg:px-10 lg:text-xl"
        >
          Checkbox array
        </label>

        <div
          class="mx-8 flex flex-wrap gap-6 rounded-2xl border-2 border-slate-200 p-6 lg:gap-10 lg:p-10 dark:border-slate-800"
        >
          @for (option of checkboxOptions; track option.value) {
            <formisch-field [of]="form" [path]="['checkbox', 'array']">
              <ng-template let-field>
                <app-checkbox
                  [name]="field.props.name"
                  [label]="option.label"
                  [value]="option.value"
                  [input]="field.input().includes(option.value)"
                  [errors]="field.errors()"
                  class="p-0!"
                  [fieldRef]="field.props.ref"
                  (fieldFocus)="field.props.onFocus($event)"
                  (fieldInput)="field.props.onInput($event)"
                  (fieldChange)="field.props.onChange($event)"
                  (fieldBlur)="field.props.onBlur($event)"
                />
              </ng-template>
            </formisch-field>
          }
        </div>

        <formisch-field [of]="form" [path]="['checkbox', 'boolean']">
          <ng-template let-field>
            <app-checkbox
              [name]="field.props.name"
              [input]="field.input()"
              [errors]="field.errors()"
              label="Checkbox boolean"
              [fieldRef]="field.props.ref"
              (fieldFocus)="field.props.onFocus($event)"
              (fieldInput)="field.props.onInput($event)"
              (fieldChange)="field.props.onChange($event)"
              (fieldBlur)="field.props.onBlur($event)"
            />
          </ng-template>
        </formisch-field>

        <formisch-field [of]="form" [path]="['radio']">
          <ng-template let-field>
            <app-radio-group
              [name]="field.props.name"
              label="Radio group"
              [options]="radioOptions"
              [input]="field.input()"
              [errors]="field.errors()"
              [fieldRef]="field.props.ref"
              (fieldFocus)="field.props.onFocus($event)"
              (fieldInput)="field.props.onInput($event)"
              (fieldChange)="field.props.onChange($event)"
              (fieldBlur)="field.props.onBlur($event)"
            />
          </ng-template>
        </formisch-field>

        <formisch-field [of]="form" [path]="['select', 'array']">
          <ng-template let-field>
            <app-select
              [name]="field.props.name"
              [input]="field.input()"
              [options]="selectOptions"
              [errors]="field.errors()"
              label="Select array"
              [multiple]="true"
              [fieldRef]="field.props.ref"
              (fieldFocus)="field.props.onFocus($event)"
              (fieldInput)="field.props.onInput($event)"
              (fieldChange)="field.props.onChange($event)"
              (fieldBlur)="field.props.onBlur($event)"
            />
          </ng-template>
        </formisch-field>

        <formisch-field [of]="form" [path]="['select', 'string']">
          <ng-template let-field>
            <app-select
              [name]="field.props.name"
              [input]="field.input()"
              [options]="selectOptions"
              [errors]="field.errors()"
              label="Select string"
              [fieldRef]="field.props.ref"
              (fieldFocus)="field.props.onFocus($event)"
              (fieldInput)="field.props.onInput($event)"
              (fieldChange)="field.props.onChange($event)"
              (fieldBlur)="field.props.onBlur($event)"
            />
          </ng-template>
        </formisch-field>

        <formisch-field [of]="form" [path]="['file', 'list']">
          <ng-template let-field>
            <app-file-input
              [name]="field.props.name"
              [input]="field.input()"
              [errors]="field.errors()"
              label="File list"
              [multiple]="true"
              [fieldRef]="field.props.ref"
              (fieldFocus)="field.props.onFocus($event)"
              (fieldInput)="field.props.onInput($event)"
              (fieldChange)="field.props.onChange($event)"
              (fieldBlur)="field.props.onBlur($event)"
            />
          </ng-template>
        </formisch-field>

        <formisch-field [of]="form" [path]="['file', 'item']">
          <ng-template let-field>
            <app-file-input
              [name]="field.props.name"
              [input]="field.input()"
              [errors]="field.errors()"
              label="File item"
              [fieldRef]="field.props.ref"
              (fieldFocus)="field.props.onFocus($event)"
              (fieldInput)="field.props.onInput($event)"
              (fieldChange)="field.props.onChange($event)"
              (fieldBlur)="field.props.onBlur($event)"
            />
          </ng-template>
        </formisch-field>
      </div>

      <app-form-footer [of]="form" />
    </formisch-form>
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

  readonly handleSubmit = (output: v.InferOutput<typeof SpecialFormSchema>) => {
    console.log(output);
  };
}
