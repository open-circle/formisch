import type * as v from 'valibot';

/**
 * Schema type.
 */
export type Schema = v.GenericSchema | v.GenericSchemaAsync;

/**
 * Form schema type.
 *
 * Hint: Forms must have an object root, so only object schemas (sync or async)
 * and combinators (intersect, union, variant) whose options resolve to objects
 * are allowed at the top level. Use {@link Schema} for nested field schemas.
 */
export type FormSchema =
  | v.IntersectSchema<
      v.IntersectOptions,
      v.ErrorMessage<v.IntersectIssue> | undefined
    >
  | v.IntersectSchemaAsync<
      v.IntersectOptionsAsync,
      v.ErrorMessage<v.IntersectIssue> | undefined
    >
  | v.LooseObjectSchema<
      v.ObjectEntries,
      v.ErrorMessage<v.LooseObjectIssue> | undefined
    >
  | v.LooseObjectSchemaAsync<
      v.ObjectEntriesAsync,
      v.ErrorMessage<v.LooseObjectIssue> | undefined
    >
  | v.ObjectSchema<v.ObjectEntries, v.ErrorMessage<v.ObjectIssue> | undefined>
  | v.ObjectSchemaAsync<
      v.ObjectEntriesAsync,
      v.ErrorMessage<v.ObjectIssue> | undefined
    >
  | v.StrictObjectSchema<
      v.ObjectEntries,
      v.ErrorMessage<v.StrictObjectIssue> | undefined
    >
  | v.StrictObjectSchemaAsync<
      v.ObjectEntriesAsync,
      v.ErrorMessage<v.StrictObjectIssue> | undefined
    >
  | v.UnionSchema<
      v.UnionOptions,
      v.ErrorMessage<v.UnionIssue<v.BaseIssue<unknown>>> | undefined
    >
  | v.UnionSchemaAsync<
      v.UnionOptionsAsync,
      v.ErrorMessage<v.UnionIssue<v.BaseIssue<unknown>>> | undefined
    >
  | v.VariantSchema<
      string,
      v.VariantOptions<string>,
      v.ErrorMessage<v.VariantIssue> | undefined
    >
  | v.VariantSchemaAsync<
      string,
      v.VariantOptionsAsync<string>,
      v.ErrorMessage<v.VariantIssue> | undefined
    >;
