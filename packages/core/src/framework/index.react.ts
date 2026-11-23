import type { Signal } from '../types/signal/index.ts';
import type { Framework } from './index.ts';

/**
 * The current framework being used.
 */
export const framework: Framework = 'react';

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
 * Listener tuple.
 *
 * Hint: The first element is the execute function, which notifies the listener
 * about updates. The second element is the subscription set, which keeps track
 * of where the listener is subscribed and is used to clean up subscriptions if
 * they are no longer needed.
 */
export type Listener = [() => void, Set<Set<Listener>>];

/**
 * The current listener being tracked.
 */
let listener: Listener | undefined;

/**
 * Sets the current listener being tracked.
 *
 * @param newListener The new listener to set.
 */
export function setListener(newListener: Listener | undefined): void {
  listener = newListener;
}

/**
 * Subscribers collected during a batch.
 */
let batchSubscribers: Set<Listener> | undefined;

/**
 * Mounted component listeners registered by `useSignals`.
 */
const registeredListeners = new Set<Listener>();

/**
 * Registered listeners whose queued re-render has not yet committed.
 */
const pendingListeners = new Set<Listener>();

/**
 * Pending `flushUpdates` resolvers waiting for active commits to finish.
 */
let flushResolvers: (() => void)[] | undefined;

/**
 * Resolves all pending `flushUpdates` waiters once no component commits remain.
 */
function resolveFlushWaiters(): void {
  if (pendingListeners.size === 0 && flushResolvers) {
    const resolvers = flushResolvers;
    flushResolvers = undefined;
    for (const resolve of resolvers) {
      resolve();
    }
  }
}

/**
 * Notifies a single subscriber and tracks its commit if it is a mounted
 * component listener.
 *
 * @param subscriber The listener to notify.
 */
function notifyListener(subscriber: Listener): void {
  const isRegistered = registeredListeners.has(subscriber);
  if (isRegistered) {
    pendingListeners.add(subscriber);
  }
  try {
    subscriber[0]();
  } catch (error) {
    if (isRegistered) {
      pendingListeners.delete(subscriber);
      resolveFlushWaiters();
    }
    throw error;
  }
}

/**
 * Registers a mounted component listener so `flushUpdates` waits for its
 * committed render after signal notifications.
 *
 * @param targetListener The component listener to register.
 */
export function registerListener(targetListener: Listener): void {
  registeredListeners.add(targetListener);
}

/**
 * Marks a component listener's queued render as committed and resolves pending
 * `flushUpdates` waiters once all pending listeners have committed.
 *
 * @param targetListener The committed component listener.
 */
export function markListenerCommitted(targetListener: Listener): void {
  if (pendingListeners.delete(targetListener)) {
    resolveFlushWaiters();
  }
}

/**
 * Unregisters an unmounted component listener so it can never block
 * `flushUpdates`.
 *
 * @param targetListener The component listener to unregister.
 */
export function unregisterListener(targetListener: Listener): void {
  registeredListeners.delete(targetListener);
  if (pendingListeners.delete(targetListener)) {
    resolveFlushWaiters();
  }
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
export function createSignal(value?: unknown): Signal<unknown> {
  const subscribers = new Set<Listener>();
  return {
    get value() {
      if (listener) {
        subscribers.add(listener);
        listener[1].add(subscribers);
      }
      return value;
    },
    set value(newValue: unknown) {
      if (newValue !== value) {
        value = newValue;
        const localSubscribers: Listener[] = [];
        for (const subscriber of subscribers) {
          if (batchSubscribers) {
            batchSubscribers.add(subscriber);
          } else {
            localSubscribers.push(subscriber);
          }
          subscriber[1].delete(subscribers);
        }
        subscribers.clear();
        for (const subscriber of localSubscribers) {
          notifyListener(subscriber);
        }
      }
    },
  };
}

// Global batch depth counter
let batchDepth = 0;

/**
 * Batches multiple signal updates into a single update cycle.
 *
 * @param fn The function to execute in batch.
 *
 * @returns The return value of the function.
 */
export function batch<T>(fn: () => T): T {
  batchDepth++;
  if (!batchSubscribers) {
    batchSubscribers = new Set();
  }
  try {
    return fn();
  } finally {
    batchDepth--;
    if (batchDepth === 0) {
      const subscribers = batchSubscribers;
      batchSubscribers = undefined;
      for (const subscriber of subscribers) {
        notifyListener(subscriber);
      }
    }
  }
}

/**
 * Executes a function without tracking reactive dependencies.
 *
 * @param fn The function to execute without tracking.
 *
 * @returns The return value of the function.
 */
export function untrack<T>(fn: () => T): T {
  const prev = listener;
  listener = undefined;
  try {
    return fn();
  } finally {
    listener = prev;
  }
}

/**
 * Waits for pending component commits scheduled by signal updates to finish.
 *
 * @returns A promise that resolves once all notified `useSignals` components
 *   have committed, or undefined if no component updates are pending.
 */
export function flushUpdates(): Promise<void> | void {
  if (pendingListeners.size === 0) {
    return;
  }
  return new Promise<void>((resolve) => {
    if (!flushResolvers) {
      flushResolvers = [];
    }
    flushResolvers.push(resolve);
  });
}
