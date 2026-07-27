import { signal } from '@angular/core';
import { describe, expect, test } from 'vitest';
import { readSignalOrValue } from './readSignalOrValue.ts';

describe('readSignalOrValue', () => {
  test('should return the value as-is when not a signal', () => {
    expect(readSignalOrValue(42)).toBe(42);
    expect(readSignalOrValue('hello')).toBe('hello');
    expect(readSignalOrValue(null)).toBe(null);
    const obj = { a: 1 };
    expect(readSignalOrValue(obj)).toBe(obj);
  });

  test('should return a plain function as-is when TValue is a function type', () => {
    // When TValue is itself a function, the old `typeof === 'function'` check would
    // incorrectly invoke it. isSignal() correctly treats it as a plain value.
    const fn = (): string => 'result';
    expect(readSignalOrValue<typeof fn>(fn)).toBe(fn);
  });

  test('should read the signal when a signal is passed', () => {
    expect(readSignalOrValue(signal(42))).toBe(42);
    const obj = { a: 1 };
    expect(readSignalOrValue(signal(obj))).toBe(obj);
  });
});
