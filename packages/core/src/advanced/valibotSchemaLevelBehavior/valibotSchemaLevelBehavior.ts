import type { BuiltinSchemaLevelBehavior, Schema } from '../../types/index.ts';

/**
 * Advanced behavior configuration for Valibot schemas.
 *
 * This effects the way values in the schema are compared and transformed, to
 * better match the intent of the developer when using Valibot schemas.
 *
 * ## Supported Types
 *
 * - `number`: Transforms input values to numbers using `Number(value)`. If the
 *   result is `NaN`, the original value is returned.
 * - `date`: Transforms input values to `Date` objects. If the result is an
 *   invalid date, the original value is returned. Equality checks compare the
 *   time values of the dates, to ensure two dates representing the same point
 *   in time are considered equal.
 *
 * ## Extending
 *
 * You can easily extend this to fit your needs.
 *
 * ### Extending In Form Config
 *
 * When creating the form, you can set a custom `schemaLevelBehavior` function.
 * Here's an example of extending the builtin Valibot behavior, with case-insensitive
 * handling for all string schemas.
 * ```ts
 * import { valibotSchemaLevelBehavior } from '@formisch/solid';
 *
 * createForm({
 *   // Other configuration...
 *  advanced: {
 *    schemaLevelBehavior: (schema) => {
 *      // Do your custom handling first
 *      if (schema.type === 'string') {
 *          return {
 *            equals: (a: unknown, b: unknown) => {
 *              return String(a).toLowerCase() === String(b).toLowerCase();
 *            }
 *          }
 *      }
 *      // Fallback to the default valibot behavior
 *      return valibotSchemaLevelBehavior.resolve(schema)
 *    }
 *  }
 * })
 * ```
 *
 * ### Extending Per-Schema Instance
 *
 * You can also extend the behavior on a per-schema instance basis.
 * In this example, we remove the time portion of date comparisons,
 * only considering the date part.
 *
 * ```ts
 * import { withFormischConfig, valibotSchemaLevelBehavior } from '@formisch/solid';
 *
 * MySchema["~formisch"] = {
 *   schemaLevelBehavior: {
 *     transform: (value: unknown) => {
 *        const date = valibotSchemaLevelBehavior.date.transform(value);
 *        date.setHours(0, 0, 0, 0); // Normalize to start of day
 *        return date;
 *     }
 *   }
 * }
 * ```
 */
export const valibotSchemaLevelBehavior: BuiltinSchemaLevelBehavior = {
  resolve(schema: Schema) {
    return this.types[schema.type];
  },
  types: {
    number: {
      transform: (value: unknown) => {
        const num = Number(value);
        return isNaN(num) ? value : num;
      },
    },
    date: {
      transform: (value: unknown) => {
        if (
          typeof value === 'string' ||
          typeof value === 'number' ||
          value instanceof Date
        ) {
          const date = new Date(value);
          // @ts-expect-error We know a Date can be passed to isNaN
          return isNaN(date) ? value : date;
        }
      },
      equals: (a: unknown, b: unknown) => {
        if (a instanceof Date && b instanceof Date) {
          return a.getTime() === b.getTime();
        }
        return a === b;
      },
    },
  },
};
