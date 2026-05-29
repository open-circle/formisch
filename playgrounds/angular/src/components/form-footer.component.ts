import { Component, input } from '@angular/core';
import { reset, type FormStore } from '@formisch/angular';
import { ActionButtonComponent } from './action-button.component.ts';

/**
 * Form footer with buttons to reset and submit the form.
 */
@Component({
  selector: 'app-form-footer',
  standalone: true,
  imports: [ActionButtonComponent],
  template: `
    <footer class="flex space-x-6 px-8 md:space-x-8 lg:hidden">
      <app-action-button variant="primary" label="Submit" type="submit" />
      <app-action-button
        variant="secondary"
        label="Reset"
        type="button"
        (clicked)="handleReset()"
      />
    </footer>
  `,
})
export class FormFooterComponent {
  readonly of = input.required<FormStore>();

  protected handleReset(): void {
    reset(this.of());
  }
}
