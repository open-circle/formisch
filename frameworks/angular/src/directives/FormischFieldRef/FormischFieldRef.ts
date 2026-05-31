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
import type { FieldElementProps } from '../../types/index.ts';

/**
 * Registers the host element with a field via its `ref` callback so that
 * element-based features such as focusing the first invalid field on submit
 * work as expected. Apply it to the native form control and pass the field's
 * `ref`:
 *
 * ```html
 * <input [formischFieldRef]="field.props.ref" />
 * ```
 */
@Directive({
  selector: '[formischFieldRef]',
  standalone: true,
})
export class FormischFieldRef {
  /**
   * The `ref` callback of a field's `props`.
   */
  readonly formischFieldRef: InputSignal<FieldElementProps['ref'] | undefined> =
    input<FieldElementProps['ref']>();

  private readonly elementRef = inject<ElementRef<FieldElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const ref = this.formischFieldRef();
      if (ref) {
        const cleanup = ref(this.elementRef.nativeElement);
        if (cleanup) {
          this.destroyRef.onDestroy(cleanup);
        }
      }
    });
  }
}
