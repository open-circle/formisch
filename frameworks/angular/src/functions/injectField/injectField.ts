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
 * @returns The field store with reactive Signal properties and element props.
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
    internalFieldStore().elements = internalFieldStore().elements.filter(
      (element) => element.isConnected
    );
  });

  return {
    get path() {
      return path();
    },
    input: computed(() => getFieldInput(internalFieldStore())),
    errors: computed(() => internalFieldStore().errors.value),
    isTouched: computed(() => getFieldBool(internalFieldStore(), 'isTouched')),
    isDirty: computed(() => getFieldBool(internalFieldStore(), 'isDirty')),
    isValid: computed(() => !getFieldBool(internalFieldStore(), 'errors')),
    onInput(value) {
      setFieldInput(internalFormStore(), path(), value);
      validateIfRequired(internalFormStore(), internalFieldStore(), 'input');
    },
    props: {
      get name() {
        return internalFieldStore().name;
      },
      get autofocus() {
        return !!internalFieldStore().errors.value;
      },
      ref(element) {
        if (element) {
          internalFieldStore().elements.push(element);
        }
      },
      onFocus() {
        setFieldBool(internalFieldStore(), 'isTouched', true);
        validateIfRequired(internalFormStore(), internalFieldStore(), 'touch');
      },
      onChange(event) {
        setFieldInput(
          internalFormStore(),
          path(),
          getElementInput(
            event.currentTarget as FieldElement,
            internalFieldStore()
          )
        );
        validateIfRequired(internalFormStore(), internalFieldStore(), 'input');
        validateIfRequired(internalFormStore(), internalFieldStore(), 'change');
      },
      onBlur() {
        validateIfRequired(internalFormStore(), internalFieldStore(), 'blur');
      },
    },
  };
}
