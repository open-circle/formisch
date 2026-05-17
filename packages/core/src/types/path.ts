import type {
  ExactKeysOf,
  ExactRequired,
  IsAny,
  IsNever,
  PropertiesOf,
} from './utils.ts';

/**
 * Path key type.
 */
export type PathKey = string | number;

/**
 * Path type.
 */
export type Path = readonly PathKey[];

/**
 * Required path type.
 */
export type RequiredPath = readonly [PathKey, ...Path];

/**
 * Lazily evaluates only the first valid path segment based on the given value.
 */
type LazyPath<
  TValue,
  TPathToCheck extends Path,
  TValidPath extends Path = readonly [],
> =
  // If path to check is empty, return last valid path
  TPathToCheck extends readonly []
    ? TValidPath
    : // If first key of path to check is valid, continue with next key
      TPathToCheck extends readonly [
          infer TFirstKey extends ExactKeysOf<TValue> & PathKey,
          ...infer TPathRest extends Path,
        ]
      ? LazyPath<
          Required<PropertiesOf<TValue>[TFirstKey]>,
          TPathRest,
          readonly [...TValidPath, TFirstKey]
        >
      : // If current value has valid keys, return them
        IsNever<ExactKeysOf<TValue>> extends false
        ? readonly [...TValidPath, ExactKeysOf<TValue>]
        : // Otherwise, return only last valid path
          TValidPath;

/**
 * Returns the path if valid, otherwise the first possible valid path based on
 * the given value.
 */
export type ValidPath<TValue, TPath extends RequiredPath> =
  TPath extends LazyPath<Required<TValue>, TPath>
    ? TPath
    : LazyPath<Required<TValue>, TPath>;

/**
 * Extracts the value type at the given path.
 */
export type PathValue<TValue, TPath extends Path> = TPath extends readonly [
  infer TKey,
  ...infer TRest extends Path,
]
  ? TKey extends ExactKeysOf<ExactRequired<TValue>>
    ? PathValue<PropertiesOf<ExactRequired<TValue>>[TKey], TRest>
    : unknown
  : TValue;

/**
 * Checks whether a value is an array or contains one anywhere in its shape.
 *
 * Hint: The inner conditionals (`TValue extends readonly unknown[]` and
 * `TValue extends Record<string, unknown>`) distribute over union members,
 * so the inner expression returns the union of each member's result (e.g.
 * `true | false` when some members contain arrays and others don't).
 * Downstream code uses `IsOrHasArray<T> extends true`, but
 * `boolean extends true` is `false` — so we collapse the result via
 * `true extends ...`, which is `true` whenever at least one union member
 * contributed `true`.
 */
type IsOrHasArray<TValue> = true extends (
  IsAny<TValue> extends true
    ? false
    : TValue extends readonly unknown[]
      ? true
      : TValue extends Record<string, unknown>
        ? {
            [TKey in keyof TValue]: IsOrHasArray<TValue[TKey]>;
          }[keyof TValue]
        : false
)
  ? true
  : false;

/**
 * Extracts the exact keys of a tuple, array or object that contain arrays.
 */
export type ExactKeysOfArrayPath<TValue> =
  IsAny<TValue> extends true
    ? never
    : TValue extends readonly (infer TItem)[]
      ? number extends TValue['length']
        ? IsOrHasArray<TItem> extends true
          ? number
          : never
        : {
            [TKey in keyof TValue]: TKey extends `${infer TIndex extends number}`
              ? IsOrHasArray<NonNullable<TValue[TKey]>> extends true
                ? TIndex
                : never
              : never;
          }[number]
      : TValue extends Record<string, unknown>
        ? {
            [TKey in keyof TValue]: IsOrHasArray<
              NonNullable<TValue[TKey]>
            > extends true
              ? TKey
              : never;
          }[keyof TValue]
        : never;

/**
 * Returns the flat object of indexable properties of `TValue` whose values
 * are or contain arrays. Mirrors `PropertiesOf` but keyed by
 * `ExactKeysOfArrayPath` so the lookup is provably valid for array-path
 * navigation in `LazyArrayPath`.
 */
export type PropertiesOfArrayPath<TValue> = {
  [TKey in ExactKeysOfArrayPath<TValue>]: TValue extends Record<
    TKey,
    infer TItem
  >
    ? TItem
    : never;
};

/**
 * Lazily evaluates only the first valid array path segment based on the given value.
 */
type LazyArrayPath<
  TValue,
  TPathToCheck extends Path,
  TValidPath extends Path = readonly [],
> =
  // If path to check is empty, return possible array paths
  TPathToCheck extends readonly []
    ? TValue extends readonly unknown[]
      ? TValidPath
      : readonly [...TValidPath, ExactKeysOfArrayPath<TValue>]
    : // If first key of path to check is valid, continue with next key
      TPathToCheck extends readonly [
          infer TFirstKey extends ExactKeysOfArrayPath<TValue> & PathKey,
          ...infer TPathRest extends Path,
        ]
      ? LazyArrayPath<
          Required<PropertiesOfArrayPath<TValue>[TFirstKey]>,
          TPathRest,
          readonly [...TValidPath, TFirstKey]
        >
      : // If current value has valid array keys, return them
        IsNever<ExactKeysOfArrayPath<TValue>> extends false
        ? readonly [...TValidPath, ExactKeysOfArrayPath<TValue>]
        : // Otherwise, no valid array keys exist
          never;

/**
 * Returns the path if valid, otherwise the first possible valid array path
 * based on the given value.
 */
export type ValidArrayPath<TValue, TPath extends RequiredPath> =
  TPath extends LazyArrayPath<Required<TValue>, TPath>
    ? TPath
    : LazyArrayPath<Required<TValue>, TPath>;
