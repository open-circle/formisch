import {
  type RequiredPath,
  type Schema,
  type ValidPath,
} from '@formisch/core/qwik';
import type { JSXOutput, QRL } from '@qwik.dev/core';
import { component$ } from '@qwik.dev/core';
import type * as v from 'valibot';
import { useField } from '../../hooks/index.ts';
import { useResolvedQrl } from '../../hooks/useResolvedQrl/index.ts';
import type { FieldStore, FormStore } from '../../types/index.ts';

/**
 * Field component props interface.
 */
export interface FieldProps<
  TSchema extends Schema = Schema,
  TFieldPath extends RequiredPath = RequiredPath,
> {
  /**
   * The form store to which the field belongs.
   */
  readonly of: FormStore<TSchema>;
  /**
   * The path to the field within the form schema.
   */
  readonly path: ValidPath<v.InferInput<TSchema>, TFieldPath>;
  /**
   * The render function that receives the field store and returns JSX output.
   */
  readonly render$: QRL<(store: FieldStore<TSchema, TFieldPath>) => JSXOutput>;
}

/**
 * Headless form field component that provides reactive properties and state.
 * The field component takes a form store, path to field, and a render function
 * that receives a field store to display field state and handle user interactions.
 *
 * @returns The UI of the field to be rendered.
 */
export const Field = component$(
  <TSchema extends Schema, TFieldPath extends RequiredPath>({
    of,
    path,
    render$,
  }: FieldProps<TSchema, TFieldPath>): JSXOutput => {
    const field = useField(of, { path });
    const render = useResolvedQrl(render$);
    return render(field);
  }
);
