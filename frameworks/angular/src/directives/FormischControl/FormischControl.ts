import {
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

/**
 * Binds a native form control to a field. Wires the element name, the
 * input/change/focus/blur handlers, and registers the element so features like
 * focusing the first invalid field on submit work.
 *
 * ```html
 * <input [value]="field.input()" [formischControl]="field" />
 * ```
 */
@Directive({
  selector: '[formischControl]',
  standalone: true,
  host: {
    '[attr.name]': 'fieldName()',
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
  }
}
