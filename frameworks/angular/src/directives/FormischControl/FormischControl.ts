import {
  afterRenderEffect,
  computed,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  type InputSignal,
  type Signal,
} from '@angular/core';
import type {
  FieldElement,
  FormSchema,
  RequiredPath,
} from '@formisch/core/angular';
import { CONTROL, type FieldControl } from '../../types/control.ts';
import type { FieldStore } from '../../types/index.ts';
import { observeSelectMutations, setElementInput } from '../../utils/index.ts';

/**
 * Binds a native form control to a field. Writes the field input into the
 * element, wires the element name, the `aria-invalid` attribute, and the
 * input/change/focus/blur handlers, and registers the element so features
 * like focusing the first invalid field on submit work.
 *
 * ```html
 * <input [formischControl]="field" />
 * ```
 *
 * The element is written to, so it must not also be bound with `[value]` or
 * `[checked]`. Radio and checkbox groups bind every element of the group to
 * the same field, each with its own `value` attribute.
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
export class FormischControl<
  TSchema extends FormSchema = FormSchema,
  TFieldPath extends RequiredPath = RequiredPath,
> {
  /**
   * The field store to bind to the host element. Both type arguments are
   * inferred from it, which keeps the field's value type intact — a directive
   * or component that widens this to the default `FieldStore` cannot accept
   * any concrete field, because `setInput` makes the store invariant.
   */
  readonly formischControl: InputSignal<FieldStore<TSchema, TFieldPath>> =
    input.required<FieldStore<TSchema, TFieldPath>>();

  /**
   * The JSON-stringified field path, bound to the element's name attribute.
   */
  protected readonly fieldName: Signal<string> = computed(() =>
    this.formischControl().name()
  );
  /**
   * Whether the field currently has errors, bound to `aria-invalid`.
   */
  protected readonly fieldInvalid: Signal<boolean> = computed(
    () => !!this.formischControl().errors()
  );
  /**
   * The field's element-binding contract, used by the host event handlers.
   */
  protected readonly control: Signal<FieldControl> = computed(
    () => this.formischControl()[CONTROL]
  );

  private readonly elementRef = inject<ElementRef<FieldElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    // Register the host element with the field and unregister it on cleanup or
    // destroy. `ref` reads the field's resolved store while this effect runs,
    // so the effect also re-runs when only the field's path changed and the
    // bound store object stayed the same — which is what keeps the element
    // registered on the right store when a field array is reordered. Do not
    // hoist or memoize the `ref` call out of the effect body: that would drop
    // the dependency and silently leave the element on the previous store.
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

    // A select ignores values written before the matching option exists, so
    // re-apply the field input when option elements render or change later
    const element = this.elementRef.nativeElement;
    if (element.tagName === 'SELECT') {
      const cleanup = observeSelectMutations(element as HTMLSelectElement, () =>
        setElementInput(element, this.formischControl().input())
      );
      if (cleanup) {
        this.destroyRef.onDestroy(cleanup);
      }
    }
  }
}
