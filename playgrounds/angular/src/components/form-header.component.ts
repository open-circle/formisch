import { Component, input } from '@angular/core';
import { reset, type FormStore } from '@formisch/angular';
import { ActionButtonComponent } from './action-button.component.ts';

/**
 * Form header with heading and buttons to reset and submit the form.
 */
@Component({
  selector: 'app-form-header',
  standalone: true,
  imports: [ActionButtonComponent],
  template: `
    <header class="flex items-center justify-between px-8 lg:px-10">
      <h1 class="text-2xl text-slate-900 md:text-3xl lg:text-4xl dark:text-slate-200">
        {{ heading() }}
      </h1>
      <div class="hidden lg:flex lg:space-x-8">
        <app-action-button
          variant="secondary"
          label="Reset"
          type="button"
          (clicked)="handleReset()"
        />
        <app-action-button variant="primary" label="Submit" type="submit" />
      </div>
    </header>
  `,
})
export class FormHeaderComponent {
  readonly of = input.required<FormStore>();
  readonly heading = input.required<string>();

  protected handleReset(): void {
    reset(this.of());
  }
}
