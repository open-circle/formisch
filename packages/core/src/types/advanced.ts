import type { Schema } from './schema.ts';

/**
 * Defines behavior functions for schema-level operations.
 *
 * - `equals`: A function to determine equality between two values. Used to set `isDirty` state.
 * - `transform`: A function to transform input values before they are set in the form state.
 */
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
 * - These customizations only work on fields with `kind === "value"`.
 * - The transform is not applied when setting initial input.
 *
 * This function receives a schema and should return an object containing partial
 * `SchemaLevelBehavior` settings (`equals` and/or `transform` functions) that will
 * be applied to all fields using that schema instance.
 *
 * ### Example
 *
 * This is an example (using valibot as the schema library) which sets all
 * number fields to transform string inputs into actual numbers:
 * ```ts
 * createForm({
 *  // Other configuration...
 *  advanced: {
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

/**
 * Advanced configuration options for the form.
 */
export interface AdvancedConfig {
  /**
   * Customize the behavior of fields based on their schema.
   */
  schemaLevelBehavior: (
    schema: Schema
  ) => Partial<SchemaLevelBehavior> | null | undefined;
}

/**
 * Type for builtin schema level behavior configurations.
 * 
 * Maps schema types to schema level behavior configurations.
 * 
 * It's designed so that you can use the builtins as a base to create your own custom behavior.
 * 
 * ## Example
 * 
 * This is a snippet from the builtin valibot behaviour.
 *
 * ```ts
 * const valibotSchemaLevelBehavior = {
 *  resolve(schema: Schema): SchemaLevelBehavior | undefined {
 *    return this[schema.type];
 *  },
 *  {
 *    types: {
 *      number: {
 *        transform: (value: unknown) => {
 *          // ...
 *        },
 *      },
 *      date: {
 *        equals: (a: unknown, b: unknown) => {
 *          // ...
 *        },
 *      },
 *   }
 * },
 * ```
 */
export interface BuiltinSchemaLevelBehavior {
  resolve(schema: Schema): Partial<SchemaLevelBehavior> | undefined
  types: Record<string, Partial<SchemaLevelBehavior>>
}