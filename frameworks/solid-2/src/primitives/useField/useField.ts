import {
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
} from '@formisch/core/solid-2';
import { createMemo, onCleanup, untrack } from 'solid-js';
import type * as v from 'valibot';
import type { FieldStore, FormStore, MaybeGetter } from '../../types/index.ts';
import { unwrap } from '../../utils/index.ts';

/**
 * Use field config interface.
 */
export interface UseFieldConfig<
  TSchema extends FormSchema = FormSchema,
  TFieldPath extends RequiredPath = RequiredPath,
> {
  /**
   * The path to the field within the form schema.
   */
  readonly path: ValidPath<v.InferInput<TSchema>, TFieldPath>;
}

/**
 * Creates a reactive field store for a specific field within a form store.
 *
 * @param form The form store instance.
 * @param config The field configuration.
 *
 * @returns The field store with reactive properties and element props.
 */
export function useField<
  TSchema extends FormSchema,
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
  const getInternalFieldStore = createMemo(
    () => getFieldStore(getInternalFormStore(), getPath())!
  );

  const getInput = createMemo(() => getFieldInput(getInternalFieldStore()));
  const getIsTouched = createMemo(() =>
    getFieldBool(getInternalFieldStore(), 'isTouched')
  );
  const getIsEdited = createMemo(() =>
    getFieldBool(getInternalFieldStore(), 'isEdited')
  );
  const getIsDirty = createMemo(() =>
    getFieldBool(getInternalFieldStore(), 'isDirty')
  );
  const getIsValid = createMemo(
    () => !getFieldBool(getInternalFieldStore(), 'errors')
  );

  // Hint: Solid 2 runs ref callbacks without a reactive owner, so a cleanup
  // cannot be registered per element. Like React and Vue, disconnected
  // elements are therefore released when the field is disposed. Solid runs
  // cleanups before it removes the elements from the DOM, so this happens in
  // a microtask.
  onCleanup(() => {
    const internalFieldStore = untrack(getInternalFieldStore);
    queueMicrotask(() => {
      const elements = internalFieldStore.elements.filter(
        (element) => element.isConnected
      );
      // Keep `initialElements` in sync while the store still owns it (same
      // reference) and filter it separately otherwise, so the detached
      // element of a removed array item does not survive in the reset baseline
      if (internalFieldStore.elements === internalFieldStore.initialElements) {
        internalFieldStore.initialElements = elements;
      } else {
        internalFieldStore.initialElements =
          internalFieldStore.initialElements.filter(
            (element) => element.isConnected
          );
      }
      internalFieldStore.elements = elements;
    });
  });

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
    get isEdited() {
      return getIsEdited();
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
      // Hint: Errors are read once on purpose to focus a field that is already
      // invalid when it is rendered, so the read is explicitly untracked
      autofocus: untrack(() => !!getInternalFieldStore().errors.value),
      ref(element) {
        // Hint: Solid applies refs in the callback of an effect, so the field
        // store is read once on purpose and the read is untracked
        const internalFieldStore = untrack(getInternalFieldStore);
        // An array reorder transfers registered elements between the field
        // stores, so the element may already be present when the framework
        // re-registers it against the destination store
        if (!internalFieldStore.elements.includes(element)) {
          internalFieldStore.elements.push(element);
        }
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
