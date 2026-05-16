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
 * Removes the optional `?` modifier while keeping `| undefined` in the value
 * type for previously optional properties.
 *
 * Hint: The built-in `Required<T>` and the `-?` modifier strip `| undefined`
 * from optional properties when `exactOptionalPropertyTypes` is disabled,
 * regardless of whether the `| undefined` was implicit or explicitly written
 * in the value. To stay mode-independent, this type splits the input into
 * required and optional keys, recombining via intersection: required keys are
 * picked unchanged, optional keys are funnelled through `Required<Pick<...>>`
 * (which removes the `?` modifier and any undefined the modifier added) and
 * then re-OR'd with `undefined`. Both halves are constructed with
 * homomorphic mapped types so `readonly` modifiers are preserved. The outer
 * conditional short-circuits for arrays and non-object types so that the
 * original type is returned unchanged — otherwise `Pick<string[],
 * keyof string[]>` would collapse the array into a plain object.
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
