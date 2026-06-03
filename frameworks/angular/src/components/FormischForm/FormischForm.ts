import {
  afterNextRender,
  afterRenderEffect,
  Component,
  ElementRef,
  inject,
  input,
  type InputSignal,
  viewChild,
} from '@angular/core';
import {
  type FormSchema,
  INTERNAL,
  type SubmitEventHandler,
} from '@formisch/core/angular';
import { handleSubmit } from '@formisch/methods/angular';
import type { FormStore } from '../../types/index.ts';

/**
 * Form component that manages form submission and registers the form element.
 * Wraps the native form element and delegates submission to handleSubmit.
 *
 * @example
 * ```html
 * <formisch-form [of]="form" [submitFn]="handleSubmit">
 *   ...
 * </formisch-form>
 * ```
 */
@Component({
  selector: 'formisch-form',
  standalone: true,
  // Render no box of its own so the inner `<form>` becomes the effective
  // element in the layout, matching the other framework wrappers.
  styles: ':host { display: contents; }',
  template: `<form #formEl novalidate (submit)="handleFormSubmit($event)">
    <ng-content />
  </form>`,
})
export class FormischForm<TSchema extends FormSchema = FormSchema> {
  readonly of: InputSignal<FormStore<TSchema>> =
    input.required<FormStore<TSchema>>();
  readonly submitFn: InputSignal<SubmitEventHandler<TSchema>> =
    input.required<SubmitEventHandler<TSchema>>();

  private readonly hostEl = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly formEl = viewChild.required<ElementRef<HTMLFormElement>>('formEl');

  constructor() {
    const ofSignal = this.of;
    const hostEl = this.hostEl;
    const formEl = this.formEl;

    // Register the inner form element with the store once after first render.
    afterNextRender({
      write: () => {
        ofSignal()[INTERNAL].element = formEl().nativeElement;
      },
    });

    // Forward classes from the host to the inner <form> after every render so
    // layout utilities (e.g. Tailwind space-y-*) applied to <formisch-form>
    // affect the form's children rather than the invisible host element.
    afterRenderEffect({
      earlyRead: () => hostEl.nativeElement.className,
      write: (classNameSignal) => {
        const className = classNameSignal();
        if (className) {
          formEl().nativeElement.className = className;
          hostEl.nativeElement.removeAttribute('class');
        }
      },
    });
  }

  protected handleFormSubmit(event: SubmitEvent): void {
    void handleSubmit(this.of(), this.submitFn())(event);
  }
}
