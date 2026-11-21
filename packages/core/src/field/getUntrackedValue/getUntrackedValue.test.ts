import { describe, expect, test } from 'vitest';
import { createSignal } from '../../framework/index.ts';
import { getUntrackedValue } from './getUntrackedValue.ts';

describe('getUntrackedValue', () => {
  test('should return current value of signal', () => {
    const signal = createSignal('John');
    expect(getUntrackedValue(signal)).toBe('John');
    signal.value = 'Jane';
    expect(getUntrackedValue(signal)).toBe('Jane');
  });
});
