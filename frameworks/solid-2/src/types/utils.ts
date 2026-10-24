/**
 * Constructs a type that is maybe a getter function.
 */
export type MaybeGetter<TValue> = TValue | (() => TValue);
