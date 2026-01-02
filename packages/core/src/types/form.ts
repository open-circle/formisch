import type * as v from 'valibot';
import type { INTERNAL } from '../values.ts';
import type { AdvancedCustomizations, SchemaLevelBehavior } from './custom.ts';
import type { InternalObjectStore } from './field.ts';
import type { Schema } from './schema.ts';
import type { Signal } from './signal.ts';
import type { DeepPartial, MaybePromise } from './utils.ts';

/**
 * Validation mode type.
 */
export type ValidationMode =
  | 'initial'
  | 'touch'
  | 'input'
  | 'change'
  | 'blur'
  | 'submit';

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
  /**
   * Advanced customization of the form.
   */
  readonly custom?: Partial<AdvancedCustomizations>;
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
  parse: (input: unknown) => Promise<v.SafeParseResult<TSchema>>;
  /**
   * The advanced customizations of the form. Set directly from the form config.
   */
  custom: Partial<AdvancedCustomizations>;
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

/**
 * Submit handler type.
 */
export type SubmitHandler<TSchema extends Schema> = (
  output: v.InferOutput<TSchema>,
  event: SubmitEvent
) => MaybePromise<unknown>;
