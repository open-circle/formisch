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
} from '@formisch/core/svelte';
import { createAttachmentKey } from 'svelte/attachments';
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
 * @param form The form store instance or getter function.
 * @param config The field configuration or getter function.
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
  const path = $derived(unwrap(config).path);
  const internalFormStore = $derived(unwrap(form)[INTERNAL]);
  const internalFieldStore = $derived(getFieldStore(internalFormStore, path));

  const input = $derived(getFieldInput(internalFieldStore));
  const isTouched = $derived(getFieldBool(internalFieldStore, 'isTouched'));
  const isDirty = $derived(getFieldBool(internalFieldStore, 'isDirty'));
  const isValid = $derived(!getFieldBool(internalFieldStore, 'errors'));

  return {
    get path() {
      return path;
    },
    get input() {
      return input;
    },
    get errors() {
      return internalFieldStore.errors.value;
    },
    get isTouched() {
      return isTouched;
    },
    get isDirty() {
      return isDirty;
    },
    get isValid() {
      return isValid;
    },
    onInput(value) {
      setFieldInput(internalFormStore, path, value);
      validateIfRequired(internalFormStore, internalFieldStore, 'input');
    },
    props: {
      get name() {
        return internalFieldStore.name;
      },
      autofocus: !!internalFieldStore.errors.value,
      [createAttachmentKey()](element) {
        internalFieldStore.elements.push(element);
        return () => {
          internalFieldStore.elements = internalFieldStore.elements.filter(
            (el) => el !== element
          );
        };
      },
      onfocus() {
        setFieldBool(internalFieldStore, 'isTouched', true);
        validateIfRequired(internalFormStore, internalFieldStore, 'touch');
      },
      oninput(event) {
        setFieldInput(
          internalFormStore,
          path,
          getElementInput(event.currentTarget, internalFieldStore)
        );
        validateIfRequired(internalFormStore, internalFieldStore, 'input');
      },
      onchange() {
        validateIfRequired(internalFormStore, internalFieldStore, 'change');
      },
      onblur() {
        validateIfRequired(internalFormStore, internalFieldStore, 'blur');
      },
    },
  };
}
