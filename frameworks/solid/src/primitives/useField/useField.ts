import {
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
} from '@formisch/core/solid';
import { createMemo, onCleanup } from 'solid-js';
import type * as v from 'valibot';
import type { FieldStore, FormStore, MaybeGetter } from '../../types/index.ts';
import { unwrap } from '../../utils/index.ts';

/**
 * Use field config interface.
 */
export interface UseFieldConfig<
  TSchema extends Schema = Schema,
  TFieldPath extends RequiredPath = RequiredPath,
> {
  /**
   * The path to the field within the form schema.
   */
  readonly path: ValidPath<v.InferInput<TSchema>, TFieldPath>;
}

/**
 * Creates a reactive field store of a specific field within a form store.
 *
 * @param form The form store instance.
 * @param config The field configuration.
 *
 * @returns The field store with reactive properties and element props.
 */
export function useField<
  TSchema extends Schema,
  TFieldPath extends RequiredPath,
>(
  form: MaybeGetter<FormStore<TSchema>>,
  config: MaybeGetter<UseFieldConfig<TSchema, TFieldPath>>
): FieldStore<TSchema, TFieldPath>;

// @__NO_SIDE_EFFECTS__
export function useField(
  form: MaybeGetter<FormStore>,
  config: MaybeGetter<UseFieldConfig>
): FieldStore {
  const getPath = createMemo(() => unwrap(config).path);
  const getInternalFormStore = createMemo(() => unwrap(form)[INTERNAL]);
  const getInternalFieldStore = createMemo(() =>
    getFieldStore(getInternalFormStore(), getPath())
  );

  const getInput = createMemo(() => getFieldInput(getInternalFieldStore()));
  const getIsTouched = createMemo(() =>
    getFieldBool(getInternalFieldStore(), 'isTouched')
  );
  const getIsDirty = createMemo(() =>
    getFieldBool(getInternalFieldStore(), 'isDirty')
  );
  const getIsValid = createMemo(
    () => !getFieldBool(getInternalFieldStore(), 'errors')
  );

  return {
    get path() {
      return getPath();
    },
    get input() {
      return getInput();
    },
    get errors() {
      return getInternalFieldStore().errors.value;
    },
    get isTouched() {
      return getIsTouched();
    },
    get isDirty() {
      return getIsDirty();
    },
    get isValid() {
      return getIsValid();
    },
    onInput(value) {
      setFieldInput(getInternalFormStore(), getPath(), value);
      validateIfRequired(
        getInternalFormStore(),
        getInternalFieldStore(),
        'input'
      );
    },
    props: {
      get name() {
        return getInternalFieldStore().name;
      },
      // eslint-disable-next-line solid/reactivity
      autofocus: !!getInternalFieldStore().errors.value,
      ref: (element) => {
        const internalFieldStore = getInternalFieldStore();
        internalFieldStore.elements.push(element);
        onCleanup(() => {
          internalFieldStore.elements = internalFieldStore.elements.filter(
            (el) => el !== element
          );
        });
      },
      onFocus() {
        setFieldBool(getInternalFieldStore(), 'isTouched', true);
        validateIfRequired(
          getInternalFormStore(),
          getInternalFieldStore(),
          'touch'
        );
      },
      onInput(event) {
        const internalFieldStore = getInternalFieldStore();
        setFieldInput(
          getInternalFormStore(),
          getPath(),
          getElementInput(event.currentTarget, internalFieldStore)
        );
        validateIfRequired(getInternalFormStore(), internalFieldStore, 'input');
      },
      onChange() {
        validateIfRequired(
          getInternalFormStore(),
          getInternalFieldStore(),
          'change'
        );
      },
      onBlur() {
        validateIfRequired(
          getInternalFormStore(),
          getInternalFieldStore(),
          'blur'
        );
      },
    },
  };
}
