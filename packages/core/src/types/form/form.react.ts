import type { FormEvent } from 'react';
import type { FormSchema } from '../schema/index.ts';
import type { MaybePromise } from '../utils/index.ts';

// Re-export all other types from the base form module
export type {
  EmptyInput,
  StandardParseResult,
  StandardIssue,
  StandardIssuePathItem,
  ValidationMode,
  FormConfig,
  InternalFormStore,
  BaseFormStore,
} from './form.ts';

/**
 * Output type extracted from a form schema's Standard Schema types.
 */
type FormOutput<TSchema extends FormSchema> =
  import('./form.ts').SubmitHandler<TSchema> extends (output: infer O) => unknown
    ? O
    : never;

/**
 * Submit handler type (React-specific). Same as the base type, re-exported
 * for the React entry point.
 */
export type SubmitHandler<TSchema extends FormSchema> = (
  output: FormOutput<TSchema>
) => MaybePromise<unknown>;

/**
 * Submit event handler type (React-specific event).
 */
export type SubmitEventHandler<TSchema extends FormSchema> = (
  output: FormOutput<TSchema>,
  event: FormEvent<HTMLFormElement>
) => MaybePromise<unknown>;
