import {
  assertInInjectionContext,
  computed,
  type Signal,
} from '@angular/core';
import {
  getFieldBool,
  getFieldStore,
  INTERNAL,
  type InternalArrayStore,
  type RequiredPath,
  type Schema,
  type ValidArrayPath,
} from '@formisch/core/angular';
import type * as v from 'valibot';
import type { FieldArrayStore, FormStore } from '../../types/index.ts';

/**
 * Inject field array config interface.
 */
export interface InjectFieldArrayConfig<
  TSchema extends Schema = Schema,
  TFieldArrayPath extends RequiredPath = RequiredPath,
> {
  /**
   * The path to the field array within the form schema.
   */
  readonly path: ValidArrayPath<v.InferInput<TSchema>, TFieldArrayPath>;
}

/**
 * Inject field array config interface for signal-based inputs.
 */
export interface InjectFieldArrayConfigSignal<
  TSchema extends Schema = Schema,
  TFieldArrayPath extends RequiredPath = RequiredPath,
> {
  /**
   * A signal that returns the path to the field array within the form schema.
   */
  readonly path: Signal<ValidArrayPath<v.InferInput<TSchema>, TFieldArrayPath>>;
}

/**
 * Creates a reactive field array store for a specific array field within a form store.
 * Exposes all reactive state as Angular Signals callable in templates.
 *
 * Must be called in an injection context (component constructor or field initializer).
 *
 * @param form The form store instance.
 * @param config The field array configuration.
 *
 * @returns The field array store with reactive Signal properties.
 */
// @ts-expect-error
export function injectFieldArray<
  TSchema extends Schema,
  TFieldArrayPath extends RequiredPath,
>(
  form: FormStore<TSchema>,
  config: InjectFieldArrayConfig<TSchema, TFieldArrayPath>
): FieldArrayStore<TSchema, TFieldArrayPath>;

/**
 * Creates a reactive field array store for a specific array field within a form store.
 * Accepts signal inputs for use inside Angular components.
 *
 * Must be called in an injection context (component constructor or field initializer).
 *
 * @param form A signal returning the form store instance.
 * @param config The field array configuration with a signal path.
 *
 * @returns The field array store with reactive Signal properties.
 */
export function injectFieldArray<
  TSchema extends Schema,
  TFieldArrayPath extends RequiredPath,
>(
  form: Signal<FormStore<TSchema>>,
  config: InjectFieldArrayConfigSignal<TSchema, TFieldArrayPath>
): FieldArrayStore<TSchema, TFieldArrayPath>;

// @__NO_SIDE_EFFECTS__
export function injectFieldArray(
  form: FormStore | Signal<FormStore>,
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  config: InjectFieldArrayConfig | InjectFieldArrayConfigSignal
): FieldArrayStore {
  assertInInjectionContext(injectFieldArray);

  const getForm: () => FormStore =
    typeof form === 'function' ? form : () => form;
  // Path may be a plain value or a signal — normalize to a zero-arg accessor.
  const getPath: () => InjectFieldArrayConfig['path'] =
    typeof config.path === 'function'
      ? config.path
      : () => config.path as InjectFieldArrayConfig['path'];

  const internalFieldStore = computed(
    () => getFieldStore(getForm()[INTERNAL], getPath()) as InternalArrayStore
  );

  return {
    get path() {
      return getPath();
    },
    items: computed(() => internalFieldStore().items.value),
    errors: computed(() => internalFieldStore().errors.value),
    isTouched: computed(() => getFieldBool(internalFieldStore(), 'isTouched')),
    isDirty: computed(() => getFieldBool(internalFieldStore(), 'isDirty')),
    isValid: computed(() => !getFieldBool(internalFieldStore(), 'errors')),
  };
}
