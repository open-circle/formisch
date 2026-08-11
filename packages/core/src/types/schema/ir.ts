import type { StandardSchemaV1 } from '@standard-schema/spec';

/**
 * Field type in the Formisch intermediate representation.
 *
 * The IR abstracts over library-specific schema types (Valibot, Zod, etc.) so
 * the core form logic never needs to import a validation library.
 */
export type FormischFieldType =
  | 'object'
  | 'array'
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'bigint'
  | 'unknown';

/**
 * Intermediate representation of a single field in the schema tree.
 *
 * Produced by a library-specific adapter (e.g. `@formisch/valibot`,
 * `@formisch/zod`) and consumed by the framework-agnostic core.
 */
export interface FormischFieldIR {
  /**
   * The structural type of this field.
   */
  readonly type: FormischFieldType;

  /**
   * Whether the field is optional/nullable/nullish at the schema level.
   *
   * The adapter resolves all wrapper types (`optional`, `nullable`, `nullish`,
   * `non_optional`, etc.) into this single boolean at transform time so the
   * core never has to unwrap schemas itself.
   */
  readonly optional: boolean;

  /**
   * Returns the default value for this field as defined by the schema, or
   * `undefined` if no default is set.
   */
  getDefault(): unknown;

  /**
   * Object children keyed by property name. Only present when `type` is
   * `'object'`.
   */
  readonly properties?: ReadonlyMap<string, FormischFieldIR>;

  /**
   * Array element schema. Only present when `type` is `'array'`.
   */
  readonly item?: FormischFieldIR;
}

/**
 * Internal marker property attached to a Standard Schema to carry the
 * Formisch IR alongside the standard `~standard` validate entry point.
 */
export interface FormischSchemaProps {
  /**
   * The Formisch IR marker.
   */
  readonly '~formisch': {
    readonly version: 1;
    readonly root: FormischFieldIR;
  };
}

/**
 * A Standard Schema augmented with the Formisch IR.
 *
 * The adapter wraps a library-specific schema with `~formisch` (the IR root)
 * while keeping the `~standard` passthrough for validation. The core reads the
 * IR for field initialization and form-data decoding and uses `~standard` for
 * validation.
 */
export type FormischSchema = StandardSchemaV1 & FormischSchemaProps;

/**
 * A form-level schema whose root must be an object.
 */
export type FormSchemaIR = FormischSchema & {
  readonly '~formisch': {
    readonly version: 1;
    readonly root: FormischFieldIR & { readonly type: 'object' };
  };
};
