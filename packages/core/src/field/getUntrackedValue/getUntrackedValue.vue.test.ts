import { describe, expect, test } from 'vitest';
import {
  type EffectScope,
  getCurrentScope,
  shallowRef,
  watchEffect,
} from 'vue';
import type { Signal } from '../../types/index.ts';
import { getUntrackedValue } from './getUntrackedValue.vue.ts';

/**
 * Creates a signal that has no internal value and reads a shallow ref through
 * its public getter.
 *
 * @param initialValue The initial value.
 *
 * @returns The created signal.
 */
function createPublicSignal<T>(initialValue: T): Signal<T> {
  const source = shallowRef(initialValue);
  return {
    get value() {
      return source.value;
    },
    set value(nextValue: T) {
      source.value = nextValue;
    },
  };
}

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

  test.each(['John', 0, false, null, undefined])(
    'should return current value %s of signal without internal value',
    (value) => {
      const signal = createPublicSignal<unknown>('initial');
      signal.value = value;
      expect(getUntrackedValue(signal)).toBe(value);
    }
  );

  test('should not subscribe surrounding effect to signal without internal value', () => {
    const signal = createPublicSignal<string | undefined>(undefined);
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

  test('should not read signal without internal value again when it changes', () => {
    const source = shallowRef('John');
    let reads = 0;
    const signal: Signal<string> = {
      get value() {
        reads++;
        return source.value;
      },
      set value(nextValue: string) {
        source.value = nextValue;
      },
    };
    expect(getUntrackedValue(signal)).toBe('John');
    expect(reads).toBe(1);

    signal.value = 'Jane';
    expect(reads).toBe(1);
  });

  test('should stop its scope when signal without internal value throws', () => {
    const error = new Error('failed');
    let scope: EffectScope | undefined;
    const signal: Signal<string> = {
      get value(): string {
        scope = getCurrentScope();
        throw error;
      },
    };
    expect(() => getUntrackedValue(signal)).toThrow(error);
    expect(scope?.active).toBe(false);
  });
});
