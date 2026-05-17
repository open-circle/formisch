/**
 * Checks if a type is `any`.
 */
export type IsAny<T> = 0 extends 1 & T ? true : false;

/**
 * Checks if a type is `never`.
 */
export type IsNever<T> = [T] extends [never] ? true : false;

/**
 * Constructs a type that is maybe a promise.
 */
export type MaybePromise<T> = T | Promise<T>;

/**
 * Keys of `TValue` that are marked optional (`?`).
 */
type OptionalKeys<TValue> = {
  [TKey in keyof TValue]-?: {} extends Pick<TValue, TKey> ? TKey : never;
}[keyof TValue];

/**
 * Prettifies a type for better readability.
 *
 * Hint: This type has no effect and is only used so that TypeScript displays
 * the final type in the preview instead of the utility types used.
 */
type Prettify<TObject> = { [TKey in keyof TObject]: TObject[TKey] } & {};

/**
 * Detects whether the consuming project is configured with
 * `exactOptionalPropertyTypes: true`.
 *
 * Hint: If `false` the built-in `Required<T>` strips `| undefined` from
 * optional properties, so `Required<{ key?: undefined }>['key']` collapses
 * to `never` — under strict mode the same expression yields `undefined`.
 */
type IsExactOptionalProps = Required<{ key?: undefined }>['key'] extends never
  ? false
  : true;

/**
 * Helper type used in the beginning of an intersection to ensure that the
 * properties of the resulting type are ordered in the same way as the input
 * type. This is purely cosmetic and has no effect on the resulting type.
 */
type EnsureKeyOrder<TValue> = { [TKey in keyof TValue]?: unknown };

/**
 * Like the built-in `Required<T>`, but keeps `| undefined` in the value
 * type for optional properties even when `exactOptionalPropertyTypes` is
 * `false` — `Required<T>` strips it in that mode, which would otherwise
 * narrow input typings for `v.optional`/`v.nullish` schemas (issue #15).
 */
export type ExactRequired<TValue> =
  // Guard arrays/tuples first — they satisfy the object check below but
  // would be wrongly transformed by the loose-mode branch otherwise.
  TValue extends readonly unknown[]
    ? TValue
    : TValue extends Record<PropertyKey, unknown>
      ? // If `exactOptionalPropertyTypes` is `true`, the built-in
        // `Required<TValue>` already preserves the exact value of optional
        // properties, so we can delegate directly to it.
        IsExactOptionalProps extends true
        ? Required<TValue>
        : // If `exactOptionalPropertyTypes` is `false`, we check if the object
          // has any optional keys. If not, we can return the type as-is without
          // the overhead of the split-and-recombine.
          OptionalKeys<TValue> extends never
          ? TValue
          : // Otherwise, we split the object into required and optional keys, apply
            // `Required<T>` to the optional keys to remove the `?` modifier, and
            // re-add `| undefined` to preserve the loose optional semantics. The
            // `EnsureKeyOrder` helper at the beginning ensures that the resulting
            // properties are ordered in the same way as the input type.
            Prettify<
              EnsureKeyOrder<TValue> &
                Pick<TValue, Exclude<keyof TValue, OptionalKeys<TValue>>> & {
                  [TKey in keyof Required<Pick<TValue, OptionalKeys<TValue>>>]:
                    | Required<Pick<TValue, OptionalKeys<TValue>>>[TKey]
                    | undefined;
                }
            >
      : TValue;

/**
 * Makes all properties deeply optional.
 */
export type DeepPartial<TValue> = TValue extends
  | Record<PropertyKey, unknown>
  | readonly unknown[]
  ? { [TKey in keyof TValue]?: DeepPartial<TValue[TKey]> | undefined }
  : TValue | undefined;

/**
 * Makes all value properties optional.
 *
 * Hint: For dynamic arrays, only plain objects and nested arrays have their
 * values made optional. Primitives and class instances are kept as-is to avoid
 * types like `(string | undefined)[]`.
 */
export type PartialValues<TValue> = TValue extends readonly (infer TItem)[]
  ? number extends TValue['length']
    ? // Hint: `infer TItem` is a naked type parameter that distributes the
      // conditional over each union member individually. `TValue[number]`
      // would not distribute, causing unions like `string | { id: number }`
      // to fail the object and array check as a whole and skip recursion
      // entirely, leaving object members like `{ id: number }` unchanged.
      (TItem extends Record<PropertyKey, unknown> | readonly unknown[]
        ? { [TKey in keyof TItem]: PartialValues<TItem[TKey]> }
        : TItem)[]
    : // For tuples, recurse into each position making values optional
      { [TKey in keyof TValue]: PartialValues<TValue[TKey]> }
  : // For objects, recurse into each property making values optional
    TValue extends Record<PropertyKey, unknown>
    ? { [TKey in keyof TValue]: PartialValues<TValue[TKey]> }
    : // For primitives, make the value itself optional
      TValue | undefined;
