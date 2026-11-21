import * as v from 'valibot';
import { describe, expect, test } from 'vitest';
import { validate } from '../validate/validate.ts';
import { createTestStore } from '../vitest/index.ts';
import { setInput } from './setInput.react-native.ts';

describe('setInput (react-native)', () => {
  test('should set field input value', () => {
    const store = createTestStore(v.object({ name: v.string() }));

    setInput(store, { path: ['name'], input: 'John' });

    expect(store.children.name.input.value).toBe('John');
  });

  test('should ignore missing dynamic array item path', () => {
    const store = createTestStore(
      v.object({ items: v.array(v.object({ name: v.string() })) }),
      { initialInput: { items: [] } }
    );

    expect(() =>
      setInput(store, { path: ['items', 0, 'name'], input: 'foo' })
    ).not.toThrow();

    const itemsStore = store.children.items;
    expect(itemsStore.kind).toBe('array');
    if (itemsStore.kind === 'array') {
      expect(itemsStore.items.value).toEqual([]);
      expect(itemsStore.isDirty.value).toBe(false);
    }
  });

  test('should set full form input', () => {
    const store = createTestStore(
      v.object({ name: v.string(), age: v.number() }),
      {
        initialInput: { name: 'John', age: 30 },
      }
    );

    setInput(store, { input: { name: 'Jane', age: 25 } });

    expect(store.children.name.input.value).toBe('Jane');
    expect(store.children.age.input.value).toBe(25);
  });

  test.each(['input', 'change'] as const)(
    'should trigger validation when validate option is %s',
    (mode) => {
      const store = createTestStore(v.object({ name: v.string() }), {
        validate: mode,
      });

      setInput(store, { path: ['name'], input: 'John' });

      expect(store.parse).toHaveBeenCalledExactlyOnceWith({ name: 'John' });
    }
  );

  test.each(['input', 'change'] as const)(
    'should keep pending validation when unchanged input is set (validate: %s)',
    async (mode) => {
      const store = createTestStore(v.object({ name: v.string() }), {
        initialInput: { name: 'John' },
        validate: mode,
      });
      const pendingValidation = validate(store);

      setInput(store, { path: ['name'], input: 'John' });

      expect(store.isValidating.value).toBe(true);
      await pendingValidation;
      expect(store.parse).toHaveBeenCalledExactlyOnceWith({ name: 'John' });
      expect(store.isValidating.value).toBe(false);
    }
  );
});
