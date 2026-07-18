import {
  afterRenderEffect,
  computed,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  type InputSignal,
  type Signal,
} from '@angular/core';
import type { FieldElement } from '@formisch/core/angular';
import { CONTROL, type FieldControl } from '../../types/control.ts';
import type { FieldStore } from '../../types/index.ts';
import { setElementInput } from '../../utils/index.ts';

/**
 * Binds a native form control to a field. Writes the field input into the
 * element, wires the element name, the `aria-invalid` attribute, and the
 * input/change/focus/blur handlers, and registers the element so features
 * like focusing the first invalid field on submit work.
 *
 * ```html
 * <input [formischControl]="field" />
 * ```
 */
@Directive({
  selector: '[formischControl]',
  standalone: true,
  exportAs: 'formischControl',
  host: {
    '[attr.name]': 'fieldName()',
    '[attr.aria-invalid]': 'fieldInvalid()',
    '(input)': 'control().onInput($event)',
    '(change)': 'control().onChange()',
    '(focus)': 'control().onFocus()',
    '(blur)': 'control().onBlur()',
  },
})
export class FormischControl {
  /**
   * The field store to bind to the host element.
   */
  readonly formischControl: InputSignal<FieldStore> =
    input.required<FieldStore>();

  protected readonly fieldName: Signal<string> = computed(() =>
    this.formischControl().name()
  );
  protected readonly fieldInvalid: Signal<boolean> = computed(
    () => !!this.formischControl().errors()
  );
  protected readonly control: Signal<FieldControl> = computed(
    () => this.formischControl()[CONTROL]
  );

  private readonly elementRef = inject<ElementRef<FieldElement>>(ElementRef);

  constructor() {
    // Register the host element with the field, re-registering whenever the
    // bound field changes and unregistering on cleanup/destroy.
    effect((onCleanup) => {
      const cleanup = this.formischControl()[CONTROL].ref(
        this.elementRef.nativeElement
      );
      if (cleanup) {
        onCleanup(cleanup);
      }
    });

    // Write the field input into the element after each render in which the
    // input or the bound field changed. Runs in the write phase because
    // sibling DOM such as select options must be rendered first.
    afterRenderEffect({
      write: () => {
        setElementInput(
          this.elementRef.nativeElement,
          this.formischControl().input()
        );
      },
    });
  }
}
