import {
  type FieldElement,
  type FormSchema,
  getElementInput,
  getFieldBool,
  getFieldInput,
  getFieldStore,
  INTERNAL,
  type InternalFieldStore,
  type RequiredPath,
  setFieldBool,
  setFieldInput,
  validateIfRequired,
  type ValidPath,
} from '@formisch/core/solid-2';
import {
  createMemo,
  getOwner,
  onCleanup,
  runWithOwner,
  untrack,
} from 'solid-js';
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

  // Get owner of primitive as fallback for refs read without owner
  const owner = getOwner();

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
      // Hint: Solid 2 runs ref callbacks without a reactive owner and before
      // the element is inserted, so a cleanup registered inside the callback
      // would never run. Instead, the ref is created when it is read, which
      // happens in the owned scope of the element (for example the effect of
      // a spread), and its registered elements are released when that scope
      // is disposed. The field store is captured at registration time,
      // because array operations can move a field to a different store.
      get ref() {
        const registrations: [InternalFieldStore, FieldElement][] = [];

        // Release registered elements when current owner is disposed
        runWithOwner(getOwner() ?? owner, () =>
          onCleanup(() => {
            for (const [internalFieldStore, element] of registrations) {
              const elements = internalFieldStore.elements.filter(
                (el) => el !== element
              );
              // Keep `initialElements` in sync while the store still owns it
              // (same reference) and filter it separately otherwise, so the
              // detached element of a removed array item does not survive in
              // the reset baseline
              if (
                internalFieldStore.elements ===
                internalFieldStore.initialElements
              ) {
                internalFieldStore.initialElements = elements;
              } else {
                internalFieldStore.initialElements =
                  internalFieldStore.initialElements.filter(
                    (el) => el !== element
                  );
              }
              internalFieldStore.elements = elements;
            }
            registrations.length = 0;
          })
        );

        // Return ref callback that registers element
        return (element: FieldElement) => {
          // Hint: Solid applies refs in the callback of an effect, so the
          // field store is read once on purpose and the read is untracked
          const internalFieldStore = untrack(getInternalFieldStore);
          // An array reorder transfers registered elements between the field
          // stores, so the element may already be present when the framework
          // re-registers it against the destination store
          if (!internalFieldStore.elements.includes(element)) {
            internalFieldStore.elements.push(element);
          }
          registrations.push([internalFieldStore, element]);
        };
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
