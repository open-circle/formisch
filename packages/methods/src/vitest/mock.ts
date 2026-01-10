import { vi } from 'vitest';

/**
 * Signal interface for mocking.
 */
interface Signal<T> {
  value: T;
}

let idCounter = 0;

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

/**
 * Mocks the framework module with test implementations.
 */
export function mockFramework(): void {
  vi.mock('@formisch/core', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@formisch/core')>();
    return {
      ...actual,
      framework: 'vanilla',
      createSignal,
      batch,
      untrack,
      createId,
    };
  });
}
