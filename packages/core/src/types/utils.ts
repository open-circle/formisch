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
 * Detects whether the consuming project is compiled with
 * `exactOptionalPropertyTypes: false`. Under loose mode the built-in
 * `Required<T>` strips `| undefined` from optional properties, so
 * `Required<{ k?: undefined }>['k']` collapses to `never` — under strict
 * mode the same expression yields `undefined`.
 */
type IsLooseMode = Required<{ k?: undefined }>['k'] extends never
  ? true
  : false;

/**
 * Removes the optional `?` modifier from properties while preserving the
 * value type — including any `| undefined` the schema author wrote
 * explicitly.
 *
 * Hint: Strict and loose `exactOptionalPropertyTypes` modes treat optional
 * properties differently. Under strict mode, `Required<Pick<T, K>>[K]`
 * already returns the precise value (with or without `| undefined`
 * depending on what the schema author wrote), so we leave it alone — which
 * lets `v.exactOptional(...)` keep its "must be `T`, never `undefined`"
 * meaning and `v.optional(...)` keep its "may be `undefined`" meaning.
 * Under loose mode the distinction is erased by the compiler before we see
 * it, so we default to adding `| undefined` — this matches how the
 * consumer's TypeScript already treats optional access in loose mode, and
 * it preserves `| undefined` for `v.nullish`/`v.optional` (issue #15). The
 * outer conditionals short-circuit arrays and non-object types so
 * primitives and arrays pass through unchanged.
 */
export type ExactRequired<TValue> = TValue extends readonly unknown[]
  ? TValue
  : TValue extends object
    ? OptionalKeys<TValue> extends never
      ? TValue
      : Prettify<
          Pick<TValue, Exclude<keyof TValue, OptionalKeys<TValue>>> & {
            [TKey in keyof Required<Pick<TValue, OptionalKeys<TValue>>>]:
              | Required<Pick<TValue, OptionalKeys<TValue>>>[TKey]
              | (IsLooseMode extends true ? undefined : never);
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
