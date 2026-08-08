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
} from '@formisch/core/honox';
import { useMemo } from 'hono/jsx';
import type * as v from 'valibot';
import type { FieldStore, FormStore } from '../../types/index.ts';
import { useSignals } from '../useSignals/index.ts';

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
  form: FormStore<TSchema>,
  config: UseFieldConfig<TSchema, TFieldPath>
): FieldStore<TSchema, TFieldPath>;

// @__NO_SIDE_EFFECTS__
export function useField(form: FormStore, config: UseFieldConfig): FieldStore {
  useSignals();

  const internalFormStore = form[INTERNAL];
  const internalFieldStore = getFieldStore(internalFormStore, config.path);

  return useMemo(
    () => ({
      path: config.path,
      get input() {
        return getFieldInput(internalFieldStore);
      },
      get errors() {
        return internalFieldStore.errors.value;
      },
      get isTouched() {
        return getFieldBool(internalFieldStore, 'isTouched');
      },
      get isEdited() {
        return getFieldBool(internalFieldStore, 'isEdited');
      },
      get isDirty() {
        return getFieldBool(internalFieldStore, 'isDirty');
      },
      get isValid() {
        return !getFieldBool(internalFieldStore, 'errors');
      },
      onChange(value) {
        setFieldInput(internalFormStore, config.path, value);
        validateIfRequired(internalFormStore, internalFieldStore, 'input');
        validateIfRequired(internalFormStore, internalFieldStore, 'change');
      },
      props: {
        name: internalFieldStore.name,
        autofocus: !!internalFieldStore.errors.value,
        ref(element) {
          if (!element) {
            return;
          }
          // An array reorder transfers registered elements between the field
          // stores, so the element may already be present when the framework
          // re-registers it against the destination store
          if (!internalFieldStore.elements.includes(element)) {
            internalFieldStore.elements.push(element);
          }
          // Hint: Unlike React, hono/jsx runs cleanups before it detaches the
          // element from the DOM, so a removed element cannot be recognized by
          // its `isConnected` flag. The cleanup returned here is called by
          // hono/jsx with the exact element it removes, so it is unregistered
          // by identity instead.
          return () => {
            // Keep `initialElements` aliased to `elements` while the store
            // still owns it, so that a later reset does not resurrect the
            // element through a diverged reset baseline
            const isOwned =
              internalFieldStore.elements ===
              internalFieldStore.initialElements;
            internalFieldStore.elements = internalFieldStore.elements.filter(
              (registered) => registered !== element
            );
            internalFieldStore.initialElements = isOwned
              ? internalFieldStore.elements
              : internalFieldStore.initialElements.filter(
                  (registered) => registered !== element
                );
          };
        },
        onFocus() {
          setFieldBool(internalFieldStore, 'isTouched', true);
          validateIfRequired(internalFormStore, internalFieldStore, 'touch');
        },
        onChange(event) {
          setFieldInput(
            internalFormStore,
            config.path,
            // Hint: Unlike React, hono/jsx types its event handlers with the
            // native `Event`, whose `currentTarget` is a nullable `EventTarget`.
            // Narrowing the handler signature instead is not an option, as it
            // would no longer be assignable to the intrinsic element props.
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
    }),
    [internalFormStore, internalFieldStore]
  );
}
