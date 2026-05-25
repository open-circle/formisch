import { Component, input } from '@angular/core';
import { reset, type FormStore } from '@formisch/angular';

@Component({
  selector: 'app-form-footer',
  standalone: true,
  template: `
    <footer class="flex space-x-6 px-8 md:space-x-8 lg:hidden">
      <button
        type="submit"
        class="relative flex cursor-pointer items-center justify-center rounded-2xl px-5 py-2.5 font-medium no-underline transition-colors bg-sky-600 text-white hover:bg-sky-600/80 md:text-lg lg:rounded-2xl lg:px-6 lg:py-3 lg:text-xl dark:bg-sky-400 dark:text-gray-900 dark:hover:bg-sky-400/80"
      >
        Submit
      </button>
      <button
        type="button"
        class="relative flex cursor-pointer items-center justify-center rounded-2xl px-5 py-2.5 font-medium no-underline transition-colors bg-sky-600/10 text-sky-600 hover:bg-sky-600/20 md:text-lg lg:rounded-2xl lg:px-6 lg:py-3 lg:text-xl dark:bg-sky-400/10 dark:text-sky-400 dark:hover:bg-sky-400/20"
        (click)="handleReset()"
      >
        Reset
      </button>
    </footer>
  `,
})
export class FormFooterComponent {
  readonly of = input.required<FormStore>();

  protected handleReset(): void {
    reset(this.of());
  }
}
