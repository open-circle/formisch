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
 * Active `flushUpdates` waiter scoped to a specific set of pending listeners.
 */
interface FlushWaiter {
  pending: Set<Listener>;
  resolve: () => void;
}

/**
 * Active `flushUpdates` waiters waiting for their scoped listeners to settle.
 */
const flushWaiters = new Set<FlushWaiter>();

/**
 * Nesting depth of active subscriber notification cycles.
 */
let notificationDepth = 0;

/**
 * Registered listeners notified during the active top-level notification cycle.
 */
let cycleNotified: Set<Listener> | undefined;

/**
 * Registered listeners notified by the most recent completed notification
 * cycle, consumed by `flushUpdates`.
 */
let lastNotifiedListeners: Set<Listener> | undefined;

/**
 * Marks a listener as settled (committed, unregistered, or threw during
 * notification) and resolves any waiters whose pending set becomes empty.
 *
 * @param targetListener The listener that settled.
 */
function settleListener(targetListener: Listener): void {
  pendingListeners.delete(targetListener);
  for (const waiter of flushWaiters) {
    if (waiter.pending.delete(targetListener) && waiter.pending.size === 0) {
      flushWaiters.delete(waiter);
      waiter.resolve();
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
    cycleNotified?.add(subscriber);
  }
  try {
    subscriber[0]();
  } catch (error) {
    if (isRegistered) {
      settleListener(subscriber);
    }
    throw error;
  }
}

/**
 * Runs a subscriber notification cycle and records the registered listeners
 * notified by the top-level cycle for `flushUpdates`.
 *
 * @param subscribers The subscribers to notify.
 */
function notifySubscribers(subscribers: Iterable<Listener>): void {
  const isTopLevel = notificationDepth === 0;
  if (isTopLevel) {
    cycleNotified = new Set();
  }
  notificationDepth++;
  try {
    for (const subscriber of subscribers) {
      notifyListener(subscriber);
    }
  } finally {
    notificationDepth--;
    if (isTopLevel) {
      lastNotifiedListeners = cycleNotified;
      cycleNotified = undefined;
    }
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
 * Marks a component listener's queued render as committed and resolves any
 * scoped `flushUpdates` waiters whose pending listeners have all committed.
 *
 * @param targetListener The committed component listener.
 */
export function markListenerCommitted(targetListener: Listener): void {
  settleListener(targetListener);
}

/**
 * Unregisters an unmounted component listener so it can never block
 * `flushUpdates`.
 *
 * @param targetListener The component listener to unregister.
 */
export function unregisterListener(targetListener: Listener): void {
  registeredListeners.delete(targetListener);
  settleListener(targetListener);
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
        if (!batchSubscribers) {
          notifySubscribers(localSubscribers);
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
      notifySubscribers(subscribers);
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
 * Waits for pending component commits scheduled by the latest signal
 * notification cycle to finish.
 *
 * @returns A promise that resolves once all `useSignals` components notified
 *   by the latest cycle have committed or unregistered, or undefined if none
 *   are pending.
 */
export function flushUpdates(): Promise<void> | void {
  const candidates = lastNotifiedListeners;
  lastNotifiedListeners = undefined;
  if (!candidates || candidates.size === 0) {
    return;
  }
  const pending = new Set<Listener>();
  for (const candidate of candidates) {
    if (pendingListeners.has(candidate)) {
      pending.add(candidate);
    }
  }
  if (pending.size === 0) {
    return;
  }
  return new Promise<void>((resolve) => {
    flushWaiters.add({ pending, resolve });
  });
}
