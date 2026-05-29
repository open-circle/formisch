import { Component, input } from '@angular/core';
import clsx from 'clsx';

/**
 * Input label for a form field.
 */
@Component({
  selector: 'app-input-label',
  standalone: true,
  template: `
    @if (label()) {
      @let labelClass = labelClasses();
      @if (component() === 'legend') {
        <legend [class]="labelClass">
          {{ label() }}
          @if (required()) {
            <span class="ml-1 text-red-600 dark:text-red-400">*</span>
          }
        </legend>
      } @else if (name()) {
        <label [for]="name()" [class]="labelClass">
          {{ label() }}
          @if (required()) {
            <span class="ml-1 text-red-600 dark:text-red-400">*</span>
          }
        </label>
      } @else {
        <div [class]="labelClass">
          {{ label() }}
          @if (required()) {
            <span class="ml-1 text-red-600 dark:text-red-400">*</span>
          }
        </div>
      }
    }
  `,
})
export class InputLabelComponent {
  readonly component = input<'label' | 'legend' | 'div'>();
  readonly name = input<string>();
  readonly label = input<string>();
  readonly required = input<boolean>(false);
  readonly margin = input<'none'>();

  protected readonly labelClasses = () =>
    clsx(
      'inline-block font-medium md:text-lg lg:text-xl',
      this.margin() !== 'none' && 'mb-4 lg:mb-5'
    );
}
