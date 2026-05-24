import type { Schema } from './schema.ts';

export type { Schema };

/**
 * Form schema type.
 *
 * Hint: For Solid, `FormSchema` falls back to the broader {@link Schema} type.
 * SolidStart's TypeScript setup evaluates valibot's deeply recursive
 * `IntersectSchema` and `VariantSchema` types differently, which causes valid
 * `intersect` and `variant` form schemas to be wrongly rejected by the precise
 * `FormSchema` type used by the other frameworks. Forms still require an object
 * root at runtime, which valibot enforces while parsing.
 */
export type FormSchema = Schema;
