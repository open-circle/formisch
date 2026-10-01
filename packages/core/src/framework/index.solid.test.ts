import { createEffect, createMemo, createRoot, flush, untrack } from 'solid-js';
import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import { getFieldInput } from '../field/getFieldInput/getFieldInput.ts';
import { setFieldInput } from '../field/setFieldInput/setFieldInput.ts';
import { createFormStore } from '../form/createFormStore/createFormStore.ts';
import { batch, createSignal } from './index.solid.ts';

vi.mock('./index.ts', async () => await import('./index.solid.ts'));

describe('Solid 2 adapter', () => {
  test('should expose every write immediately, including repeated increments', () => {
    const count = createSignal(0);
    for (let index = 1; index <= 3; index++) {
      count.value++;
      expect(count.value).toBe(index);
      expect(count.value).toBe(index);
    }
    flush();
    expect(count.value).toBe(3);
  });

  test('should store functions without invoking or deriving them', () => {
    const first = vi.fn(() => 'first');
    const second = vi.fn(() => 'second');
    const value = createSignal(first);
    expect(value.value).toBe(first);
    value.value = second;
    expect(value.value).toBe(second);
    flush();
    expect(value.value).toBe(second);
    expect(first).not.toHaveBeenCalled();
    expect(second).not.toHaveBeenCalled();
  });

  test('should publish nested batches together and preserve return values', () => {
    createRoot((dispose) => {
      try {
        const first = createSignal(0);
        const second = createSignal(0);
        const observed: number[][] = [];
        createEffect(
          () => [first.value, second.value],
          (value) => {
            observed.push(value);
          }
        );
        flush();
        expect(observed).toEqual([[0, 0]]);
        expect(
          batch(() => {
            first.value = 1;
            expect(
              batch(() => {
                second.value = 2;
                return second.value;
              })
            ).toBe(2);
            expect(observed).toEqual([[0, 0]]);
            first.value++;
            return first.value;
          })
        ).toBe(2);
        flush();
        expect(observed).toEqual([
          [0, 0],
          [2, 2],
        ]);
        first.value = 2;
        second.value = 2;
        flush();
        expect(observed).toEqual([
          [0, 0],
          [2, 2],
        ]);
      } finally {
        dispose();
      }
    });
  });

  test('should permit writes and immediate reads inside an owned computation', () => {
    createRoot((dispose) => {
      try {
        const count = createSignal(0);
        const result = createMemo(() =>
          untrack(() =>
            batch(() => {
              count.value = 1;
              count.value++;
              return count.value;
            })
          )
        );
        expect(result()).toBe(2);
      } finally {
        dispose();
      }
    });
  });

  test('should resize arrays repeatedly and update form dirty state immediately', () => {
    createRoot((dispose) => {
      try {
        const schema = v.object({ items: v.array(v.string()) });
        const store = createFormStore(
          { schema, initialInput: { items: ['a', 'b'] } },
          async (input) => v.safeParse(schema, input)
        );
        const items = store.children.items;
        expect(items.kind).toBe('array');
        if (items.kind === 'array') {
          batch(() => {
            setFieldInput(store, ['items'], ['x']);
            expect(getFieldInput(store)).toEqual({ items: ['x'] });
            expect(items.items.value).toHaveLength(1);
            expect(items.isDirty.value).toBe(true);
            setFieldInput(store, ['items'], ['a', 'b', 'c']);
            expect(getFieldInput(store)).toEqual({ items: ['a', 'b', 'c'] });
            expect(items.items.value).toHaveLength(3);
            setFieldInput(store, ['items'], ['a', 'b']);
            expect(items.isDirty.value).toBe(false);
            expect(getFieldInput(store)).toEqual({ items: ['a', 'b'] });
          });
          flush();
          expect(getFieldInput(store)).toEqual({ items: ['a', 'b'] });
        }
      } finally {
        dispose();
      }
    });
  });
});
