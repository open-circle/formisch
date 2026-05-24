import {
  assertInInjectionContext,
  computed,
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

// @__NO_SIDE_EFFECTS__
export function injectFieldArray(
  form: FormStore,
  config: InjectFieldArrayConfig
): FieldArrayStore {
  assertInInjectionContext(injectFieldArray);

  const internalFieldStore = getFieldStore(
    form[INTERNAL],
    config.path
  ) as InternalArrayStore;

  return {
    path: config.path,
    items: computed(() => internalFieldStore.items.value),
    errors: computed(() => internalFieldStore.errors.value),
    isTouched: computed(() => getFieldBool(internalFieldStore, 'isTouched')),
    isDirty: computed(() => getFieldBool(internalFieldStore, 'isDirty')),
    isValid: computed(() => !getFieldBool(internalFieldStore, 'errors')),
  };
}
