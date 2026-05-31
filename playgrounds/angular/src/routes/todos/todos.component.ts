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
import { InputErrorsComponent } from '../../components/input-errors.component.ts';
import { InputLabelComponent } from '../../components/input-label.component.ts';
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
    AutoAnimateDirective,
    FormHeaderComponent,
    FormFooterComponent,
    TextInputComponent,
    InputLabelComponent,
    InputErrorsComponent,
    ColorButtonComponent,
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
              [fieldRef]="field.props.ref"
              (fieldFocus)="field.props.onFocus($event)"
              (fieldInput)="field.props.onInput($event)"
              (fieldChange)="field.props.onChange($event)"
              (fieldBlur)="field.props.onBlur($event)"
            />
          </ng-template>
        </formisch-field>

        <formisch-field-array [of]="form" [path]="['todos']">
          <ng-template let-fieldArray>
            <div class="space-y-5 px-8 lg:px-10">
              <app-input-label label="Todos" margin="none" [required]="true" />

              <div>
                <div auto-animate class="space-y-5">
                  @for (
                    item of fieldArray.items();
                    track item;
                    let index = $index
                  ) {
                    <div
                      class="flex flex-wrap gap-5 rounded-2xl border-2 border-slate-200 bg-slate-100/25 p-5 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/10 dark:hover:border-slate-700"
                    >
                      <formisch-field
                        [of]="form"
                        [path]="['todos', index, 'label']"
                        class="w-full md:w-auto md:flex-1"
                      >
                        <ng-template let-field>
                          <app-text-input
                            [name]="field.props.name"
                            [value]="field.input()"
                            [errors]="field.errors()"
                            type="text"
                            class="p-0!"
                            placeholder="Enter task"
                            [required]="true"
                            [fieldRef]="field.props.ref"
                            (fieldFocus)="field.props.onFocus($event)"
                            (fieldInput)="field.props.onInput($event)"
                            (fieldChange)="field.props.onChange($event)"
                            (fieldBlur)="field.props.onBlur($event)"
                          />
                        </ng-template>
                      </formisch-field>

                      <formisch-field
                        [of]="form"
                        [path]="['todos', index, 'deadline']"
                        class="flex-1"
                      >
                        <ng-template let-field>
                          <app-text-input
                            [name]="field.props.name"
                            [value]="field.input()"
                            [errors]="field.errors()"
                            type="date"
                            class="p-0!"
                            [required]="true"
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
                        (clicked)="handleRemove(index)"
                      />
                    </div>
                  }
                </div>
                <app-input-errors name="todos" [errors]="fieldArray.errors()" />
              </div>

              <div class="flex flex-wrap gap-5">
                <app-color-button
                  color="green"
                  label="Add new"
                  (clicked)="handleInsert()"
                />
                <app-color-button
                  color="yellow"
                  label="Move first to end"
                  (clicked)="handleMoveFirstToEnd(fieldArray.items().length)"
                />
                <app-color-button
                  color="purple"
                  label="Swap first two"
                  (clicked)="handleSwapFirstTwo()"
                />
                <app-color-button
                  color="blue"
                  label="Replace first"
                  (clicked)="handleReplaceFirst()"
                />
              </div>
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
    initialInput: {
      heading: '',
      todos: [{ label: '', deadline: '' }],
    },
  });

  readonly handleSubmit = (output: v.InferOutput<typeof TodosSchema>) => {
    console.log(output);
  };

  handleInsert(): void {
    insert(this.form, {
      path: ['todos'],
      initialInput: { label: '', deadline: '' },
    });
  }

  handleRemove(index: number): void {
    remove(this.form, { path: ['todos'], at: index });
  }

  handleMoveFirstToEnd(length: number): void {
    move(this.form, { path: ['todos'], from: 0, to: length - 1 });
  }

  handleSwapFirstTwo(): void {
    swap(this.form, { path: ['todos'], at: 0, and: 1 });
  }

  handleReplaceFirst(): void {
    replace(this.form, {
      path: ['todos'],
      at: 0,
      initialInput: {
        label: Math.random().toString(36).slice(2),
        deadline: new Date().toISOString().split('T')[0],
      },
    });
  }
}
