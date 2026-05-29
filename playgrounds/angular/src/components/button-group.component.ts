import { Component, input } from '@angular/core';
import clsx from 'clsx';

/**
 * Button group displays multiple related actions side-by-side.
 */
@Component({
  selector: 'app-button-group',
  standalone: true,
  template: `
    <div [class]="classes()">
      <ng-content />
    </div>
  `,
})
export class ButtonGroupComponent {
  readonly class = input<string>('');

  protected readonly classes = () =>
    clsx('flex flex-wrap gap-6 px-8 lg:gap-8 lg:px-10', this.class());
}
