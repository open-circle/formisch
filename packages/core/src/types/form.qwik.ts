import type { QRL } from '@qwik.dev/core';
import type * as v from 'valibot';
import type { INTERNAL } from '../values.ts';
import type { InternalObjectStore } from './field.qwik.ts';
import type {
  SubmitEventHandler,
  SubmitHandler,
  ValidationMode,
} from './form.ts';
import type { Schema } from './schema.ts';
import type { Signal } from './signal.ts';
import type { DeepPartial } from './utils.ts';

/**
 * Form config interface.
 */
export interface FormConfig<TSchema extends Schema = Schema> {
  /**
   * The schema of the form.
   */
  readonly schema: TSchema;
  /**
   * The initial input of the form.
   */
  readonly initialInput?: DeepPartial<v.InferInput<TSchema>> | undefined;
  /**
   * The validation mode of the form.
   */
  readonly validate?: ValidationMode | undefined;
  /**
   * The revalidation mode of the form.
   */
  readonly revalidate?: Exclude<ValidationMode, 'initial'> | undefined;
}

/**
 * Internal form store interface.
 */
export interface InternalFormStore<TSchema extends Schema = Schema>
  extends InternalObjectStore {
  /**
   * The element of the form.
   */
  element?: HTMLFormElement;

  /**
   * The number of active validators.
   */
  validators: number;
  /**
   * The validation mode of the form.
   */
  validate: ValidationMode;
  /**
   * The revalidation mode of the form.
   */
  revalidate: Exclude<ValidationMode, 'initial'>;
  /**
   * The parse function of the form.
   */
  parse: QRL<(input: unknown) => Promise<v.SafeParseResult<TSchema>>>;

  /**
   * The submitting state of the form.
   */
  isSubmitting: Signal<boolean>;
  /**
   * The submitted state of the form.
   */
  isSubmitted: Signal<boolean>;
  /**
   * The validating state of the form.
   */
  isValidating: Signal<boolean>;
}

/**
 * Base form store interface.
 */
export interface BaseFormStore<TSchema extends Schema = Schema> {
  /**
   * The internal form store.
   *
   * @internal
   */
  readonly [INTERNAL]: InternalFormStore<TSchema>;
}

export { ValidationMode, SubmitHandler, SubmitEventHandler };
