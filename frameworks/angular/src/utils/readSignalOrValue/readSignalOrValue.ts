import type { Signal } from '@angular/core';
import type { SignalOrValue } from '../../types/index.ts';

/**
 * Reads a value that may be an Angular signal.
 *
 * @param value The value or signal to read.
 *
 * @returns The read value.
 */
export function readSignalOrValue<TValue>(value: SignalOrValue<TValue>): TValue;
export function readSignalOrValue(value: SignalOrValue<unknown>): unknown {
  if (typeof value === 'function') {
    return (value as Signal<unknown>)();
  }
  return value;
}
