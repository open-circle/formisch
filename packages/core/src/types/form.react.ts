import type { FormEvent } from 'react';
import type * as v from 'valibot';
import type { Schema } from './schema.ts';
import type { MaybePromise } from './utils.ts';

// Re-export all other types from the base form module
export type {
  ValidationMode,
  FormConfig,
  InternalFormStore,
  BaseFormStore,
} from './form.ts';

/**
 * Submit handler type.
 */
export type SubmitHandler<TSchema extends Schema> = (
  output: v.InferOutput<TSchema>
) => MaybePromise<unknown>;

/**
 * Submit event handler type.
 */
export type SubmitEventHandler<TSchema extends Schema> = (
  output: v.InferOutput<TSchema>,
  event: FormEvent<HTMLFormElement>
) => MaybePromise<unknown>;
