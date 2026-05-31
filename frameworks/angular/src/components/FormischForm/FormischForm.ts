import {
  afterNextRender,
  Component,
  ElementRef,
  inject,
  input,
  type InputSignal,
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
  template: `<form novalidate (submit)="handleFormSubmit($event)">
    <ng-content />
  </form>`,
})
export class FormischForm<TSchema extends FormSchema = FormSchema> {
  readonly of: InputSignal<FormStore<TSchema>> =
    input.required<FormStore<TSchema>>();
  readonly submitFn: InputSignal<SubmitEventHandler<TSchema>> =
    input.required<SubmitEventHandler<TSchema>>();

  private readonly hostEl = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    afterNextRender(() => {
      const hostElement = this.hostEl.nativeElement;
      const formElement = hostElement.querySelector<HTMLFormElement>('form');
      if (formElement) {
        this.of()[INTERNAL].element = formElement;
        // Forward classes from the host to the actual `<form>` element so
        // layout utilities (e.g. `space-y`) apply to the form's children
        // instead of the host, which renders no box of its own.
        if (hostElement.className) {
          formElement.className = hostElement.className;
          hostElement.removeAttribute('class');
        }
      }
    });
  }

  protected handleFormSubmit(event: SubmitEvent): void {
    void handleSubmit(this.of(), this.submitFn())(event);
  }
}
