import type { FormischFieldIR, FormischSchema, FormSchemaIR } from './ir.ts';

/**
 * Schema type.
 *
 * A Standard Schema augmented with the Formisch IR. Use
 * {@link FormSchemaIR} for the root form schema (which must be an object).
 */
export type Schema = FormischSchema;

/**
 * Form schema type.
 *
 * The root of a form must be an object. The IR is produced by a
 * library-specific adapter (e.g. `@formisch/valibot`) and carried alongside
 * the Standard Schema `~standard` passthrough.
 */
export type FormSchema = FormSchemaIR;

/**
 * Re-export the IR types for adapter authors and consumers.
 */
export type {
  FormischFieldIR,
  FormischFieldType,
  FormischSchema,
  FormischSchemaProps,
} from './ir.ts';
