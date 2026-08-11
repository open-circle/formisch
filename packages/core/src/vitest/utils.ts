import { vi } from 'vitest';
import * as v from 'valibot';
import { createFormStore } from '../form/createFormStore/createFormStore.ts';
import type {
  EmptyInput,
  FormischFieldIR,
  FormSchema,
  InternalFormStore,
  StandardIssue,
  StandardParseResult,
  ValidationMode,
} from '../types/index.ts';

/**
 * Configuration options for creating a test store.
 */
interface CreateTestStoreConfig {
  validate?: ValidationMode | undefined;
  revalidate?: Exclude<ValidationMode, 'initial'> | undefined;
  initialInput?: unknown | undefined;
  emptyInput?: EmptyInput | undefined;
  issues?: StandardIssue[] | undefined;
}

/**
 * Empty default values per field type for IR construction.
 */
const EMPTY_DEFAULTS: Record<string, unknown> = {
  string: '',
  number: undefined,
  boolean: undefined,
  date: undefined,
  bigint: undefined,
  unknown: undefined,
};

/**
 * Transforms a Valibot schema into a Formisch IR node. This is a test-only
 * version of the adapter's transform function, sufficient for the core tests.
 *
 * @param schema The Valibot schema to transform.
 *
 * @returns The IR node.
 */
function transformValibot(schema: v.GenericSchema): FormischFieldIR {
  const unwrapped = unwrapValibot(schema);
  const optional = isOptionalValibot(schema);

  switch (unwrapped.type) {
    case 'object':
    case 'loose_object':
    case 'strict_object': {
      const properties = new Map<string, FormischFieldIR>();
      const entries = (unwrapped as unknown as { entries: Record<string, v.GenericSchema> }).entries;
      for (const key in entries) {
        properties.set(key, transformValibot(entries[key] as v.GenericSchema));
      }
      return {
        type: 'object',
        optional,
        getDefault: () => v.getDefault(schema),
        properties,
      };
    }
    case 'array': {
      const item = (unwrapped as unknown as { item: v.GenericSchema }).item;
      return {
        type: 'array',
        optional,
        getDefault: () => v.getDefault(schema),
        item: transformValibot(item),
      };
    }
    case 'string':
    case 'number':
    case 'boolean':
    case 'date':
    case 'bigint':
      return {
        type: unwrapped.type,
        optional,
        getDefault: () => v.getDefault(schema) ?? EMPTY_DEFAULTS[unwrapped.type],
      };
    default:
      return {
        type: 'unknown',
        optional,
        getDefault: () => v.getDefault(schema),
      };
  }
}

/**
 * Unwraps Valibot wrapper and lazy schemas to reach a concrete schema.
 */
function unwrapValibot(schema: v.GenericSchema): v.GenericSchema {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = schema as any;
  switch (s.type) {
    case 'exact_optional':
    case 'nullable':
    case 'nullish':
    case 'optional':
    case 'undefinedable':
    case 'non_nullable':
    case 'non_nullish':
    case 'non_optional':
      return unwrapValibot(s.wrapped);
    case 'lazy':
      return unwrapValibot(s.getter(undefined));
    case 'union':
    case 'variant':
    case 'intersect': {
      // For unions/variants/intersects, use the first option
      return s.options?.[0] ? unwrapValibot(s.options[0]) : s;
    }
    default:
      return s;
  }
}

/**
 * Detects whether a Valibot schema is optional/nullable/nullish.
 */
function isOptionalValibot(schema: v.GenericSchema): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = schema as any;
  return (
    s.type === 'optional' ||
    s.type === 'nullable' ||
    s.type === 'nullish' ||
    s.type === 'exact_optional' ||
    s.type === 'undefinedable'
  );
}

/**
 * Wraps a Valibot schema with the Formisch IR marker, making it a FormSchema.
 * This is a test-only helper that mirrors the `@formisch/valibot` adapter's
 * `toFormisch` function.
 *
 * @param schema The Valibot schema to wrap.
 *
 * @returns A FormSchema with the IR attached.
 */
export function toFormisch(schema: v.GenericSchema): FormSchema {
  const root = transformValibot(schema);
  return {
    '~standard': (schema as unknown as { '~standard': unknown })['~standard'],
    '~formisch': { version: 1 as const, root },
  } as FormSchema;
}

/**
 * Creates a form store for testing with mocked parse function.
 *
 * @param schema The Valibot schema for the form (will be wrapped with IR).
 * @param config Optional configuration for the store.
 *
 * @returns An internal form store for testing.
 */
export function createTestStore<TSchema extends FormSchema>(
  schema: TSchema,
  config: CreateTestStoreConfig = {}
): InternalFormStore<TSchema> {
  const { validate, revalidate, initialInput, emptyInput, issues } = config;

  const result: StandardParseResult = issues
    ? { issues }
    : { value: initialInput };

  const parse = vi.fn().mockResolvedValue(result);
  // `createFormStore` returns a non-generic `InternalFormStore`, so cast back to
  // the concrete schema to keep the generic parameter meaningful for callers.
  return createFormStore(
    {
      schema,
      initialInput,
      emptyInput,
      validate,
      revalidate,
    },
    parse
  ) as InternalFormStore<TSchema>;
}

/**
 * Creates a standard schema path segment for an object key.
 *
 * @param key The object key.
 *
 * @returns A path segment for use in issue paths.
 */
export function objectPath(key: string): { key: string } {
  return { key };
}

/**
 * Creates a standard schema path segment for an array index.
 *
 * @param key The array index.
 *
 * @returns A path segment for use in issue paths.
 */
export function arrayPath(key: number): { key: number } {
  return { key };
}

/**
 * Creates a validation issue for testing, compatible with the Standard Schema
 * result format.
 *
 * @param message The error message.
 * @param path The path to the field.
 *
 * @returns A standard schema issue.
 */
export function validationIssue(
  message: string,
  path?: readonly ({ key: PropertyKey } | PropertyKey)[]
): StandardIssue {
  return { message, path };
}

/**
 * Creates a schema-level (root) issue for testing.
 *
 * @param message The error message.
 *
 * @returns A standard schema issue with no path.
 */
export function schemaIssue(message: string): StandardIssue {
  return { message };
}
