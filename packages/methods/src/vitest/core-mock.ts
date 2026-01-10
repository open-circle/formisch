/**
 * Mock @formisch/core module that provides working framework implementations.
 * This file replaces @formisch/core during testing via vitest alias.
 */

// Re-export everything from the real core EXCEPT framework
export * from '../../../core/src/array/index.ts';
export * from '../../../core/src/field/index.ts';
export * from '../../../core/src/form/index.ts';
export * from '../../../core/src/types/index.ts';
export * from '../../../core/src/values.ts';

// Signal interface
interface Signal<T> {
  value: T;
}

let idCounter = 0;

/**
 * Framework type.
 */
export type Framework =
  | 'preact'
  | 'qwik'
  | 'solid'
  | 'svelte'
  | 'vanilla'
  | 'vue';

/**
 * The current framework being used.
 */
export const framework: Framework = 'vanilla';

/**
 * Creates a mock signal that behaves like a reactive signal.
 */
export function createSignal<T>(): Signal<T | undefined>;
export function createSignal<T>(value: T): Signal<T>;
export function createSignal(value?: unknown): Signal<unknown> {
  return { value };
}

/**
 * Mock batch function that executes immediately.
 */
export function batch<T>(fn: () => T): T {
  return fn();
}

/**
 * Mock untrack function that executes immediately.
 */
export function untrack<T>(fn: () => T): T {
  return fn();
}

/**
 * Mock createId function that returns unique IDs.
 */
export function createId(): string {
  return `id-${idCounter++}`;
}

/**
 * Resets the ID counter for tests.
 */
export function resetIdCounter(): void {
  idCounter = 0;
}
