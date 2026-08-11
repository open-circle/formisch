import type { INTERNAL } from '../../values.ts';
import type { InternalObjectStore } from '../field/field.react-native.ts';
import type { FormSchema } from '../schema/index.ts';
import type { Signal } from '../signal/index.ts';
import type { MaybePromise } from '../utils/index.ts';
import type {
  EmptyInput,
  FormConfig,
  StandardParseResult,
  SubmitHandler,
  ValidationMode,
} from './form.ts';

/**
 * Extracts the input type from a Standard Schema.
 */
type InferStandardInput<T> =
  T extends { readonly '~standard': { readonly types?: { readonly input: infer I } } }
    ? I
    : unknown;

/**
 * Extracts the output type from a Standard Schema.
 */
type InferStandardOutput<T> =
  T extends { readonly '~standard': { readonly types?: { readonly output: infer O } } }
    ? O
    : unknown;

/**
 * Internal form store interface.
 */
export interface InternalFormStore<TSchema extends FormSchema = FormSchema>
  extends InternalObjectStore {
  /**
   * The ID of the latest validation.
   */
  validationId: number;
  /**
   * The resolved empty input of the form, keyed by field type.
   */
  emptyInput: EmptyInput;
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
  parse: (input: unknown) => Promise<StandardParseResult<InferStandardOutput<TSchema>>>;

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
export interface BaseFormStore<TSchema extends FormSchema = FormSchema> {
  /**
   * The internal form store.
   *
   * @internal
   */
  readonly [INTERNAL]: InternalFormStore<TSchema>;
}

/**
 * Submit event handler type.
 *
 * Hint: React Native has no submit event, so unlike the DOM frameworks the
 * handler only receives the validated output.
 */
export type SubmitEventHandler<TSchema extends FormSchema> = (
  output: InferStandardOutput<TSchema>
) => MaybePromise<unknown>;

export type {
  EmptyInput,
  FormConfig,
  StandardParseResult,
  SubmitHandler,
  ValidationMode,
};
