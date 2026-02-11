import type { IsAny, IsNever } from './utils.ts';

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
 * Extracts the exact keys of a tuple, array or object.
 */
type KeyOf<TValue> =
  IsAny<TValue> extends true
    ? never
    : TValue extends readonly unknown[]
      ? number extends TValue['length']
        ? number
        : {
            [TKey in keyof TValue]: TKey extends `${infer TIndex extends number}`
              ? TIndex
              : never;
          }[number]
      : TValue extends Record<string, unknown>
        ? keyof TValue & PathKey
        : never;

/**
 * Merges array and object unions into a single object.
 *
 * Hint: This is necessary to make any property accessible. By default,
 * properties that do not exist in all union options are not accessible
 * and result in "any" when accessed.
 */
type MergeUnion<TValue> = {
  [TKey in KeyOf<TValue>]: TValue extends Record<TKey, infer TItem>
    ? TItem
    : never;
};

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
          infer TFirstKey extends KeyOf<TValue>,
          ...infer TPathRest extends Path,
        ]
      ? LazyPath<
          Required<MergeUnion<TValue>[TFirstKey]>,
          TPathRest,
          readonly [...TValidPath, TFirstKey]
        >
      : // If current value has valid keys, return them
        IsNever<KeyOf<TValue>> extends false
        ? readonly [...TValidPath, KeyOf<TValue>]
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
  ? TKey extends KeyOf<Required<TValue>>
    ? PathValue<MergeUnion<Required<TValue>>[TKey], TRest>
    : unknown
  : TValue;

/**
 * Checks if a value is an array or contains one.
 */
type IsOrHasArray<TValue> =
  IsAny<TValue> extends true
    ? false
    : TValue extends readonly unknown[]
      ? true
      : TValue extends Record<string, unknown>
        ? true extends {
            [TKey in keyof TValue]: IsOrHasArray<TValue[TKey]>;
          }[keyof TValue]
          ? true
          : false
        : false;

/**
 * Extracts the exact keys of a tuple, array or object that contain arrays.
 */
type KeyOfArrayPath<TValue> =
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
          }[keyof TValue] &
            PathKey
        : never;

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
      : readonly [...TValidPath, KeyOfArrayPath<TValue>]
    : // If first key of path to check is valid, continue with next key
      TPathToCheck extends readonly [
          infer TFirstKey extends KeyOfArrayPath<TValue>,
          ...infer TPathRest extends Path,
        ]
      ? LazyArrayPath<
          Required<MergeUnion<TValue>[TFirstKey]>,
          TPathRest,
          readonly [...TValidPath, TFirstKey]
        >
      : // If current value has valid array keys, return them
        IsNever<KeyOfArrayPath<TValue>> extends false
        ? readonly [...TValidPath, KeyOfArrayPath<TValue>]
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
