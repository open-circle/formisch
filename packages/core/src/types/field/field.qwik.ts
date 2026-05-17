import type { NoSerialize } from '@qwik.dev/core';
import type { Schema } from '../schema/index.ts';
import type { Signal } from '../signal/index.ts';
import type { FieldElement } from './field.ts';

/**
 * Internal base store interface.
 */
export interface InternalBaseStore {
  /**
   * The kind of field store.
   */
  kind: 'array' | 'object' | 'value';
  /**
   * The name of the field.
   */
  name: string;
  /**
   * The schema of the field.
   */
  schema: NoSerialize<Schema>;
  /**
   * The elements of the field.
   */
  elements: FieldElement[];
  /**
   * The errors of the field.
   */
  errors: Signal<[string, ...string[]] | null>;
  /**
   * The touched state of the field.
   */
  isTouched: Signal<boolean>;
  /**
   * The dirty state of the field.
   */
  isDirty: Signal<boolean>;
}

/**
 * Internal array store interface.
 */
export interface InternalArrayStore extends InternalBaseStore {
  /**
   * The kind of field store.
   */
  kind: 'array';
  /**
   * The children of the array field.
   */
  children: InternalFieldStore[];

  /**
   * The initial input of the array field.
   *
   * Hint: The initial input is used for resetting and may only be changed
   * during this process. It does not move when a field is moved.
   */
  initialInput: Signal<true | null | undefined>;
  /**
   * The start input of the array field.
   *
   * Hint: The start input is used to determine whether the field is dirty
   * and moves with it.
   */
  startInput: Signal<true | null | undefined>;
  /**
   * The input of the array field.
   *
   * Hint: The input indicates whether it is `null`, `undefined`, or found in
   * the children.
   */
  input: Signal<true | null | undefined>;

  /**
   * The initial items of the array field.
   *
   * Hint: The initial items are used for resetting and may only be changed
   * during this process. It does not move when a field is moved.
   */
  initialItems: Signal<string[]>;
  /**
   * The start items of the array field.
   *
   * Hint: The start items are used to determine whether the field is dirty
   * and moves with it.
   */
  startItems: Signal<string[]>;
  /**
   * The items of the array field.
   */
  items: Signal<string[]>;
}

/**
 * Internal object store interface.
 */
export interface InternalObjectStore extends InternalBaseStore {
  /**
   * The kind of field store.
   */
  kind: 'object';
  /**
   * The children of the object field.
   */
  children: Record<string, InternalFieldStore>;

  /**
   * The initial input of the object field.
   *
   * Hint: The initial input is used for resetting and may only be changed
   * during this process. It does not move when a field is moved.
   */
  initialInput: Signal<true | null | undefined>;
  /**
   * The start input of the object field.
   *
   * Hint: The start input is used to determine whether the field is dirty
   * and moves with it.
   */
  startInput: Signal<true | null | undefined>;
  /**
   * The input of the object field.
   *
   * Hint: The input indicates whether it is `null`, `undefined`, or found in
   * the children.
   */
  input: Signal<true | null | undefined>;
}

/**
 * Internal value store interface.
 */
export interface InternalValueStore extends InternalBaseStore {
  /**
   * The kind of field store.
   */
  kind: 'value';

  /**
   * The initial input of the value field.
   *
   * Hint: The initial input is used for resetting and may only be changed
   * during this process. It does not move when a field is moved.
   */
  initialInput: Signal<unknown>;
  /**
   * The start input of the value field.
   *
   * Hint: The start input is used to determine whether the field is dirty
   * and moves with it.
   */
  startInput: Signal<unknown>;
  /**
   * The input of the value field.
   */
  input: Signal<unknown>;

  /**
   * The touched state of the field.
   */
  isTouched: Signal<boolean>;
  /**
   * The dirty state of the field.
   */
  isDirty: Signal<boolean>;
}

/**
 * Internal field store type.
 */
export type InternalFieldStore =
  | InternalArrayStore
  | InternalObjectStore
  | InternalValueStore;

export { FieldElement };
