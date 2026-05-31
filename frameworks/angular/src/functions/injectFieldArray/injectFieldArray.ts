import { assertInInjectionContext, computed } from '@angular/core';
import {
  type FormSchema,
  getFieldBool,
  getFieldStore,
  INTERNAL,
  type InternalArrayStore,
  type RequiredPath,
  type ValidArrayPath,
} from '@formisch/core/angular';
import type * as v from 'valibot';
import type {
  FieldArrayStore,
  FormStore,
  SignalOrValue,
} from '../../types/index.ts';
import { readSignalOrValue } from '../../utils/index.ts';

/**
 * Inject field array config interface.
 */
export interface InjectFieldArrayConfig<
  TSchema extends FormSchema = FormSchema,
  TFieldArrayPath extends RequiredPath = RequiredPath,
> {
  /**
   * The path to the field array within the form schema.
   */
  readonly path: SignalOrValue<
    ValidArrayPath<v.InferInput<TSchema>, TFieldArrayPath>
  >;
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
export function injectFieldArray<
  TSchema extends FormSchema,
  TFieldArrayPath extends RequiredPath,
>(
  form: SignalOrValue<FormStore<TSchema>>,
  config: InjectFieldArrayConfig<TSchema, TFieldArrayPath>
): FieldArrayStore<TSchema, TFieldArrayPath>;

// @__NO_SIDE_EFFECTS__
export function injectFieldArray(
  form: SignalOrValue<FormStore>,
  config: InjectFieldArrayConfig
): FieldArrayStore {
  assertInInjectionContext(injectFieldArray);

  const path = computed(() => readSignalOrValue(config.path));
  const internalFieldStore = computed(
    () =>
      getFieldStore(
        readSignalOrValue(form)[INTERNAL],
        path()
      ) as InternalArrayStore
  );

  return {
    get path() {
      return path();
    },
    items: computed(() => internalFieldStore().items.value),
    errors: computed(() => internalFieldStore().errors.value),
    isTouched: computed(() => getFieldBool(internalFieldStore(), 'isTouched')),
    isDirty: computed(() => getFieldBool(internalFieldStore(), 'isDirty')),
    isValid: computed(() => !getFieldBool(internalFieldStore(), 'errors')),
  };
}
