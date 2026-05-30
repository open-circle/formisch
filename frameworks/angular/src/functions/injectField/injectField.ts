import {
  assertInInjectionContext,
  computed,
  DestroyRef,
  inject,
  type Signal,
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
 * Inject field config interface for signal-based inputs.
 */
export interface InjectFieldConfigSignal<
  TSchema extends Schema = Schema,
  TFieldPath extends RequiredPath = RequiredPath,
> {
  /**
   * A signal that returns the path to the field within the form schema.
   */
  readonly path: Signal<ValidPath<v.InferInput<TSchema>, TFieldPath>>;
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

/**
 * Creates a reactive field store for a specific field within a form store.
 * Accepts signal inputs for use inside Angular components.
 *
 * Must be called in an injection context (component constructor or field initializer).
 *
 * @param form A signal returning the form store instance.
 * @param config The field configuration with a signal path.
 *
 * @returns The field store with reactive Signal properties and element props.
 */
export function injectField<
  TSchema extends Schema,
  TFieldPath extends RequiredPath,
>(
  form: Signal<FormStore<TSchema>>,
  config: InjectFieldConfigSignal<TSchema, TFieldPath>
): FieldStore<TSchema, TFieldPath>;

// @__NO_SIDE_EFFECTS__
export function injectField(
  form: FormStore | Signal<FormStore>,
  config: InjectFieldConfig | InjectFieldConfigSignal
): FieldStore {
  assertInInjectionContext(injectField);

  const destroyRef = inject(DestroyRef);
  const getForm: () => FormStore =
    typeof form === 'function' ? form : () => form;
  // Path may be a plain value or a signal — normalize to a zero-arg accessor.
  const getPath: () => InjectFieldConfig['path'] =
    typeof config.path === 'function'
      ? config.path
      : () => config.path as InjectFieldConfig['path'];

  const internalFormStore = computed(() => getForm()[INTERNAL]);
  const internalFieldStore = computed(() => getFieldStore(internalFormStore(), getPath()));

  destroyRef.onDestroy(() => {
    internalFieldStore().elements = internalFieldStore().elements.filter(
      (element) => element.isConnected
    );
  });

  return {
    get path() {
      return getPath();
    },
    input: computed(() => getFieldInput(internalFieldStore())),
    errors: computed(() => internalFieldStore().errors.value),
    isTouched: computed(() => getFieldBool(internalFieldStore(), 'isTouched')),
    isDirty: computed(() => getFieldBool(internalFieldStore(), 'isDirty')),
    isValid: computed(() => !getFieldBool(internalFieldStore(), 'errors')),
    onInput(value) {
      setFieldInput(internalFormStore(), getPath(), value);
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
          getPath(),
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
