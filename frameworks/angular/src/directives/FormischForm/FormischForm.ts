import {
  afterNextRender,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  type InputSignal,
  output,
  type OutputEmitterRef,
} from '@angular/core';
import { type FormSchema, INTERNAL } from '@formisch/core/angular';
import { handleSubmit } from '@formisch/methods/angular';
import type * as v from 'valibot';
import type { FormStore } from '../../types/index.ts';

/**
 * Turns a native `<form>` into a Formisch-managed form. Validates the input on
 * submit, focuses the first invalid field, registers the form element, and
 * disables native browser validation.
 *
 * ```html
 * <form [formischForm]="form" (formischSubmit)="onSubmit($event)">…</form>
 * ```
 */
@Directive({
  selector: 'form[formischForm]',
  standalone: true,
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
   * Emits the validated form output when submission succeeds.
   */
  readonly formischSubmit: OutputEmitterRef<v.InferOutput<TSchema>> =
    output<v.InferOutput<TSchema>>();

  private readonly elementRef = inject<ElementRef<HTMLFormElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      this.formischForm()[INTERNAL].element = this.elementRef.nativeElement;
    });
    this.destroyRef.onDestroy(() => {
      this.formischForm()[INTERNAL].element = undefined;
    });
  }

  protected handleFormSubmit(event: SubmitEvent): void {
    event.preventDefault();
    void handleSubmit(this.formischForm(), (output: v.InferOutput<TSchema>) => {
      this.formischSubmit.emit(output);
    })();
  }
}
