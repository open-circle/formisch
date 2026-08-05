import {
  assertInInjectionContext,
  computed,
  DestroyRef,
  inject,
} from '@angular/core';
import {
  type FieldElement,
  type FormSchema,
  getElementInput,
  getFieldBool,
  getFieldInput,
  getFieldStore,
  INTERNAL,
  type RequiredPath,
  setFieldBool,
  setFieldInput,
  validateIfRequired,
  type ValidPath,
} from '@formisch/core/angular';
import type * as v from 'valibot';
import { CONTROL } from '../../types/control.ts';
import type {
  FieldStore,
  FormStore,
  SignalOrValue,
} from '../../types/index.ts';
import { readSignalOrValue } from '../../utils/index.ts';

/**
 * Inject field config interface.
 */
export interface InjectFieldConfig<
  TSchema extends FormSchema = FormSchema,
  TFieldPath extends RequiredPath = RequiredPath,
> {
  /**
   * The path to the field within the form schema.
   */
  readonly path: SignalOrValue<ValidPath<v.InferInput<TSchema>, TFieldPath>>;
}

/**
 * Creates a reactive field store for a specific field within a form store.
 * Exposes all reactive state as Angular Signals callable in templates.
 *
 * Must be called in an injection context (component constructor or field initializer).
 *
 * @param form The form store instance.
 * @param config The field configuration.
 *
 * @returns The field store with reactive Signal properties, a `setInput`
 *   method, and an element-binding contract for `[formischControl]`.
 */
export function injectField<
  TSchema extends FormSchema,
  TFieldPath extends RequiredPath,
>(
  form: SignalOrValue<FormStore<TSchema>>,
  config: InjectFieldConfig<TSchema, TFieldPath>
): FieldStore<TSchema, TFieldPath>;

// @__NO_SIDE_EFFECTS__
export function injectField(
  form: SignalOrValue<FormStore>,
  config: InjectFieldConfig
): FieldStore {
  assertInInjectionContext(injectField);

  const destroyRef = inject(DestroyRef);
  const path = computed(() => readSignalOrValue(config.path));
  const internalFormStore = computed(() => readSignalOrValue(form)[INTERNAL]);
  const internalFieldStore = computed(() =>
    getFieldStore(internalFormStore(), path())
  );

  destroyRef.onDestroy(() => {
    const fieldStore = internalFieldStore();
    const elements = fieldStore.elements.filter(
      (element) => element.isConnected
    );
    // Keep `initialElements` in sync while the store still owns it (same
    // reference) and filter it separately otherwise, so the detached element
    // of a removed array item does not survive in the reset baseline
    if (fieldStore.elements === fieldStore.initialElements) {
      fieldStore.initialElements = elements;
    } else {
      fieldStore.initialElements = fieldStore.initialElements.filter(
        (element) => element.isConnected
      );
    }
    fieldStore.elements = elements;
  });

  return {
    get path() {
      return path();
    },
    name: computed(() => internalFieldStore().name),
    input: computed(() => getFieldInput(internalFieldStore())),
    errors: computed(() => internalFieldStore().errors.value),
    isTouched: computed(() => getFieldBool(internalFieldStore(), 'isTouched')),
    isEdited: computed(() => getFieldBool(internalFieldStore(), 'isEdited')),
    isDirty: computed(() => getFieldBool(internalFieldStore(), 'isDirty')),
    isValid: computed(() => !getFieldBool(internalFieldStore(), 'errors')),
    setInput(value) {
      setFieldInput(internalFormStore(), path(), value);
      validateIfRequired(internalFormStore(), internalFieldStore(), 'input');
    },
    [CONTROL]: {
      ref(element) {
        if (element) {
          const fieldStore = internalFieldStore();
          // An array reorder transfers registered elements between the field
          // stores, so the element may already be present when the directive
          // re-registers it against the destination store
          if (!fieldStore.elements.includes(element)) {
            fieldStore.elements.push(element);
          }
          return () => {
            const elements = fieldStore.elements.filter(
              (currentElement) => currentElement !== element
            );
            // Keep `initialElements` in sync unless a reorder has moved the
            // elements (see the destroy cleanup above)
            if (fieldStore.elements === fieldStore.initialElements) {
              fieldStore.initialElements = elements;
            }
            fieldStore.elements = elements;
          };
        }
      },
      onInput(event) {
        setFieldInput(
          internalFormStore(),
          path(),
          getElementInput(event.target as FieldElement, internalFieldStore())
        );
        validateIfRequired(internalFormStore(), internalFieldStore(), 'input');
      },
      onChange() {
        validateIfRequired(internalFormStore(), internalFieldStore(), 'change');
      },
      onFocus() {
        setFieldBool(internalFieldStore(), 'isTouched', true);
        validateIfRequired(internalFormStore(), internalFieldStore(), 'touch');
      },
      onBlur() {
        validateIfRequired(internalFormStore(), internalFieldStore(), 'blur');
      },
    },
  };
}
