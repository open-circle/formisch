import * as v from 'valibot';
import { describe, expect, test } from 'vitest';
import { createTestStore } from '../../vitest/index.ts';
import { setInitialFieldInput } from './setInitialFieldInput.ts';

describe('setInitialFieldInput', () => {
  describe('value fields', () => {
    test('should set initial input', () => {
      const store = createTestStore(v.object({ name: v.string() }));
      setInitialFieldInput(store.children.name, 'John');
      expect(store.children.name.initialInput.value).toBe('John');
    });
  });

  describe('object fields', () => {
    test('should set initial input on nested children', () => {
      const store = createTestStore(
        v.object({ user: v.object({ name: v.string() }) })
      );
      setInitialFieldInput(store.children.user, { name: 'John' });
      const userStore = store.children.user;
      expect(userStore.kind).toBe('object');
      if (userStore.kind === 'object') {
        expect(userStore.children.name.initialInput.value).toBe('John');
      }
    });

    test('should set null input for nullish object', () => {
      const store = createTestStore(
        v.object({ user: v.nullish(v.object({ name: v.string() })) }),
        { initialInput: { user: { name: 'John' } } }
      );
      setInitialFieldInput(store.children.user, null);
      expect(store.children.user.input.value).toBeNull();
    });
  });

  describe('array fields', () => {
    test('should set initial items', () => {
      const store = createTestStore(v.object({ items: v.array(v.string()) }), {
        initialInput: { items: ['a'] },
      });
      setInitialFieldInput(store.children.items, ['x', 'y']);
      const itemsStore = store.children.items;
      expect(itemsStore.kind).toBe('array');
      if (itemsStore.kind === 'array') {
        expect(itemsStore.initialItems.value).toHaveLength(2);
      }
    });

    test('should initialize new children when array grows', () => {
      const store = createTestStore(v.object({ items: v.array(v.string()) }), {
        initialInput: { items: ['a'] },
      });
      setInitialFieldInput(store.children.items, ['x', 'y', 'z']);
      const itemsStore = store.children.items;
      expect(itemsStore.kind).toBe('array');
      if (itemsStore.kind === 'array') {
        expect(itemsStore.children).toHaveLength(3);
        expect(itemsStore.children[2].initialInput.value).toBe('z');
      }
    });

    test('should set null input for nullish array', () => {
      const store = createTestStore(
        v.object({ items: v.nullish(v.array(v.string())) }),
        { initialInput: { items: ['a'] } }
      );
      setInitialFieldInput(store.children.items, null);
      expect(store.children.items.input.value).toBeNull();
    });

    test('should set initial input on existing children', () => {
      const store = createTestStore(v.object({ items: v.array(v.string()) }), {
        initialInput: { items: ['a', 'b'] },
      });
      const itemsStore = store.children.items;
      setInitialFieldInput(itemsStore, ['x', 'y']);
      expect(itemsStore.kind).toBe('array');
      if (itemsStore.kind === 'array') {
        expect(itemsStore.children[0].initialInput.value).toBe('x');
        expect(itemsStore.children[1].initialInput.value).toBe('y');
      }
    });
  });
});
