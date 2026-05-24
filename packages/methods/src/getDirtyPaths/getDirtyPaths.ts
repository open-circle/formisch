import {
  type BaseFormStore,
  getFieldBool,
  getFieldStore,
  INTERNAL,
  type InternalFieldStore,
  type Path,
  type RequiredPath,
  type FormSchema,
  type ValidPath,
} from '@formisch/core';
import type * as v from 'valibot';

/**
 * Get form dirty paths config interface.
 */
export interface GetFormDirtyPathsConfig {
  /**
   * The path to a field. Leave undefined to inspect the entire form.
   */
  readonly path?: undefined;
}

/**
 * Get field dirty paths config interface.
 */
export interface GetFieldDirtyPathsConfig<
  TSchema extends FormSchema,
  TFieldPath extends RequiredPath,
> {
  /**
   * The path to the field to inspect.
   */
  readonly path: ValidPath<v.InferInput<TSchema>, TFieldPath>;
}

/**
 * Returns a list of paths to dirty fields. Object branches are recursed into;
 * arrays are treated as atomic — when any descendant of an array is dirty,
 * only the array's own path is returned. Returns an empty array if no field
 * in the inspected subtree is dirty.
 *
 * @param form The form store to inspect.
 *
 * @returns The list of paths to dirty fields.
 */
export function getDirtyPaths<TSchema extends FormSchema>(
  form: BaseFormStore<TSchema>
): RequiredPath[];

/**
 * Returns a list of paths to dirty fields. Object branches are recursed into;
 * arrays are treated as atomic — when any descendant of an array is dirty,
 * only the array's own path is returned. Returns an empty array if no field
 * in the inspected subtree is dirty.
 *
 * @param form The form store to inspect.
 * @param config The configuration with a `path` to scope the search.
 *
 * @returns The list of paths to dirty fields.
 */
export function getDirtyPaths<
  TSchema extends FormSchema,
  TFieldPath extends RequiredPath | undefined = undefined,
>(
  form: BaseFormStore<TSchema>,
  config: TFieldPath extends RequiredPath
    ? GetFieldDirtyPathsConfig<TSchema, TFieldPath>
    : GetFormDirtyPathsConfig
): RequiredPath[];

// @__NO_SIDE_EFFECTS__
export function getDirtyPaths(
  form: BaseFormStore,
  config?:
    | GetFormDirtyPathsConfig
    | GetFieldDirtyPathsConfig<FormSchema, RequiredPath>
): RequiredPath[] {
  const target = config?.path
    ? getFieldStore(form[INTERNAL], config.path)
    : form[INTERNAL];

  // Bail with an empty list if no descendant is dirty
  if (!getFieldBool(target, 'isDirty')) {
    return [];
  }

  return collect(target, config?.path ? [...config.path] : []);
}

function collect(
  internalFieldStore: InternalFieldStore,
  currentPath: Path
): RequiredPath[] {
  // Arrays are atomic — emit the array's own path. With `FormSchema`
  // enforcing object roots, `currentPath` is always non-empty here, but the
  // guard keeps the cast honest.
  if (internalFieldStore.kind === 'array') {
    return currentPath.length > 0 ? [currentPath as RequiredPath] : [];
  }

  // For objects: if input is null/undefined, treat as atomic (the whole
  // container changed). Otherwise recurse into dirty children.
  if (internalFieldStore.kind === 'object') {
    if (!internalFieldStore.input.value) {
      return currentPath.length > 0 ? [currentPath as RequiredPath] : [];
    }
    const paths: RequiredPath[] = [];
    for (const key in internalFieldStore.children) {
      const child = internalFieldStore.children[key];
      if (getFieldBool(child, 'isDirty')) {
        paths.push(...collect(child, [...currentPath, key]));
      }
    }
    return paths;
  }

  // Value field — emit its path
  return currentPath.length > 0 ? [currentPath as RequiredPath] : [];
}
