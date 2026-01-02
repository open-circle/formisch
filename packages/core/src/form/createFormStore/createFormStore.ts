import type * as v from 'valibot';
import { type FieldSchema, initializeFieldStore } from '../../field/index.ts';
import { createSignal } from '../../framework/index.ts';
import type {
  FormConfig,
  InternalFormStore,
  Schema,
} from '../../types/index.ts';

/**
 * Creates a new internal form store from the provided configuration.
 * Initializes the field store hierarchy, sets validation modes, and
 * creates form state signals.
 *
 * @param config The form configuration.
 * @param parse The schema parse function.
 *
 * @returns The internal form store.
 */
export function createFormStore(
  config: FormConfig,
  parse: (input: unknown) => Promise<v.SafeParseResult<Schema>>
): InternalFormStore {
  // Create partial store object
  const store: Partial<InternalFormStore> = {};

  // Initialize field store hierarchy from schema
  initializeFieldStore(
    store,
    config.schema as FieldSchema,
    config.initialInput,
    []
  );

  // Set form config and validation
  store.validators = 0;
  store.validate = config.validate ?? 'submit';
  store.revalidate = config.revalidate ?? 'input';
  store.parse = parse;
  store.custom = config.custom ?? {};

  // Initialize form state signals
  store.isSubmitting = createSignal(false);
  store.isSubmitted = createSignal(false);
  store.isValidating = createSignal(false);

  // Return initialized store
  return store as InternalFormStore;
}
