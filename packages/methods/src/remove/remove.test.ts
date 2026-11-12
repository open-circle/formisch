import * as v from 'valibot';
import { describe, expect, test } from 'vitest';
import { getInput } from '../getInput/getInput.ts';
import { insert } from '../insert/insert.ts';
import { isDirty } from '../isDirty/isDirty.ts';
import { createTestStore } from '../vitest/index.ts';
import { remove } from './remove.ts';

describe('remove', () => {
  test('should remove item from array', () => {
    const store = createTestStore(v.object({ items: v.array(v.string()) }), {
      initialInput: { items: ['a', 'b', 'c'] },
    });

    remove(store, { path: ['items'], at: 1 });

    const itemsStore = store.children.items;
    expect(itemsStore.kind).toBe('array');
    if (itemsStore.kind === 'array') {
      // items.value tracks the actual count after removal
      expect(itemsStore.items.value).toHaveLength(2);
      // Values are shifted - first item is 'a', second becomes 'c'
      expect(itemsStore.children[0].input.value).toBe('a');
      expect(itemsStore.children[1].input.value).toBe('c');
    }
  });

  test('should remove first item from array', () => {
    const store = createTestStore(v.object({ items: v.array(v.string()) }), {
      initialInput: { items: ['a', 'b', 'c'] },
    });

    remove(store, { path: ['items'], at: 0 });

    const itemsStore = store.children.items;
    expect(itemsStore.kind).toBe('array');
    if (itemsStore.kind === 'array') {
      expect(itemsStore.items.value).toHaveLength(2);
      expect(itemsStore.children[0].input.value).toBe('b');
      expect(itemsStore.children[1].input.value).toBe('c');
    }
  });

  test('should remove last item from array', () => {
    const store = createTestStore(v.object({ items: v.array(v.string()) }), {
      initialInput: { items: ['a', 'b', 'c'] },
    });

    remove(store, { path: ['items'], at: 2 });

    const itemsStore = store.children.items;
    expect(itemsStore.kind).toBe('array');
    if (itemsStore.kind === 'array') {
      expect(itemsStore.items.value).toHaveLength(2);
      expect(itemsStore.children[0].input.value).toBe('a');
      expect(itemsStore.children[1].input.value).toBe('b');
    }
  });

  test('should mark array as dirty after removal', () => {
    const store = createTestStore(v.object({ items: v.array(v.string()) }), {
      initialInput: { items: ['a', 'b', 'c'] },
    });

    remove(store, { path: ['items'], at: 1 });

    expect(store.children.items.isDirty.value).toBe(true);
  });

  test('should clear dirty state when removing inserted item', () => {
    const store = createTestStore(v.object({ items: v.array(v.string()) }), {
      initialInput: { items: ['a'] },
    });

    insert(store, { path: ['items'], initialInput: 'b' });
    expect(store.children.items.isDirty.value).toBe(true);

    // The item IDs equal the baseline again, so the array is clean
    remove(store, { path: ['items'], at: 1 });
    expect(store.children.items.isDirty.value).toBe(false);
    expect(isDirty(store)).toBe(false);
  });

  test.each([null, undefined])(
    'should keep array with start input %s dirty when removing inserted item',
    (startInput) => {
      const store = createTestStore(
        v.object({ items: v.nullish(v.array(v.string())) }),
        { initialInput: { items: startInput } }
      );

      insert(store, { path: ['items'], initialInput: 'a' });
      remove(store, { path: ['items'], at: 0 });

      // The array is present now, so its input differs from the baseline
      // although no item is left
      expect(getInput(store)).toEqual({ items: [] });
      expect(store.children.items.isDirty.value).toBe(true);
      expect(isDirty(store)).toBe(true);
    }
  );

  test('should keep form dirty when removing item inserted below nullish parent', () => {
    const store = createTestStore(
      v.object({
        group: v.nullish(v.object({ items: v.array(v.string()) })),
      }),
      { initialInput: { group: null } }
    );

    insert(store, { path: ['group', 'items'], initialInput: 'a' });
    remove(store, { path: ['group', 'items'], at: 0 });

    // The parent is present now, so the input differs from the baseline
    // although the array has its start items again
    expect(getInput(store)).toEqual({ group: { items: [] } });
    expect(store.children.group.isDirty.value).toBe(true);
    expect(isDirty(store)).toBe(true);
  });

  test('should mark array as edited after removal', () => {
    const store = createTestStore(v.object({ items: v.array(v.string()) }), {
      initialInput: { items: ['a', 'b', 'c'] },
    });

    remove(store, { path: ['items'], at: 1 });

    expect(store.children.items.isEdited.value).toBe(true);
  });

  test('should remove item from nested array', () => {
    const store = createTestStore(
      v.object({ outer: v.object({ items: v.array(v.string()) }) }),
      { initialInput: { outer: { items: ['x', 'y'] } } }
    );

    remove(store, { path: ['outer', 'items'], at: 0 });

    const outerStore = store.children.outer;
    expect(outerStore.kind).toBe('object');
    if (outerStore.kind === 'object') {
      const itemsStore = outerStore.children.items;
      expect(itemsStore.kind).toBe('array');
      if (itemsStore.kind === 'array') {
        expect(itemsStore.items.value).toHaveLength(1);
        expect(itemsStore.children[0].input.value).toBe('y');
      }
    }
  });
});
