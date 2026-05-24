import {
  type BaseFormStore,
  type DeepPartial,
  getFieldBool,
  INTERNAL,
  type InternalFieldStore,
  type FormSchema,
} from '@formisch/core';

/**
 * Pick dirty config interface.
 */
export interface PickDirtyConfig<TValue> {
  /**
   * The value to filter down to its dirty parts.
   */
  readonly from: TValue;
}

/**
 * Picks only the dirty parts of the given value, using the form's dirty
 * tree as a structural mask. Object keys whose subtree contains no dirty
 * descendant are omitted; arrays are treated as atomic and returned in full
 * whenever any descendant is dirty. Returns `undefined` if no field is dirty
 * or if the value's shape does not align with the form. Useful for filtering
 * a validated output to just the changed parts before submitting.
 *
 * @param form The form store providing the dirty mask.
 * @param config The pick dirty configuration.
 *
 * @returns The dirty parts of the value, or `undefined`.
 */
// @__NO_SIDE_EFFECTS__
export function pickDirty<TSchema extends FormSchema, TValue>(
  form: BaseFormStore<TSchema>,
  config: PickDirtyConfig<TValue>
): DeepPartial<TValue> | undefined {
  const result = pickFromField(form[INTERNAL], config.from);
  return result === SKIP ? undefined : (result as DeepPartial<TValue>);
}

// Sentinel returned when a subtree contributes nothing to the result.
// Distinct from `undefined` so that a dirty leaf whose value is `undefined`
// is still included rather than skipped.
const SKIP = Symbol();

// Recursively walks the form's dirty tree alongside the supplied value,
// plucking only the parts that correspond to dirty fields and whose shape
// aligns with the form. Returns `SKIP` when nothing should be included.
function pickFromField(
  internalFieldStore: InternalFieldStore,
  value: unknown
): unknown {
  // Bail with sentinel if no descendant is dirty
  if (!getFieldBool(internalFieldStore, 'isDirty')) {
    return SKIP;
  }

  // If field store is array, return the value if it is an array (atomic).
  // Otherwise the shapes diverged and there is nothing safe to pluck.
  if (internalFieldStore.kind === 'array') {
    return Array.isArray(value) ? value : SKIP;
  }

  // If field store is object, recurse only into dirty branches when the
  // value is a non-array object. Skip when shapes diverge.
  if (internalFieldStore.kind === 'object') {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      return SKIP;
    }
    const result: Record<string, unknown> = {};
    let added = false;
    for (const key in internalFieldStore.children) {
      const child = internalFieldStore.children[key];
      if (getFieldBool(child, 'isDirty')) {
        const childResult = pickFromField(
          child,
          (value as Record<string, unknown>)[key]
        );
        if (childResult !== SKIP) {
          result[key] = childResult;
          added = true;
        }
      }
    }
    return added ? result : SKIP;
  }

  // Return value as-is for primitive value field
  return value;
}
