import {
  type BaseFormStore,
  createFormStore,
  INTERNAL,
  type InternalFormStore,
  type Schema,
  type ValidationMode,
} from '@formisch/core';
import type * as v from 'valibot';
import { vi } from 'vitest';

/**
 * Configuration options for creating a test store.
 */
interface CreateTestStoreConfig<TSchema extends Schema> {
  validate?: ValidationMode;
  revalidate?: Exclude<ValidationMode, 'initial'>;
  initialInput?: v.InferInput<TSchema>;
  issues?: [v.BaseIssue<unknown>, ...v.BaseIssue<unknown>[]];
}

/**
 * Creates a form store for testing with mocked parse function.
 *
 * @param schema The Valibot schema for the form.
 * @param config Optional configuration for the store.
 *
 * @returns A form store for testing with access to internal state.
 */
export function createTestStore<TSchema extends Schema>(
  schema: TSchema,
  config: CreateTestStoreConfig<TSchema> = {}
): BaseFormStore<TSchema> & InternalFormStore {
  const {
    validate = 'submit',
    revalidate = 'input',
    initialInput,
    issues,
  } = config;

  const result: v.SafeParseResult<TSchema> = issues
    ? {
        typed: false,
        success: false,
        output: initialInput as v.InferOutput<TSchema>,
        issues,
      }
    : {
        typed: true,
        success: true,
        output: initialInput as v.InferOutput<TSchema>,
        issues: undefined,
      };

  const parse = vi.fn().mockResolvedValue(result);

  // Create internal form store using the real core function
  const internalStore = createFormStore(
    {
      schema,
      initialInput,
      validate,
      revalidate,
    },
    parse
  );

  // Create a wrapper object that has both INTERNAL and direct properties
  // This mimics how BaseFormStore works
  const wrapper = {
    [INTERNAL]: internalStore,
  } as BaseFormStore<TSchema> & InternalFormStore;

  // Proxy all properties from internal to wrapper for easy access
  for (const key of Object.keys(internalStore)) {
    Object.defineProperty(wrapper, key, {
      get() {
        return (internalStore as Record<string, unknown>)[key];
      },
      set(value: unknown) {
        (internalStore as Record<string, unknown>)[key] = value;
      },
      enumerable: true,
    });
  }

  return wrapper;
}

/**
 * Creates an object path item for testing validation issues.
 *
 * @param key
 * @param value
 */
export function objectPath(key: string, value: unknown = ''): v.ObjectPathItem {
  return { type: 'object', origin: 'value', input: {}, key, value };
}

/**
 * Creates an array path item for testing validation issues.
 *
 * @param key
 * @param value
 */
export function arrayPath(key: number, value: unknown = ''): v.ArrayPathItem {
  return { type: 'array', origin: 'value', input: [], key, value };
}

/**
 * Creates a validation issue for testing.
 *
 * @param message
 * @param path
 */
export function validationIssue(
  message: string,
  path?: [v.IssuePathItem, ...v.IssuePathItem[]]
): v.BaseIssue<unknown> {
  return {
    kind: 'validation',
    type: 'check',
    input: '',
    expected: null,
    received: 'unknown',
    message,
    path,
  };
}

/**
 * Creates a schema-level issue for testing.
 *
 * @param message
 */
export function schemaIssue(message: string): v.BaseIssue<unknown> {
  return {
    kind: 'schema',
    type: 'object',
    input: {},
    expected: 'Object',
    received: 'unknown',
    message,
  };
}
