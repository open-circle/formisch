import * as v from 'valibot';
import { describe, expect, test } from 'vitest';
import { createTestStore } from '../vitest/index.ts';
import { insert } from './insert.ts';

describe('insert', () => {
  test('should insert item at end of array', () => {
    const store = createTestStore(v.object({ items: v.array(v.string()) }), {
      initialInput: { items: ['a', 'b'] },
    });

    insert(store, { path: ['items'], initialInput: 'c' });

    const itemsStore = store.children.items;
    expect(itemsStore.kind).toBe('array');
    if (itemsStore.kind === 'array') {
      expect(itemsStore.items.value).toHaveLength(3);
      expect(itemsStore.children[2].input.value).toBe('c');
    }
  });

  // TODO: Test insert at specific index once core initializes children slots
  // Coverage note: Lines 93-97 (copyItemState loop) and 112-116 (resetItemState for existing child)
  // are not covered because:
  // 1. The children array is sparse - slots only exist for accessed indices
  // 2. When inserting at index X < items.length, the loop tries to copy from children[index-1]
  //    to children[index], but children[items.length] doesn't exist
  // 3. The else branch (resetItemState) only runs if children[insertIndex] already exists,
  //    which doesn't happen with the current core initialization strategy
  // This results in 80% coverage for insert.ts - the remaining 20% requires core changes.

  test('should mark array as dirty after insert', () => {
    const store = createTestStore(v.object({ items: v.array(v.string()) }), {
      initialInput: { items: ['a'] },
    });

    insert(store, { path: ['items'], initialInput: 'b' });

    expect(store.children.items.isDirty.value).toBe(true);
  });

  test('should insert object item', () => {
    const store = createTestStore(
      v.object({ users: v.array(v.object({ name: v.string() })) }),
      { initialInput: { users: [{ name: 'John' }] } }
    );

    insert(store, { path: ['users'], initialInput: { name: 'Jane' } });

    const usersStore = store.children.users;
    expect(usersStore.kind).toBe('array');
    if (usersStore.kind === 'array') {
      expect(usersStore.items.value).toHaveLength(2);
      const secondUser = usersStore.children[1];
      expect(secondUser.kind).toBe('object');
      if (secondUser.kind === 'object') {
        expect(secondUser.children.name.input.value).toBe('Jane');
      }
    }
  });

  test('should insert into empty array', () => {
    const store = createTestStore(v.object({ items: v.array(v.string()) }), {
      initialInput: { items: [] },
    });

    insert(store, { path: ['items'], initialInput: 'first' });

    const itemsStore = store.children.items;
    expect(itemsStore.kind).toBe('array');
    if (itemsStore.kind === 'array') {
      expect(itemsStore.items.value).toHaveLength(1);
      expect(itemsStore.children[0].input.value).toBe('first');
    }
  });

  test('should insert into nested array', () => {
    const store = createTestStore(
      v.object({ outer: v.object({ items: v.array(v.string()) }) }),
      { initialInput: { outer: { items: ['x'] } } }
    );

    insert(store, { path: ['outer', 'items'], initialInput: 'y' });

    const outerStore = store.children.outer;
    expect(outerStore.kind).toBe('object');
    if (outerStore.kind === 'object') {
      const itemsStore = outerStore.children.items;
      expect(itemsStore.kind).toBe('array');
      if (itemsStore.kind === 'array') {
        expect(itemsStore.items.value).toHaveLength(2);
        expect(itemsStore.children[1].input.value).toBe('y');
      }
    }
  });
});
