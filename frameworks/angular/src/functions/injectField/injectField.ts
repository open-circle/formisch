import {
  assertInInjectionContext,
  computed,
  DestroyRef,
  inject,
} from '@angular/core';
import {
  type FieldElement,
  getElementInput,
  getFieldBool,
  getFieldInput,
  getFieldStore,
  INTERNAL,
  type RequiredPath,
  type Schema,
  setFieldBool,
  setFieldInput,
  validateIfRequired,
  type ValidPath,
} from '@formisch/core/angular';
import type * as v from 'valibot';
import type { FieldStore, FormStore } from '../../types/index.ts';

/**
 * Inject field config interface.
 */
export interface InjectFieldConfig<
  TSchema extends Schema = Schema,
  TFieldPath extends RequiredPath = RequiredPath,
> {
  /**
   * The path to the field within the form schema.
   */
  readonly path: ValidPath<v.InferInput<TSchema>, TFieldPath>;
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
 * @returns The field store with reactive Signal properties and element props.
 */
export function injectField<
  TSchema extends Schema,
  TFieldPath extends RequiredPath,
>(
  form: FormStore<TSchema>,
  config: InjectFieldConfig<TSchema, TFieldPath>
): FieldStore<TSchema, TFieldPath>;

// @__NO_SIDE_EFFECTS__
export function injectField(
  form: FormStore,
  config: InjectFieldConfig
): FieldStore {
  assertInInjectionContext(injectField);

  const destroyRef = inject(DestroyRef);
  const internalFormStore = form[INTERNAL];
  const internalFieldStore = getFieldStore(internalFormStore, config.path);

  destroyRef.onDestroy(() => {
    internalFieldStore.elements = internalFieldStore.elements.filter(
      (element) => element.isConnected
    );
  });

  return {
    path: config.path,
    input: computed(() => getFieldInput(internalFieldStore)),
    errors: computed(() => internalFieldStore.errors.value),
    isTouched: computed(() => getFieldBool(internalFieldStore, 'isTouched')),
    isDirty: computed(() => getFieldBool(internalFieldStore, 'isDirty')),
    isValid: computed(() => !getFieldBool(internalFieldStore, 'errors')),
    onInput(value) {
      setFieldInput(internalFormStore, config.path, value);
      validateIfRequired(internalFormStore, internalFieldStore, 'input');
    },
    props: {
      get name() {
        return internalFieldStore.name;
      },
      autofocus: !!internalFieldStore.errors.value,
      ref(element) {
        if (element) {
          internalFieldStore.elements.push(element as FieldElement);
        }
      },
      onFocus() {
        setFieldBool(internalFieldStore, 'isTouched', true);
        validateIfRequired(internalFormStore, internalFieldStore, 'touch');
      },
      onChange(event) {
        setFieldInput(
          internalFormStore,
          config.path,
          getElementInput(
            event.currentTarget as FieldElement,
            internalFieldStore
          )
        );
        validateIfRequired(internalFormStore, internalFieldStore, 'input');
        validateIfRequired(internalFormStore, internalFieldStore, 'change');
      },
      onBlur() {
        validateIfRequired(internalFormStore, internalFieldStore, 'blur');
      },
    },
  };
}
