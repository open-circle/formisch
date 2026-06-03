import {
  afterNextRender,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  type InputSignal,
} from '@angular/core';
import type { FieldElement } from '@formisch/core/angular';
import type { FieldStore } from '../../types/index.ts';

/**
 * Registers a focusable element with its field store and wires all event
 * handlers automatically.
 *
 * Apply this directive to any focusable native element inside a
 * `<formisch-field>` template. It sets the `name` attribute, handles
 * `focus`, `input`, `change`, and `blur` events, and registers the element
 * for focus management methods such as `focusField`.
 *
 * @example
 * ```html
 * <formisch-field [of]="form" [path]="['email']">
 *   <ng-template let-field>
 *     <input [formischFieldElement]="field" [value]="field.input()" />
 *   </ng-template>
 * </formisch-field>
 * ```
 */
@Directive({
  selector: '[formischFieldElement]',
  standalone: true,
  host: {
    '[attr.name]': 'formischFieldElement().name',
    '(focus)': 'formischFieldElement().onFocus($event)',
    '(input)': 'formischFieldElement().onChange($event)',
    '(change)': 'formischFieldElement().onChange($event)',
    '(blur)': 'formischFieldElement().onBlur($event)',
  },
})
export class FormischFieldElementDirective {
  readonly formischFieldElement: InputSignal<FieldStore> =
    input.required<FieldStore>();

  constructor() {
    const el = inject<ElementRef<FieldElement>>(ElementRef);
    const destroyRef = inject(DestroyRef);
    const fieldSignal = this.formischFieldElement;

    afterNextRender({
      write: () => {
        const cleanup = fieldSignal().registerElement(el.nativeElement);
        destroyRef.onDestroy(cleanup);
      },
    });
  }
}
