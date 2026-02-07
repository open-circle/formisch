// @vitest-environment jsdom
import * as v from 'valibot';
import { describe, expect, test } from 'vitest';
import { createTestStore } from '../../vitest/index.ts';
import { resetItemState } from './resetItemState.ts';

describe('resetItemState', () => {
  describe('value fields', () => {
    test('should reset value field to new input', () => {
      const store = createTestStore(v.object({ name: v.string() }), {
        initialInput: { name: 'John' },
      });

      const nameStore = store.children.name;

      // Modify state
      nameStore.input.value = 'modified';
      nameStore.isTouched.value = true;
      nameStore.isDirty.value = true;
      nameStore.errors.value = ['Error'];
      nameStore.elements = [document.createElement('input')];

      resetItemState(nameStore, 'reset-value');

      expect(nameStore.input.value).toBe('reset-value');
      expect(nameStore.startInput.value).toBe('reset-value');
      expect(nameStore.isTouched.value).toBe(false);
      expect(nameStore.isDirty.value).toBe(false);
      expect(nameStore.errors.value).toBe(null);
      expect(nameStore.elements).toEqual([]);
    });

    test('should handle undefined input', () => {
      const store = createTestStore(
        v.object({ name: v.optional(v.string()) }),
        { initialInput: { name: 'John' } }
      );

      const nameStore = store.children.name;
      nameStore.input.value = 'modified';

      resetItemState(nameStore, undefined);

      expect(nameStore.input.value).toBe(undefined);
      expect(nameStore.startInput.value).toBe(undefined);
    });
  });

  describe('object fields', () => {
    test('should reset object field and children', () => {
      const store = createTestStore(
        v.object({ user: v.object({ name: v.string(), age: v.number() }) }),
        { initialInput: { user: { name: 'John', age: 30 } } }
      );

      const userStore = store.children.user;
      expect(userStore.kind).toBe('object');

      if (userStore.kind === 'object') {
        // Modify state
        userStore.children.name.input.value = 'modified';
        userStore.children.name.isTouched.value = true;
        userStore.children.age.input.value = 99;

        resetItemState(userStore, { name: 'Jane', age: 25 });

        expect(userStore.input.value).toBe(true);
        expect(userStore.startInput.value).toBe(true);
        expect(userStore.isTouched.value).toBe(false);
        expect(userStore.children.name.input.value).toBe('Jane');
        expect(userStore.children.name.isTouched.value).toBe(false);
        expect(userStore.children.age.input.value).toBe(25);
      }
    });

    test('should handle null input for object', () => {
      const store = createTestStore(
        v.object({ user: v.optional(v.object({ name: v.string() })) }),
        { initialInput: { user: { name: 'John' } } }
      );

      const userStore = store.children.user;
      expect(userStore.kind).toBe('object');

      if (userStore.kind === 'object') {
        resetItemState(userStore, null);

        expect(userStore.input.value).toBe(null);
        expect(userStore.startInput.value).toBe(null);
      }
    });
  });

  describe('array fields', () => {
    test('should reset array field with new items', () => {
      const store = createTestStore(v.object({ items: v.array(v.string()) }), {
        initialInput: { items: ['a', 'b'] },
      });

      const itemsStore = store.children.items;
      expect(itemsStore.kind).toBe('array');

      if (itemsStore.kind === 'array') {
        // Modify state
        itemsStore.children[0].input.value = 'modified';
        itemsStore.isTouched.value = true;

        resetItemState(itemsStore, ['x', 'y', 'z']);

        expect(itemsStore.input.value).toBe(true);
        expect(itemsStore.isTouched.value).toBe(false);
        expect(itemsStore.items.value.length).toBe(3);
        expect(itemsStore.startItems.value.length).toBe(3);
        expect(itemsStore.children[0].input.value).toBe('x');
        expect(itemsStore.children[1].input.value).toBe('y');
      }
    });

    test('should reset array to empty when input is null', () => {
      const store = createTestStore(v.object({ items: v.array(v.string()) }), {
        initialInput: { items: ['a', 'b'] },
      });

      const itemsStore = store.children.items;
      expect(itemsStore.kind).toBe('array');

      if (itemsStore.kind === 'array') {
        resetItemState(itemsStore, null);

        expect(itemsStore.items.value).toEqual([]);
        expect(itemsStore.startItems.value).toEqual([]);
        expect(itemsStore.input.value).toBe(null);
      }
    });

    test('should generate new IDs for items', () => {
      const store = createTestStore(v.object({ items: v.array(v.string()) }), {
        initialInput: { items: ['a'] },
      });

      const itemsStore = store.children.items;
      expect(itemsStore.kind).toBe('array');

      if (itemsStore.kind === 'array') {
        const originalId = itemsStore.items.value[0];

        resetItemState(itemsStore, ['new']);

        expect(itemsStore.items.value[0]).not.toBe(originalId);
      }
    });
  });

  describe('edge cases', () => {
    test('should skip missing array children gracefully', () => {
      const store = createTestStore(v.object({ items: v.array(v.string()) }), {
        initialInput: { items: ['a'] },
      });

      const itemsStore = store.children.items;
      expect(itemsStore.kind).toBe('array');

      if (itemsStore.kind === 'array') {
        // Reset with more items than children exist
        resetItemState(itemsStore, ['x', 'y', 'z']);

        // Should handle gracefully - only reset existing children
        expect(itemsStore.items.value.length).toBe(3);
        expect(itemsStore.children[0].input.value).toBe('x');
      }
    });
  });
});
