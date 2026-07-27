import {
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  type InputSignal,
  PendingTasks,
} from '@angular/core';
import {
  type FormSchema,
  INTERNAL,
  type SubmitEventHandler,
} from '@formisch/core/angular';
import { handleSubmit } from '@formisch/methods/angular';
import type { FormStore } from '../../types/index.ts';

/**
 * Turns a native `<form>` into a Formisch-managed form. Validates the input on
 * submit, focuses the first invalid field, registers the form element, and
 * disables native browser validation.
 *
 * ```html
 * <form [formischForm]="form" [formischSubmit]="onSubmit">…</form>
 * ```
 */
@Directive({
  selector: 'form[formischForm]',
  standalone: true,
  exportAs: 'formischForm',
  host: {
    novalidate: '',
    '(submit)': 'handleFormSubmit($event)',
  },
})
export class FormischForm<TSchema extends FormSchema = FormSchema> {
  /**
   * The form store to manage.
   */
  readonly formischForm: InputSignal<FormStore<TSchema>> =
    input.required<FormStore<TSchema>>();
  /**
   * The submit handler called when validation succeeds. It is passed as a
   * function reference rather than invoked in the template, so that the
   * promise it returns can be awaited to track `isSubmitting`. Declare it as
   * an arrow function property — a regular method would lose its `this`.
   */
  readonly formischSubmit: InputSignal<SubmitEventHandler<TSchema>> =
    input.required<SubmitEventHandler<TSchema>>();

  private readonly elementRef = inject<ElementRef<HTMLFormElement>>(ElementRef);
  private readonly pendingTasks = inject(PendingTasks);

  constructor() {
    effect((onCleanup) => {
      const form = this.formischForm();
      const element = this.elementRef.nativeElement;
      form[INTERNAL].element = element;
      onCleanup(() => {
        if (form[INTERNAL].element === element) {
          form[INTERNAL].element = undefined;
        }
      });
    });
  }

  protected handleFormSubmit(event: SubmitEvent): void {
    // The inputs are read before the task is registered so that a throw while
    // reading them cannot leave the application permanently unstable
    const submit = handleSubmit(this.formischForm(), this.formischSubmit());
    const cleanup = this.pendingTasks.add();
    void submit(event).finally(cleanup);
  }
}
