import * as qwik from '@qwik.dev/core';
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
 * Qwik runtime container reference attached to a `[q:container]` DOM element.
 */
interface QwikContainer {
  $renderPromise$?: Promise<void> | null;
}

/**
 * Qwik container DOM element with its attached runtime container reference.
 */
interface QwikContainerElement extends Element {
  qContainer?: QwikContainer;
}

/**
 * Finds the nearest `[q:container]` ancestor for an element, traversing across
 * open/closed shadow DOM boundaries via `getRootNode().host`.
 *
 * @param element The starting DOM element.
 *
 * @returns The enclosing Qwik container element, or null if none is found.
 */
function findQwikContainer(element: Element): QwikContainerElement | null {
  let current: Element | null = element;
  while (current) {
    const container = current.closest<QwikContainerElement>('[q\\:container]');
    if (container) {
      return container;
    }
    const root = current.getRootNode();
    current =
      typeof ShadowRoot !== 'undefined' && root instanceof ShadowRoot
        ? root.host
        : null;
  }
  return null;
}

/**
 * Reads an active pending render promise from a Qwik container in both dev and
 * production builds.
 *
 * Hint: `@qwik.dev/core` mangles `container.$renderPromise$` in production
 * builds, while `_waitUntilRendered(container)` is exported in dev, prod, and
 * min builds and returns `renderPromise || Promise.resolve()`. Calling it twice
 * synchronously yields the same promise reference when a render is active and
 * distinct resolved promises when idle.
 *
 * @param container The Qwik runtime container.
 *
 * @returns The active render promise, or undefined if no render is pending.
 */
function getContainerRenderPromise(
  container: QwikContainer
): Promise<void> | undefined {
  const waitUntilRendered = (
    qwik as unknown as {
      _waitUntilRendered?: (target: QwikContainer) => Promise<void>;
    }
  )._waitUntilRendered;
  if (typeof waitUntilRendered === 'function') {
    const first = waitUntilRendered(container);
    const second = waitUntilRendered(container);
    if (first === second) {
      return first;
    }
  }
  return container.$renderPromise$ ?? undefined;
}

/**
 * Waits for pending Qwik container renders to settle after reactive state
 * writes. Yields a microtask for Qwik's cursor scheduler to run and awaits any
 * active container render promise (including time-sliced or async QRL renders).
 * When `elements` are provided, scopes the scan to the `[q:container]`
 * ancestors of those elements (crossing shadow boundaries) so unrelated islands
 * cannot block validation.
 *
 * @param elements Optional elements associated with the update to scope the
 *   container scan.
 *
 * @returns A promise that resolves once pending Qwik DOM updates have
 *   rendered, or undefined when no DOM document is available.
 */
export function flushUpdates(
  elements?: readonly unknown[]
): Promise<void> | void {
  if (typeof document === 'undefined') {
    return;
  }
  return (async () => {
    await Promise.resolve();
    const seen = new Set<Promise<void>>();
    while (true) {
      let containers: Iterable<QwikContainerElement>;
      if (elements !== undefined) {
        const scoped = new Set<QwikContainerElement>();
        if (typeof Element !== 'undefined') {
          for (const item of elements) {
            if (item instanceof Element) {
              const container = findQwikContainer(item);
              if (container) {
                scoped.add(container);
              }
            }
          }
        }
        containers = scoped;
      } else {
        containers =
          document.querySelectorAll<QwikContainerElement>('[q\\:container]');
      }
      const pending: Promise<void>[] = [];
      for (const element of containers) {
        const renderPromise = element.qContainer
          ? getContainerRenderPromise(element.qContainer)
          : undefined;
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
