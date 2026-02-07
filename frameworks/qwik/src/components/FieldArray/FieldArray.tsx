import {
  type RequiredPath,
  type Schema,
  type ValidArrayPath,
} from '@formisch/core/qwik';
import type { JSXOutput, QRL } from '@qwik.dev/core';
import { component$ } from '@qwik.dev/core';
import type * as v from 'valibot';
import { useFieldArray } from '../../hooks/index.ts';
import { useResolvedQrl } from '../../hooks/useResolvedQrl/index.ts';
import type { FieldArrayStore, FormStore } from '../../types/index.ts';

/**
 * FieldArray component props interface.
 */
export interface FieldArrayProps<
  TSchema extends Schema = Schema,
  TFieldArrayPath extends RequiredPath = RequiredPath,
> {
  /**
   * The form store to which the field array belongs.
   */
  readonly of: FormStore<TSchema>;
  /**
   * The path to the field array within the form schema.
   */
  readonly path: ValidArrayPath<v.InferInput<TSchema>, TFieldArrayPath>;
  /**
   * The render function that receives the field array store and returns JSX output.
   */
  readonly render$: QRL<
    (store: FieldArrayStore<TSchema, TFieldArrayPath>) => JSXOutput
  >;
}

/**
 * Headless field array component that provides reactive properties and state.
 * The field array component takes a form store, path to array field, and a render
 * function that receives a field array store to manage array items and handle
 * array operations.
 *
 * @returns The UI of the field array to be rendered.
 */
export const FieldArray = component$(
  <TSchema extends Schema, TFieldArrayPath extends RequiredPath>({
    of,
    path,
    render$,
  }: FieldArrayProps<TSchema, TFieldArrayPath>): JSXOutput => {
    const field = useFieldArray(of, { path });
    const render = useResolvedQrl(render$);
    return render(field);
  }
);
