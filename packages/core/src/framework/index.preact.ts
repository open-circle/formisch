import type { Framework } from './index.ts';

export {
  signal as createSignal,
  untracked as untrack,
  batch,
} from '@preact/signals';

/**
 * The current framework being used.
 */
export const framework: Framework = 'preact';

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
 * Waits for pending DOM updates to flush after reactive state writes.
 *
 * Hint: Preact flushes component re-renders on the first microtask, while
 * `@preact/signals` schedules direct signal-bound DOM attribute and text
 * updates through two nested `queueMicrotask` calls. Waiting two microtasks
 * ensures both component markup and signal-bound attributes have updated.
 *
 * @returns A promise that resolves once Preact and `@preact/signals` finish
 *   flushing pending DOM updates.
 */
export function flushUpdates(): Promise<void> {
  return new Promise<void>((resolve) => {
    queueMicrotask(() => {
      queueMicrotask(resolve);
    });
  });
}
