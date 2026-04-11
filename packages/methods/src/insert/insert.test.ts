import * as v from 'valibot';
import { describe, expect, test } from 'vitest';
import { createTestStore, initializeChildSlot } from '../vitest/index.ts';
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

  test('should insert item at specific index and shift children', () => {
    const store = createTestStore(v.object({ items: v.array(v.string()) }), {
      initialInput: { items: ['a', 'b'] },
    });

    const itemsStore = store.children.items;
    expect(itemsStore.kind).toBe('array');
    if (itemsStore.kind === 'array') {
      insert(store, { path: ['items'], at: 0, initialInput: 'inserted' });

      expect(itemsStore.items.value).toHaveLength(3);
      expect(itemsStore.children[0].input.value).toBe('inserted');
      expect(itemsStore.children[1].input.value).toBe('a');
      expect(itemsStore.children[2].input.value).toBe('b');
    }
  });

  test('should insert at middle index without a preinitialized target slot', () => {
    const store = createTestStore(v.object({ items: v.array(v.string()) }), {
      initialInput: { items: ['a', 'b', 'c'] },
    });

    const itemsStore = store.children.items;
    expect(itemsStore.kind).toBe('array');
    if (itemsStore.kind === 'array') {
      insert(store, { path: ['items'], at: 1, initialInput: 'middle' });

      expect(itemsStore.items.value).toHaveLength(4);
      expect(itemsStore.children[0].input.value).toBe('a');
      expect(itemsStore.children[1].input.value).toBe('middle');
      expect(itemsStore.children[2].input.value).toBe('b');
      expect(itemsStore.children[3].input.value).toBe('c');
    }
  });

  test('should reset existing child when inserting at occupied index', () => {
    const store = createTestStore(v.object({ items: v.array(v.string()) }), {
      initialInput: { items: ['a', 'b'] },
    });

    const itemsStore = store.children.items;
    expect(itemsStore.kind).toBe('array');
    if (itemsStore.kind === 'array') {
      // Pre-initialize slot at index 2 and also at index 0 to make resetItemState branch execute
      initializeChildSlot(itemsStore, 2);

      // Store reference to original child at index 0
      const originalChild = itemsStore.children[0];
      originalChild.isTouched.value = true;
      originalChild.errors.value = ['some error'];

      // Insert at index 0 - should use resetItemState on the existing child
      insert(store, { path: ['items'], at: 0, initialInput: 'reset' });

      expect(itemsStore.items.value).toHaveLength(3);
      // The child at index 0 should have been reset
      expect(itemsStore.children[0].input.value).toBe('reset');
    }
  });

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

  test('should insert object item in the middle without a preinitialized target slot', () => {
    const store = createTestStore(
      v.object({
        runs: v.array(
          v.object({
            name: v.string(),
            config: v.object({
              windowSize: v.number(),
            }),
          })
        ),
      }),
      {
        initialInput: {
          runs: [
            { name: 'Run 1', config: { windowSize: 1 } },
            { name: 'Run 2', config: { windowSize: 2 } },
          ],
        },
      }
    );

    insert(store, {
      path: ['runs'],
      at: 1,
      initialInput: { name: 'Run 1 Copy', config: { windowSize: 9 } },
    });

    const runsStore = store.children.runs;
    expect(runsStore.kind).toBe('array');
    if (runsStore.kind === 'array') {
      expect(runsStore.items.value).toHaveLength(3);

      const insertedRun = runsStore.children[1];
      expect(insertedRun.kind).toBe('object');
      if (insertedRun.kind === 'object') {
        expect(insertedRun.children.name.input.value).toBe('Run 1 Copy');
        const configStore = insertedRun.children.config;
        expect(configStore.kind).toBe('object');
        if (configStore.kind === 'object') {
          expect(configStore.children.windowSize.input.value).toBe(9);
        }
      }

      const shiftedRun = runsStore.children[2];
      expect(shiftedRun.kind).toBe('object');
      if (shiftedRun.kind === 'object') {
        expect(shiftedRun.children.name.input.value).toBe('Run 2');
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
