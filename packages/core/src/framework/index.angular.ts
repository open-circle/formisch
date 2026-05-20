import { signal, untracked } from '@angular/core';
import type { Signal } from '../types/signal.ts';
import type { Framework } from './index.ts';

/**
 * The current framework being used.
 */
export const framework: Framework = 'angular';

/**
 * Creates a unique identifier string.
 *
 * @returns The unique identifier.
 */
// @__NO_SIDE_EFFECTS__
export function createId(): string {
  return Math.random().toString(36).slice(2);
}

/**
 * Creates a reactive signal without an initial value.
 *
 * @returns The created signal.
 */
export function createSignal<T>(): Signal<T | undefined>;

/**
 * Creates a reactive signal with an initial value.
 *
 * @param value The initial value.
 *
 * @returns The created signal.
 */
export function createSignal<T>(value: T): Signal<T>;

// @__NO_SIDE_EFFECTS__
export function createSignal<T>(initialValue?: T): Signal<T | undefined> {
  const writableSignal = signal(initialValue);
  return {
    get value() {
      return writableSignal();
    },
    set value(nextValue) {
      writableSignal.set(nextValue);
    },
  };
}

/**
 * Batches multiple signal updates into a single update cycle. This is a
 * no-op in Angular as batching is handled automatically.
 *
 * @param fn The function to execute.
 *
 * @returns The return value of the function.
 */
export function batch<T>(fn: () => T): T {
  return fn();
}

/**
 * Executes a function without tracking reactive dependencies.
 *
 * @param fn The function to execute.
 *
 * @returns The return value of the function.
 */
export function untrack<T>(fn: () => T): T {
  return untracked(fn);
}
