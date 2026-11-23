import { afterNextRender, type Injector, signal } from '@angular/core';
import type { Signal } from '../types/signal/index.ts';
import type { Framework } from './index.ts';

export { untracked as untrack } from '@angular/core';

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
 * Creates a reactive signal with an initial value.
 *
 * @param initialValue The initial value.
 *
 * @returns The created signal.
 */
// @__NO_SIDE_EFFECTS__
export function createSignal<T>(initialValue: T): Signal<T> {
  const writableSignal = signal(initialValue);
  return {
    get value() {
      return writableSignal();
    },
    set value(nextValue: T) {
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
 * Active Angular injectors registered by `injectForm` with reference counts.
 */
const injectors = new Map<Injector, number>();

/**
 * Pending `flushUpdates` resolvers tracked per injector so destroying a
 * component never leaves a waiter unresolved.
 */
const pendingResolvers = new Map<Injector, Set<() => void>>();

/**
 * Registers an Angular injector so `flushUpdates` can synchronize with
 * Angular's next DOM render pass via `afterNextRender`.
 *
 * @param injector The Angular injector to register.
 *
 * @returns A cleanup function to unregister the injector on destroy.
 */
export function registerInjector(injector: Injector): () => void {
  let unregistered = false;
  injectors.set(injector, (injectors.get(injector) ?? 0) + 1);
  return () => {
    if (unregistered) {
      return;
    }
    unregistered = true;
    const count = (injectors.get(injector) ?? 0) - 1;
    if (count > 0) {
      injectors.set(injector, count);
    } else {
      injectors.delete(injector);
      const resolvers = pendingResolvers.get(injector);
      if (resolvers) {
        pendingResolvers.delete(injector);
        for (const resolve of resolvers) {
          resolve();
        }
      }
    }
  };
}

/**
 * Waits for the next render pass on a specific Angular injector.
 *
 * @param injector The Angular injector to synchronize with.
 *
 * @returns A promise that resolves after the injector finishes rendering.
 */
function waitForInjector(injector: Injector): Promise<void> {
  return new Promise<void>((resolve) => {
    let resolvers = pendingResolvers.get(injector);
    if (!resolvers) {
      resolvers = new Set();
      pendingResolvers.set(injector, resolvers);
    }
    const done = (): void => {
      resolvers.delete(done);
      if (resolvers.size === 0) {
        pendingResolvers.delete(injector);
      }
      resolve();
    };
    resolvers.add(done);
    try {
      afterNextRender(done, { injector });
    } catch {
      done();
    }
  });
}

/**
 * Waits for Angular to finish rendering pending template updates via
 * `afterNextRender` on registered injectors. Returns immediately when no
 * browser document or active injector is registered (e.g. SSR or standalone
 * unit tests).
 *
 * @returns A promise that resolves once Angular finishes rendering, or
 *   undefined when no active injector is registered.
 */
export function flushUpdates(): Promise<void> | void {
  if (typeof document === 'undefined' || injectors.size === 0) {
    return;
  }
  const activeInjectors = [...injectors.keys()];
  if (activeInjectors.length === 1) {
    return waitForInjector(activeInjectors[0]);
  }
  return Promise.all(activeInjectors.map(waitForInjector)).then(
    () => undefined
  );
}
