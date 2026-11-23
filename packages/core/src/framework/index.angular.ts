import {
  afterNextRender,
  type AfterRenderRef,
  type EnvironmentInjector,
  signal,
  untracked,
} from '@angular/core';
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
 * Nesting depth of active `batch` calls.
 */
let batchDepth = 0;

/**
 * Whether a signal value actually changed since the latest batch started or
 * since the previous `flushUpdates` call.
 */
let hasPendingSignalWrite = false;

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
      if (!Object.is(untracked(writableSignal), nextValue)) {
        hasPendingSignalWrite = true;
        writableSignal.set(nextValue);
      }
    },
  };
}

/**
 * Batches multiple signal updates into a single update cycle and tracks
 * whether any signal value changed during the cycle.
 *
 * @param fn The function to execute.
 *
 * @returns The return value of the function.
 */
export function batch<T>(fn: () => T): T {
  if (batchDepth === 0) {
    hasPendingSignalWrite = false;
  }
  batchDepth++;
  try {
    return fn();
  } finally {
    batchDepth--;
  }
}

/**
 * Active Angular environment injectors registered by `injectForm` with
 * reference counts.
 */
const injectors = new Map<EnvironmentInjector, number>();

/**
 * Pending `flushUpdates` resolvers tracked per environment injector so
 * destroying an injector never leaves a waiter unresolved.
 */
const pendingResolvers = new Map<EnvironmentInjector, Set<() => void>>();

/**
 * Registers an Angular environment injector so `flushUpdates` can synchronize
 * with Angular's next application-level DOM render pass via `afterNextRender`
 * without binding to any individual component's potentially detached view.
 *
 * @param injector The Angular environment injector to register.
 *
 * @returns A cleanup function to unregister the injector on destroy.
 */
export function registerInjector(injector: EnvironmentInjector): () => void {
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
 * Waits for the next application render pass on a specific Angular environment
 * injector, with a macrotask fallback if no render pass is scheduled.
 *
 * Hint: Angular's Zoneless scheduler schedules ticks via
 * `scheduleCallbackWithRafRace` (`setTimeout(tick, 0)` / `rAF`) or
 * `queueMicrotask` before this helper schedules its fallback `setTimeout(...,
 * 0)`, so active Zoneless renders run `afterNextRender` before the fallback
 * fires while unscheduled/manual change-detection environments resolve cleanly
 * without hanging.
 *
 * @param injector The Angular environment injector to synchronize with.
 *
 * @returns A promise that resolves after the injector finishes rendering or
 *   when no render pass is scheduled.
 */
function waitForInjector(injector: EnvironmentInjector): Promise<void> {
  return new Promise<void>((resolve) => {
    let resolvers = pendingResolvers.get(injector);
    if (!resolvers) {
      resolvers = new Set();
      pendingResolvers.set(injector, resolvers);
    }
    let settled = false;
    let renderRef: AfterRenderRef | undefined;
    let fallbackTimer: ReturnType<typeof setTimeout> | undefined;
    const done = (destroyRef = true): void => {
      if (settled) {
        return;
      }
      settled = true;
      if (fallbackTimer !== undefined) {
        clearTimeout(fallbackTimer);
        fallbackTimer = undefined;
      }
      if (destroyRef) {
        renderRef?.destroy();
      }
      renderRef = undefined;
      resolvers.delete(done);
      if (resolvers.size === 0) {
        pendingResolvers.delete(injector);
      }
      resolve();
    };
    resolvers.add(done);
    try {
      renderRef = afterNextRender(() => done(false), { injector });
      if (!settled) {
        fallbackTimer = setTimeout(() => done(true), 0);
      }
    } catch {
      done(true);
    }
  });
}

/**
 * Waits for Angular to finish rendering pending template updates via
 * `afterNextRender` on registered environment injectors. Returns immediately
 * when no signal write occurred, no browser document is available, or no
 * active injector is registered (e.g. SSR or standalone unit tests).
 *
 * @returns A promise that resolves once Angular finishes rendering, or
 *   undefined when no flush is needed.
 */
export function flushUpdates(): Promise<void> | void {
  const hasWrite = hasPendingSignalWrite;
  hasPendingSignalWrite = false;
  if (!hasWrite || typeof document === 'undefined' || injectors.size === 0) {
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
