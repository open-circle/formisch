import type { Framework } from './index.ts';

export { createSignal, untrack } from '@qwik.dev/core';

/**
 * The current framework being used.
 */
export const framework: Framework = 'qwik';

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
 * Batches multiple signal updates into a single update cycle. This is a
 * no-op in Qwik as batching is not needed.
 *
 * @param fn The function to execute.
 *
 * @returns The return value of the function.
 */
export function batch<T>(fn: () => T): T {
  return fn();
}

/**
 * Qwik container DOM element with its attached runtime container reference.
 */
interface QwikContainerElement extends Element {
  qContainer?: {
    $renderPromise$?: Promise<void> | null;
  };
}

/**
 * Waits for pending Qwik container renders to settle after reactive state
 * writes. Yields a microtask for Qwik's cursor scheduler to run and awaits any
 * active container `$renderPromise$` (including time-sliced or async QRL
 * renders).
 *
 * @returns A promise that resolves once pending Qwik DOM updates have
 *   rendered, or undefined when no DOM document is available.
 */
export function flushUpdates(): Promise<void> | void {
  if (typeof document === 'undefined') {
    return;
  }
  return (async () => {
    await Promise.resolve();
    const seen = new Set<Promise<void>>();
    while (true) {
      const pending: Promise<void>[] = [];
      for (const element of document.querySelectorAll<QwikContainerElement>(
        '[q\\:container]'
      )) {
        const renderPromise = element.qContainer?.$renderPromise$;
        if (renderPromise && !seen.has(renderPromise)) {
          seen.add(renderPromise);
          pending.push(renderPromise);
        }
      }
      if (pending.length === 0) {
        break;
      }
      await Promise.allSettled(pending);
    }
  })();
}
