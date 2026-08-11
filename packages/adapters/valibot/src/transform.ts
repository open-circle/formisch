import * as v from 'valibot';
import type { FormischFieldIR } from '@formisch/core';

/**
 * Unwraps Valibot wrapper and lazy schemas until a concrete schema is reached.
 *
 * @param schema The schema to unwrap.
 *
 * @returns The unwrapped schema.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrapValibot(schema: any): any {
  switch (schema.type) {
    case 'exact_optional':
    case 'nullable':
    case 'nullish':
    case 'optional':
    case 'undefinedable':
    case 'non_nullable':
    case 'non_nullish':
    case 'non_optional':
      return unwrapValibot(schema.wrapped);
    case 'lazy':
      return unwrapValibot(schema.getter(undefined));
    case 'pipe':
      return unwrapValibot(schema.items[0]);
    default:
      return schema;
  }
}

/**
 * Detects whether a Valibot schema is optional/nullable/nullish.
 *
 * @param schema The schema to check.
 *
 * @returns Whether the schema is optional.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isOptional(schema: any): boolean {
  return (
    schema.type === 'optional' ||
    schema.type === 'nullable' ||
    schema.type === 'nullish' ||
    schema.type === 'exact_optional' ||
    schema.type === 'undefinedable'
  );
}

/**
 * Recursively transforms a Valibot schema into a Formisch IR node.
 *
 * @param schema The Valibot schema to transform.
 *
 * @returns The IR node.
 */
export function transform(schema: v.GenericSchema): FormischFieldIR {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const unwrapped = unwrapValibot(schema as any);
  const optional = isOptional(schema);

  switch (unwrapped.type) {
    case 'object':
    case 'loose_object':
    case 'strict_object': {
      const properties = new Map<string, FormischFieldIR>();
      for (const key in unwrapped.entries) {
        properties.set(
          key,
          transform(unwrapped.entries[key] as v.GenericSchema)
        );
      }
      return {
        type: 'object',
        optional,
        getDefault: () => v.getDefault(schema),
        properties,
      };
    }

    case 'array': {
      return {
        type: 'array',
        optional,
        getDefault: () => v.getDefault(schema),
        item: transform(unwrapped.item as v.GenericSchema),
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
        getDefault: () => v.getDefault(schema),
      };

    case 'file':
      return {
        type: 'unknown',
        optional,
        getDefault: () => v.getDefault(schema),
      };

    case 'enum':
    case 'picklist':
    case 'literal':
      return {
        type: 'string',
        optional,
        getDefault: () => v.getDefault(schema),
      };

    case 'union':
    case 'variant':
    case 'intersect': {
      // Resolve to first option (POC limitation — see plan's open design questions)
      if (unwrapped.options?.[0]) {
        const inner = transform(unwrapped.options[0] as v.GenericSchema);
        return { ...inner, optional, getDefault: () => v.getDefault(schema) };
      }
      return {
        type: 'unknown',
        optional,
        getDefault: () => v.getDefault(schema),
      };
    }

    default:
      return {
        type: 'unknown',
        optional,
        getDefault: () => v.getDefault(schema),
      };
  }
}
