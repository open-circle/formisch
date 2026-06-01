import type { Signal } from '@angular/core';

/**
 * Constructs a type that is maybe an Angular signal.
 */
export type SignalOrValue<TValue> = TValue | Signal<TValue>;
