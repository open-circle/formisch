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
    <form
      [formischForm]="form"
      [formischSubmit]="handleSubmit"
      class="space-y-12 md:space-y-14 lg:space-y-16"
    >
      <app-form-header [form]="form" heading="Nested form" />

      <ng-container *formischFieldArray="['items'] of form; let fieldArray">
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
                  <ng-container
                    *formischField="
                      ['items', itemIndex, 'label'] of form;
                      let field
                    "
                  >
                    <app-text-input
                      [field]="field"
                      type="text"
                      class="flex-1 p-0!"
                      placeholder="Enter item"
                    />
                  </ng-container>

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

                <ng-container
                  *formischFieldArray="
                    ['items', itemIndex, 'options'] of form;
                    let optionsArray
                  "
                >
                  <div auto-animate class="space-y-5 px-6">
                    @for (
                      opt of optionsArray.items();
                      track opt;
                      let optionIndex = $index
                    ) {
                      <div class="flex space-x-5">
                        <ng-container
                          *formischField="
                            [
                              'items',
                              itemIndex,
                              'options',
                              optionIndex,
                            ] of form;
                            let field
                          "
                        >
                          <app-text-input
                            [field]="field"
                            type="text"
                            class="flex-1 p-0!"
                            placeholder="Enter option"
                          />
                        </ng-container>

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
                </ng-container>
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
      </ng-container>

      <app-form-footer [form]="form" />
    </form>
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

  readonly handleSubmit = (
    output: v.InferOutput<typeof NestedFormSchema>
  ): void => {
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
