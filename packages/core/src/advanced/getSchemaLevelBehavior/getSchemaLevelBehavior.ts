import type {
  InternalFormStore,
  Schema,
  SchemaLevelBehavior,
} from '../../types/index.ts';

const defaultBehavior: SchemaLevelBehavior = {
  equals: (a: unknown, b: unknown) => a === b,
  transform: (value: unknown) => value,
};

/**
 * Returns the effective form behavior configuration for a given schema instance.
 *
 * Sources are deeply merged in the following priority order:
 * 1. Schema instance: if the schema defines a `["~formisch"].schemaLevelBehavior`
 *    property, that configuration takes precedence.
 * 2. Form configuration: form-level behavior settings are used when the schema
 *    does not provide them.
 * 3. Default values: when neither the schema nor the form configuration provide a value,
 *    sensible defaults are used:
 *    - `equals`: strict equality comparison (`a === b`).
 *    - `transform`: identity function (returns the input value unchanged).
 *
 * _Deeply merged_ means that if the schema instance defines `transform`
 * but not `equals`, the `equals` function from the form configuration (or default)
 * will be used.
 *
 * @param internalFormStore - The internal form store providing form-level configuration.
 * @param schema - The schema whose `"~formisch"` behavior (if present) should be applied.
 *
 * @returns A `SchemaLevelBehavior` object with `equals` and `transform` functions composed
 *          from the highest-priority available source.
 *
 * - It reads from the `advanced.schemaLevelBehavior` function on the form store
 *   to obtain form-level behavior configuration.
 * - The schema object is not modified; configuration is read-only and merged
 *   with configuration from other sources.
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
    ...((internalFormStore.advanced.schemaLevelBehavior?.(schema) ??
      {}) as SchemaLevelBehavior),
    // @ts-expect-error
    ...((schema['~formisch']?.schemaLevelBehavior ??
      {}) as SchemaLevelBehavior),
  };

  cache.set(schema, behavior);
  return behavior;
}
