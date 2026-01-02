import type { Schema } from './schema.ts';

export interface SchemaLevelBehavior {
  equals: (a: unknown, b: unknown) => boolean;
  transform: (value: unknown) => unknown;
}

/**
 * # Advanced Customizations
 *
 * Apply advanced customizations to the form.
 *
 * ## Customize Schema Level Behavior
 *
 * You can customize the behavior of schema-level operations such as equality checks
 * and value transformations by implementing the `schemaLevelBehavior` function.
 *
 * This function receives a schema and should return an object containing partial
 * `SchemaLevelBehavior` settings (`equals` and/or `transform` functions) that will
 * be applied to all fields using that schema instance.
 *
 * ### Example
 *
 * This is an example using valibot to set all number fields to transform string inputs
 * into actual numbers:
 * ```ts
 * createForm({
 *  // Other configuration...
 *  custom: {
 *    schemaLevelBehavior: (schema) => {
 *      if (schema.type === 'number') {
 *        return {
 *           transform: (value) => Number(value)
 *        }
 *      }
 *    }
 *  }
 * })
 * ```
 *
 * Note that, customizations can also be done on an specific schema instance
 * by setting {@link SchemaLevelBehavior} on the `"~formisch"` key.
 */
export interface AdvancedCustomizations {
  schemaLevelBehavior: (
    schema: Schema
  ) => Partial<SchemaLevelBehavior> | null | undefined;
}
