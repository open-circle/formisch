import * as v from 'valibot';
import { describe, expect, test } from 'vitest';
import { insert } from '../insert/insert.ts';
import { isDirty } from '../isDirty/isDirty.ts';
import { move } from '../move/move.ts';
import { remove } from '../remove/remove.ts';
import { replace } from '../replace/replace.ts';
import { swap } from '../swap/swap.ts';
import { createTestStore } from '../vitest/index.ts';
import { setInput } from './setInput.ts';

describe('setInput', () => {
  test('should set field input value', () => {
    const store = createTestStore(v.object({ name: v.string() }));

    setInput(store, { path: ['name'], input: 'John' });

    expect(store.children.name.input.value).toBe('John');
  });

  test('should mark field as dirty when value changes', () => {
    const store = createTestStore(v.object({ name: v.string() }), {
      initialInput: { name: 'John' },
    });

    setInput(store, { path: ['name'], input: 'Jane' });

    expect(store.children.name.isDirty.value).toBe(true);
  });

  test('should not mark field dirty when value same as initial', () => {
    const store = createTestStore(v.object({ name: v.string() }), {
      initialInput: { name: 'John' },
    });

    setInput(store, { path: ['name'], input: 'John' });

    expect(store.children.name.isDirty.value).toBe(false);
  });

  test('should set nested field input', () => {
    const store = createTestStore(
      v.object({ user: v.object({ email: v.string() }) }),
      { initialInput: { user: { email: '' } } }
    );

    setInput(store, { path: ['user', 'email'], input: 'test@example.com' });

    const userStore = store.children.user;
    expect(userStore.kind).toBe('object');
    if (userStore.kind === 'object') {
      expect(userStore.children.email.input.value).toBe('test@example.com');
    }
  });

  test('should set array item input', () => {
    const store = createTestStore(v.object({ items: v.array(v.string()) }), {
      initialInput: { items: ['a', 'b'] },
    });

    setInput(store, { path: ['items', 0], input: 'x' });

    const itemsStore = store.children.items;
    expect(itemsStore.kind).toBe('array');
    if (itemsStore.kind === 'array') {
      expect(itemsStore.children[0].input.value).toBe('x');
    }
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

  test('should trigger validation when validate option is set', () => {
    const store = createTestStore(v.object({ name: v.string() }), {
      validate: 'input',
    });

    setInput(store, { path: ['name'], input: 'John' });

    expect(store.parse).toHaveBeenCalledExactlyOnceWith({ name: 'John' });
  });

  test('should keep dirty state from swap when setting nested field', () => {
    const store = createTestStore(
      v.object({ items: v.array(v.object({ name: v.string() })) }),
      { initialInput: { items: [{ name: 'a' }, { name: 'b' }] } }
    );

    swap(store, { path: ['items'], at: 0, and: 1 });
    expect(store.children.items.isDirty.value).toBe(true);

    // Setting a nested field must not clear the dirty state of the array, as
    // its item order still differs from the baseline
    setInput(store, { path: ['items', 0, 'name'], input: 'b' });

    expect(store.children.items.isDirty.value).toBe(true);
  });

  test('should stay clean when setting nested field after array input was shrunk and regrown', () => {
    const store = createTestStore(
      v.object({ items: v.array(v.object({ name: v.string() })) }),
      { initialInput: { items: [{ name: 'a' }, { name: 'b' }] } }
    );

    setInput(store, { path: ['items'], input: [{ name: 'a' }] });
    setInput(store, {
      path: ['items'],
      input: [{ name: 'a' }, { name: 'b' }],
    });
    expect(isDirty(store)).toBe(false);

    // Setting a nested field to the input it has must not mark the array as
    // dirty, as its regrown item took the place of its start item
    setInput(store, { path: ['items', 0, 'name'], input: 'a' });

    expect(isDirty(store)).toBe(false);
  });

  test('should be clean again when a moved nested array is regrown and moved back', () => {
    const store = createTestStore(
      v.object({ rows: v.array(v.object({ tags: v.array(v.string()) })) }),
      { initialInput: { rows: [{ tags: ['x'] }, { tags: [] }] } }
    );

    setInput(store, { path: ['rows', 0, 'tags'], input: [] });
    swap(store, { path: ['rows'], at: 0, and: 1 });
    setInput(store, { path: ['rows', 1, 'tags'], input: ['x'] });
    expect(isDirty(store)).toBe(true);

    // Swapping back restores the start input, and the regrown item of the
    // nested array took the place of its start item
    swap(store, { path: ['rows'], at: 0, and: 1 });

    expect(isDirty(store)).toBe(false);
  });

  test('should keep dirty state from swap when setting array input', () => {
    const store = createTestStore(
      v.object({ items: v.array(v.object({ name: v.string() })) }),
      { initialInput: { items: [{ name: 'a' }, { name: 'b' }] } }
    );

    swap(store, { path: ['items'], at: 0, and: 1 });
    expect(isDirty(store)).toBe(true);

    // Setting the array to the input it already has must not clear its dirty
    // state, as its item order still differs from the baseline
    setInput(store, {
      path: ['items'],
      input: [{ name: 'b' }, { name: 'a' }],
    });

    expect(isDirty(store)).toBe(true);
  });

  test('should keep dirty state from swap when setting form input', () => {
    const store = createTestStore(
      v.object({ items: v.array(v.object({ name: v.string() })) }),
      { initialInput: { items: [{ name: 'a' }, { name: 'b' }] } }
    );

    swap(store, { path: ['items'], at: 0, and: 1 });
    expect(isDirty(store)).toBe(true);

    setInput(store, { input: { items: [{ name: 'b' }, { name: 'a' }] } });

    expect(isDirty(store)).toBe(true);
  });

  test('should keep dirty state from move when setting array input', () => {
    const store = createTestStore(
      v.object({ items: v.array(v.object({ name: v.string() })) }),
      {
        initialInput: { items: [{ name: 'a' }, { name: 'b' }, { name: 'c' }] },
      }
    );

    move(store, { path: ['items'], from: 0, to: 2 });
    expect(isDirty(store)).toBe(true);

    setInput(store, {
      path: ['items'],
      input: [{ name: 'b' }, { name: 'c' }, { name: 'a' }],
    });

    expect(isDirty(store)).toBe(true);
  });

  test('should keep dirty state from replace when setting array input', () => {
    const store = createTestStore(
      v.object({ items: v.array(v.object({ name: v.string() })) }),
      { initialInput: { items: [{ name: 'a' }, { name: 'b' }] } }
    );

    replace(store, { path: ['items'], at: 0, initialInput: { name: 'z' } });
    expect(isDirty(store)).toBe(true);

    setInput(store, {
      path: ['items'],
      input: [{ name: 'z' }, { name: 'b' }],
    });

    expect(isDirty(store)).toBe(true);
  });

  test('should keep dirty state from remove and insert when setting array input', () => {
    const store = createTestStore(
      v.object({ items: v.array(v.object({ name: v.string() })) }),
      { initialInput: { items: [{ name: 'a' }, { name: 'b' }] } }
    );

    remove(store, { path: ['items'], at: 0 });
    insert(store, { path: ['items'], initialInput: { name: 'c' } });
    expect(isDirty(store)).toBe(true);

    setInput(store, {
      path: ['items'],
      input: [{ name: 'b' }, { name: 'c' }],
    });

    expect(isDirty(store)).toBe(true);
  });

  test('should keep dirty state from remove when array input grows to start length', () => {
    const store = createTestStore(
      v.object({ items: v.array(v.object({ name: v.string() })) }),
      {
        initialInput: { items: [{ name: 'a' }, { name: 'b' }, { name: 'c' }] },
      }
    );

    remove(store, { path: ['items'], at: 1 });
    expect(isDirty(store)).toBe(true);

    // The second index still holds the third item, so the array must stay
    // dirty although it has its start length again
    setInput(store, {
      path: ['items'],
      input: [{ name: 'a' }, { name: 'c' }, { name: 'c' }],
    });

    expect(isDirty(store)).toBe(true);
  });
});
