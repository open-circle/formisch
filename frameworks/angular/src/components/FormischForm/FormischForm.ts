import {
  afterNextRender,
  Component,
  ElementRef,
  inject,
  input,
  type InputSignal,
} from '@angular/core';
import {
  INTERNAL,
  type Schema,
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
  template: `<form novalidate (submit)="handleFormSubmit($event)"><ng-content /></form>`,
})
export class FormischForm<TSchema extends Schema = Schema> {
  readonly of: InputSignal<FormStore<TSchema>> = input.required<FormStore<TSchema>>();
  readonly submitFn: InputSignal<SubmitEventHandler<TSchema>> = input.required<SubmitEventHandler<TSchema>>();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  private readonly hostEl: ElementRef<HTMLElement> = inject(ElementRef);

  constructor() {
    afterNextRender(() => {
      const formElement =
        this.hostEl.nativeElement.querySelector<HTMLFormElement>('form');
      if (formElement) {
        this.of()[INTERNAL].element = formElement;
      }
    });
  }

  protected handleFormSubmit(event: SubmitEvent): void {
    void handleSubmit(this.of(), this.submitFn())(event);
  }
}
