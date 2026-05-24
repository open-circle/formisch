import type * as v from 'valibot';

/**
 * Schema type.
 */
export type Schema = v.GenericSchema | v.GenericSchemaAsync;

/**
 * Object schema type.
 */
type ObjectSchema =
  | v.LooseObjectSchema<
      v.ObjectEntries,
      v.ErrorMessage<v.LooseObjectIssue> | undefined
    >
  | v.ObjectSchema<v.ObjectEntries, v.ErrorMessage<v.ObjectIssue> | undefined>
  | v.StrictObjectSchema<
      v.ObjectEntries,
      v.ErrorMessage<v.StrictObjectIssue> | undefined
    >
  | v.VariantSchema<
      string,
      v.VariantOptions<string>,
      v.ErrorMessage<v.VariantIssue> | undefined
    >;

/**
 * Object schema async type.
 */
type ObjectSchemaAsync =
  | v.LooseObjectSchemaAsync<
      v.ObjectEntriesAsync,
      v.ErrorMessage<v.LooseObjectIssue> | undefined
    >
  | v.ObjectSchemaAsync<
      v.ObjectEntriesAsync,
      v.ErrorMessage<v.ObjectIssue> | undefined
    >
  | v.StrictObjectSchemaAsync<
      v.ObjectEntriesAsync,
      v.ErrorMessage<v.StrictObjectIssue> | undefined
    >
  | v.VariantSchemaAsync<
      string,
      v.VariantOptionsAsync<string>,
      v.ErrorMessage<v.VariantIssue> | undefined
    >;

/**
 * Object root schema type.
 */
type ObjectRootSchema =
  | ObjectSchema
  | v.IntersectSchema<
      ObjectSchema[],
      v.ErrorMessage<v.IntersectIssue> | undefined
    >
  | v.UnionSchema<
      ObjectSchema[],
      v.ErrorMessage<v.UnionIssue<v.BaseIssue<unknown>>> | undefined
    >;

/**
 * Object root schema async type.
 */
type ObjectRootSchemaAsync =
  | ObjectSchemaAsync
  | v.IntersectSchemaAsync<
      (ObjectSchema | ObjectSchemaAsync)[],
      v.ErrorMessage<v.IntersectIssue> | undefined
    >
  | v.UnionSchemaAsync<
      (ObjectSchema | ObjectSchemaAsync)[],
      v.ErrorMessage<v.UnionIssue<v.BaseIssue<unknown>>> | undefined
    >;

/**
 * Form schema type.
 *
 * Hint: Forms must have an object root, so only object schemas (sync or async),
 * combinators (intersect, union, variant) whose options resolve to objects, and
 * `lazy` schemas wrapping any of these are allowed at the top level. Use
 * {@link Schema} for nested field schemas.
 */
export type FormSchema =
  | ObjectRootSchema
  | ObjectRootSchemaAsync
  | v.LazySchema<ObjectRootSchema>
  | v.LazySchemaAsync<ObjectRootSchema | ObjectRootSchemaAsync>;
