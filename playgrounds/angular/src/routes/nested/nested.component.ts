import { Component } from '@angular/core';
import {
  FormischField,
  FormischFieldArray,
  FormischForm,
  injectForm,
  insert,
  move,
  remove,
  replace,
  swap,
} from '@formisch/angular';
import * as v from 'valibot';
import { AutoAnimateDirective } from '../../components/auto-animate.directive.ts';
import { ColorButtonComponent } from '../../components/color-button.component.ts';
import { FormFooterComponent } from '../../components/form-footer.component.ts';
import { FormHeaderComponent } from '../../components/form-header.component.ts';
import { TextInputComponent } from '../../components/text-input.component.ts';

const NestedFormSchema = v.object({
  items: v.array(
    v.object({
      label: v.optional(v.string()),
      options: v.array(v.optional(v.string())),
    })
  ),
});

@Component({
  selector: 'app-nested',
  standalone: true,
  imports: [
    FormischForm,
    FormischField,
    FormischFieldArray,
    AutoAnimateDirective,
    FormHeaderComponent,
    FormFooterComponent,
    TextInputComponent,
    ColorButtonComponent,
  ],
  template: `
    <formisch-form
      [of]="form"
      [submitFn]="handleSubmit"
      class="space-y-12 md:space-y-14 lg:space-y-16"
    >
      <app-form-header [of]="form" heading="Nested form" />

      <formisch-field-array [of]="form" [path]="['items']">
        <ng-template let-fieldArray>
          <div class="space-y-7 px-8 lg:px-10">
            <div auto-animate class="space-y-5">
              @for (
                item of fieldArray.items();
                track item;
                let itemIndex = $index
              ) {
                <div
                  class="flex-1 space-y-5 rounded-2xl border-2 border-slate-200 bg-slate-100/25 py-6 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/10 dark:hover:border-slate-700"
                >
                  <div class="flex space-x-5 px-6">
                    <formisch-field
                      [of]="form"
                      [path]="['items', itemIndex, 'label']"
                      class="flex-1"
                    >
                      <ng-template let-field>
                        <app-text-input
                          [name]="field.props.name"
                          [value]="field.input()"
                          [errors]="field.errors()"
                          type="text"
                          class="p-0!"
                          placeholder="Enter item"
                          [fieldRef]="field.props.ref"
                          (fieldFocus)="field.props.onFocus($event)"
                          (fieldInput)="field.props.onInput($event)"
                          (fieldChange)="field.props.onChange($event)"
                          (fieldBlur)="field.props.onBlur($event)"
                        />
                      </ng-template>
                    </formisch-field>

                    <app-color-button
                      color="red"
                      label="Delete"
                      width="auto"
                      (clicked)="removeItem(itemIndex)"
                    />
                  </div>

                  <div
                    class="border-t-2 border-t-slate-200 dark:border-t-slate-800"
                    role="separator"
                  ></div>

                  <formisch-field-array
                    [of]="form"
                    [path]="['items', itemIndex, 'options']"
                  >
                    <ng-template let-optionsArray>
                      <div auto-animate class="space-y-5 px-6">
                        @for (
                          opt of optionsArray.items();
                          track opt;
                          let optionIndex = $index
                        ) {
                          <div class="flex space-x-5">
                            <formisch-field
                              [of]="form"
                              [path]="[
                                'items',
                                itemIndex,
                                'options',
                                optionIndex,
                              ]"
                              class="flex-1"
                            >
                              <ng-template let-field>
                                <app-text-input
                                  [name]="field.props.name"
                                  [value]="field.input()"
                                  [errors]="field.errors()"
                                  class="p-0!"
                                  type="text"
                                  placeholder="Enter option"
                                  [fieldRef]="field.props.ref"
                                  (fieldFocus)="field.props.onFocus($event)"
                                  (fieldInput)="field.props.onInput($event)"
                                  (fieldChange)="field.props.onChange($event)"
                                  (fieldBlur)="field.props.onBlur($event)"
                                />
                              </ng-template>
                            </formisch-field>

                            <app-color-button
                              color="red"
                              label="Delete"
                              width="auto"
                              (clicked)="removeOption(itemIndex, optionIndex)"
                            />
                          </div>
                        }

                        <div class="flex flex-wrap gap-4">
                          <app-color-button
                            color="green"
                            label="Add option"
                            (clicked)="addOption(itemIndex)"
                          />
                          <app-color-button
                            color="yellow"
                            label="Move first to end"
                            (clicked)="
                              moveOptionFirstToEnd(
                                itemIndex,
                                optionsArray.items().length
                              )
                            "
                          />
                          <app-color-button
                            color="purple"
                            label="Swap first two"
                            (clicked)="swapOptionsFirstTwo(itemIndex)"
                          />
                        </div>
                      </div>
                    </ng-template>
                  </formisch-field-array>
                </div>
              }
            </div>

            <div class="flex flex-wrap gap-4">
              <app-color-button
                color="green"
                label="Add item"
                (clicked)="addItem()"
              />
              <app-color-button
                color="yellow"
                label="Move first to end"
                (clicked)="moveItemFirstToEnd(fieldArray.items().length)"
              />
              <app-color-button
                color="purple"
                label="Swap first two"
                (clicked)="swapItemsFirstTwo()"
              />
              <app-color-button
                color="blue"
                label="Replace first"
                (clicked)="replaceFirst()"
              />
            </div>
          </div>
        </ng-template>
      </formisch-field-array>

      <app-form-footer [of]="form" />
    </formisch-form>
  `,
})
export class NestedComponent {
  readonly form = injectForm({
    schema: NestedFormSchema,
    initialInput: {
      items: [
        { label: 'Item 1', options: ['Option 1', 'Option 2'] },
        { label: 'Item 2', options: ['Option 1', 'Option 2'] },
      ],
    },
  });

  readonly handleSubmit = (output: v.InferOutput<typeof NestedFormSchema>) => {
    console.log(output);
  };

  addItem(): void {
    insert(this.form, {
      path: ['items'],
      initialInput: { label: '', options: [''] },
    });
  }

  moveItemFirstToEnd(length: number): void {
    move(this.form, { path: ['items'], from: 0, to: length - 1 });
  }

  swapItemsFirstTwo(): void {
    swap(this.form, { path: ['items'], at: 0, and: 1 });
  }

  replaceFirst(): void {
    replace(this.form, {
      path: ['items'],
      at: 0,
      initialInput: { label: '', options: [''] },
    });
  }

  removeItem(index: number): void {
    remove(this.form, { path: ['items'], at: index });
  }

  addOption(itemIndex: number): void {
    insert(this.form, {
      path: ['items', itemIndex, 'options'],
      initialInput: '',
    });
  }

  moveOptionFirstToEnd(itemIndex: number, length: number): void {
    move(this.form, {
      path: ['items', itemIndex, 'options'],
      from: 0,
      to: length - 1,
    });
  }

  swapOptionsFirstTwo(itemIndex: number): void {
    swap(this.form, { path: ['items', itemIndex, 'options'], at: 0, and: 1 });
  }

  removeOption(itemIndex: number, optionIndex: number): void {
    remove(this.form, {
      path: ['items', itemIndex, 'options'],
      at: optionIndex,
    });
  }
}
