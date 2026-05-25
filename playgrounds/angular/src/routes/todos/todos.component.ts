import { Component } from '@angular/core';
import * as v from 'valibot';
import {
  FormischForm,
  FormischField,
  FormischFieldArray,
  insert,
  remove,
  injectForm,
} from '@formisch/angular';
import { FormHeaderComponent } from '../../components/form-header.component.ts';
import { FormFooterComponent } from '../../components/form-footer.component.ts';
import { TextInputComponent } from '../../components/text-input.component.ts';

const TodosSchema = v.object({
  heading: v.pipe(
    v.string('Please enter a heading.'),
    v.nonEmpty('Please enter a heading.')
  ),
  todos: v.pipe(
    v.array(
      v.object({
        label: v.pipe(
          v.string('Please enter a label.'),
          v.nonEmpty('Please enter a label.')
        ),
        deadline: v.pipe(
          v.string('Please enter a deadline.'),
          v.nonEmpty('Please enter a deadline.')
        ),
      })
    ),
    v.nonEmpty('Please add at least one todo.'),
    v.maxLength(4, 'You can only add up to 4 todos.')
  ),
});

@Component({
  selector: 'app-todos',
  standalone: true,
  imports: [
    FormischForm,
    FormischField,
    FormischFieldArray,
    FormHeaderComponent,
    FormFooterComponent,
    TextInputComponent,
  ],
  template: `
    <formisch-form
      [of]="form"
      [submitFn]="handleSubmit"
      class="space-y-12 md:space-y-14 lg:space-y-16"
    >
      <app-form-header [of]="form" heading="Todo form" />

      <div class="space-y-8 md:space-y-10 lg:space-y-12">
        <formisch-field [of]="form" [path]="['heading']">
          <ng-template let-field>
            <app-text-input
              [name]="field.props.name"
              [value]="field.input()"
              [errors]="field.errors()"
              type="text"
              label="Heading"
              placeholder="Shopping list"
              [required]="true"
              (fieldFocus)="field.props.onFocus($event)"
              (fieldChange)="field.props.onChange($event)"
              (fieldBlur)="field.props.onBlur($event)"
            />
          </ng-template>
        </formisch-field>

        <formisch-field-array [of]="form" [path]="['todos']">
          <ng-template let-fieldArray>
            <div class="space-y-6 px-8 lg:px-10">
              <label class="mb-2 inline-block font-medium md:text-lg lg:text-xl">
                Todos
              </label>

              @if (fieldArray.errors()) {
                <div class="text-sm text-red-500 md:text-base lg:text-lg dark:text-red-400">
                  {{ fieldArray.errors()![0] }}
                </div>
              }

              @for (item of fieldArray.items(); track item; let i = $index) {
                <div class="flex gap-4">
                  <div class="flex-1 space-y-4">
                    <formisch-field [of]="form" [path]="['todos', i, 'label']">
                      <ng-template let-field>
                        <app-text-input
                          [name]="field.props.name"
                          [value]="field.input()"
                          [errors]="field.errors()"
                          type="text"
                          label="Label"
                          placeholder="Buy groceries"
                          [required]="true"
                          (fieldFocus)="field.props.onFocus($event)"
                          (fieldChange)="field.props.onChange($event)"
                          (fieldBlur)="field.props.onBlur($event)"
                        />
                      </ng-template>
                    </formisch-field>

                    <formisch-field [of]="form" [path]="['todos', i, 'deadline']">
                      <ng-template let-field>
                        <app-text-input
                          [name]="field.props.name"
                          [value]="field.input()"
                          [errors]="field.errors()"
                          type="date"
                          label="Deadline"
                          [required]="true"
                          (fieldFocus)="field.props.onFocus($event)"
                          (fieldChange)="field.props.onChange($event)"
                          (fieldBlur)="field.props.onBlur($event)"
                        />
                      </ng-template>
                    </formisch-field>
                  </div>

                  <button
                    type="button"
                    class="mt-8 self-start rounded-xl bg-red-600/10 px-3 py-2 text-sm text-red-600 hover:bg-red-600/20 dark:bg-red-400/10 dark:text-red-400 dark:hover:bg-red-400/20"
                    (click)="handleRemove(i)"
                  >
                    Remove
                  </button>
                </div>
              }

              <button
                type="button"
                class="rounded-xl bg-sky-600/10 px-4 py-2 text-sm text-sky-600 hover:bg-sky-600/20 dark:bg-sky-400/10 dark:text-sky-400 dark:hover:bg-sky-400/20"
                (click)="handleInsert()"
              >
                Add todo
              </button>
            </div>
          </ng-template>
        </formisch-field-array>
      </div>

      <app-form-footer [of]="form" />
    </formisch-form>
  `,
})
export class TodosComponent {
  readonly form = injectForm({
    schema: TodosSchema,
    validate: 'blur',
    initialInput: {
      heading: '',
      todos: [{ label: '', deadline: '' }],
    },
  });

  readonly handleSubmit = (output: v.InferOutput<typeof TodosSchema>) => {
    console.log(output);
  };

  handleInsert(): void {
    insert(this.form, { path: ['todos'], initialInput: { label: '', deadline: '' } });
  }

  handleRemove(index: number): void {
    remove(this.form, { path: ['todos'], at: index });
  }
}
