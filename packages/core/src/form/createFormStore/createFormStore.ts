import { initializeFieldStore } from '../../field/index.ts';
import { createSignal } from '../../framework/index.ts';
import type {
  EmptyInput,
  FormConfig,
  FormischFieldIR,
  InternalFormStore,
  StandardParseResult,
} from '../../types/index.ts';

export const DEFAULT_EMPTY_INPUT: EmptyInput = { string: '' };

// @__NO_SIDE_EFFECTS__
export function createFormStore(
  config: FormConfig,
  parse: (input: unknown) => Promise<StandardParseResult>
): InternalFormStore {
  const store: Partial<InternalFormStore> = {};

  store.emptyInput = { ...DEFAULT_EMPTY_INPUT, ...config.emptyInput };
  // Set form config and validation
  store.validationId = 0;
  store.validate = config.validate ?? 'submit';
  store.revalidate = config.revalidate ?? 'input';
  store.parse = parse;

  store.isSubmitting = createSignal(false);
  store.isSubmitted = createSignal(false);
  store.isValidating = createSignal(false);

  const ir = config.schema['~formisch'].root as FormischFieldIR;
  initializeFieldStore(
    store as InternalFormStore,
    store,
    ir,
    config.initialInput,
    []
  );

  return store as InternalFormStore;
}
