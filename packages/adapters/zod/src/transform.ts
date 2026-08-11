import type { FormischFieldIR } from '@formisch/core';
import { z } from 'zod';

/**
 * Extracts the default value from a Zod schema if one is defined.
 */
function getZodDefault(schema: z.ZodTypeAny): unknown {
  const def = schema._def;
  if (def.typeName === z.ZodFirstPartyTypeKind.ZodDefault) {
    return def.defaultValue();
  }
  return undefined;
}

/**
 * Recursively transforms a Zod schema into a Formisch IR node.
 *
 * @param schema The Zod schema to transform.
 *
 * @returns The IR node.
 */
export function transform(schema: z.ZodTypeAny): FormischFieldIR {
  const def = schema._def;

  switch (def.typeName) {
    case z.ZodFirstPartyTypeKind.ZodObject: {
      const properties = new Map<string, FormischFieldIR>();
      const shape = def.shape();
      for (const [key, child] of Object.entries(shape)) {
        properties.set(key, transform(child as z.ZodTypeAny));
      }
      return {
        type: 'object',
        optional: false,
        getDefault: () => getZodDefault(schema),
        properties,
      };
    }

    case z.ZodFirstPartyTypeKind.ZodArray:
      return {
        type: 'array',
        optional: false,
        getDefault: () => getZodDefault(schema),
        item: transform(def.type),
      };

    case z.ZodFirstPartyTypeKind.ZodString:
      return {
        type: 'string',
        optional: false,
        getDefault: () => getZodDefault(schema),
      };

    case z.ZodFirstPartyTypeKind.ZodNumber:
      return {
        type: 'number',
        optional: false,
        getDefault: () => getZodDefault(schema),
      };

    case z.ZodFirstPartyTypeKind.ZodBoolean:
      return {
        type: 'boolean',
        optional: false,
        getDefault: () => getZodDefault(schema),
      };

    case z.ZodFirstPartyTypeKind.ZodDate:
      return {
        type: 'date',
        optional: false,
        getDefault: () => getZodDefault(schema),
      };

    case z.ZodFirstPartyTypeKind.ZodBigInt:
      return {
        type: 'bigint',
        optional: false,
        getDefault: () => getZodDefault(schema),
      };

    case z.ZodFirstPartyTypeKind.ZodOptional:
    case z.ZodFirstPartyTypeKind.ZodNullable: {
      const inner = transform(def.innerType);
      return {
        ...inner,
        optional: true,
        getDefault: () => getZodDefault(schema) ?? inner.getDefault(),
      };
    }

    case z.ZodFirstPartyTypeKind.ZodDefault: {
      const inner = transform(def.innerType);
      return {
        ...inner,
        getDefault: () => def.defaultValue(),
      };
    }

    case z.ZodFirstPartyTypeKind.ZodEnum:
    case z.ZodFirstPartyTypeKind.ZodLiteral:
    case z.ZodFirstPartyTypeKind.ZodNativeEnum:
      return {
        type: 'string',
        optional: false,
        getDefault: () => getZodDefault(schema),
      };

    case z.ZodFirstPartyTypeKind.ZodUnion: {
      const inner = transform(def.options[0]);
      return { ...inner, optional: false, getDefault: () => getZodDefault(schema) };
    }

    case z.ZodFirstPartyTypeKind.ZodIntersection: {
      // Use left side (POC limitation)
      const inner = transform(def.left);
      return { ...inner, optional: false, getDefault: () => getZodDefault(schema) };
    }

    case z.ZodFirstPartyTypeKind.ZodEffects: {
      // Unwrap refine/transform wrappers
      return transform(def.schema);
    }

    default:
      return {
        type: 'unknown',
        optional: false,
        getDefault: () => getZodDefault(schema),
      };
  }
}
