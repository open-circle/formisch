import { describe, expect, test } from 'vitest';
import { shallowRef, watchEffect } from 'vue';
import { getUntrackedValue } from './getUntrackedValue.vue.ts';

describe('getUntrackedValue (vue)', () => {
  test.each(['John', 0, false, null, undefined])(
    'should return current value %s of shallow ref',
    (value) => {
      const signal = shallowRef<unknown>('initial');
      signal.value = value;
      expect(getUntrackedValue(signal)).toBe(value);
    }
  );

  test('should not subscribe surrounding effect to shallow ref', () => {
    const signal = shallowRef<string | undefined>();
    let runs = 0;
    const stop = watchEffect(
      () => {
        runs++;
        getUntrackedValue(signal);
      },
      { flush: 'sync' }
    );
    expect(runs).toBe(1);

    signal.value = 'John';
    expect(runs).toBe(1);

    stop();
  });

  test('should fall back to value of signal without internal value', () => {
    expect(getUntrackedValue({ value: 'John' })).toBe('John');
  });
});
