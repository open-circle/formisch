import type {
  InternalFormStore,
  Schema,
  SchemaLevelBehavior,
} from '../types/index.ts';

/**
 * Returns the effective form behavior configuration for a given schema instance.
 *
 * Sources are merged in the following priority order:
 * 1. Schema instance: if the schema defines a `"~formisch"` behavior object, its
 *    `equals` and/or `transform` functions take precedence.
 * 2. Form configuration: form-level behavior settings are used when the schema
 *    does not provide them.
 * 3. Default values: when neither the schema nor the form configuration provide a value,
 *    sensible defaults are used:
 *    - `equals`: strict equality comparison (`a === b`).
 *    - `transform`: identity function (returns the input value unchanged).
 *
 * @param internalFormStore - The internal form store providing form-level configuration.
 * @param schema - The schema whose `"~formisch"` behavior (if present) should be applied.
 *
 * @returns A `SchemaLevelBehavior` object with `equals` and `transform` functions composed
 *          from the highest-priority available source.
 *
 * ## Remarks
 * - This function reads from the reserved `"~formisch"` key on the schema to obtain behavior configuration.
 * - The schema object is not modified; configuration is read-only and merged.
 */
export function getSchemaLevelBehavior(
  internalFormStore: InternalFormStore,
  schema: Schema
): SchemaLevelBehavior {
  // Use a per-function WeakMap cache keyed by schema
  const cache: WeakMap<Schema, SchemaLevelBehavior> =
    // @ts-expect-error: Attach cache to function object
    getSchemaLevelBehavior.__cache ??
    // @ts-expect-error: Attach cache to function object
    (getSchemaLevelBehavior.__cache = new WeakMap<
      Schema,
      SchemaLevelBehavior
    >());

  // Return cached result if available
  const cached = cache.get(schema);
  if (cached) {
    return cached;
  }

  // Compute and cache the result (apply defaults, then form config, then schema overrides)
  const behavior: SchemaLevelBehavior = {
    ...defaultBehavior,
    ...((internalFormStore.custom.schemaLevelBehavior?.(schema) ??
      {}) as SchemaLevelBehavior),
    ...((schema['~formisch'] ?? {}) as SchemaLevelBehavior),
  };

  cache.set(schema, behavior);
  return behavior;
}

const defaultBehavior: SchemaLevelBehavior = {
  equals: (a, b) => a === b,
  transform: (value) => value,
};
