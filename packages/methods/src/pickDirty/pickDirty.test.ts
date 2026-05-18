import * as v from 'valibot';
import { describe, expect, test } from 'vitest';
import { createTestStore } from '../vitest/index.ts';
import { pickDirty } from './pickDirty.ts';

describe('pickDirty', () => {
  test('should return undefined for a clean form', () => {
    const store = createTestStore(
      v.object({ name: v.string(), age: v.number() }),
      { initialInput: { name: 'John', age: 25 } }
    );

    expect(
      pickDirty(store, { from: { name: 'John', age: 25 } })
    ).toBeUndefined();
  });

  test('should return only the dirty key from a flat object', () => {
    const store = createTestStore(
      v.object({ name: v.string(), email: v.string() }),
      { initialInput: { name: 'John', email: 'a@example.com' } }
    );
    store.children.email.input.value = 'b@example.com';
    store.children.email.isDirty.value = true;

    expect(
      pickDirty(store, {
        from: { name: 'John', email: 'b@example.com' },
      })
    ).toStrictEqual({ email: 'b@example.com' });
  });

  test('should pull values from the supplied value, not the form', () => {
    const store = createTestStore(v.object({ age: v.string() }), {
      initialInput: { age: '25' },
    });
    store.children.age.input.value = '30';
    store.children.age.isDirty.value = true;

    expect(pickDirty(store, { from: { age: 30 } })).toStrictEqual({
      age: 30,
    });
  });

  test('should return the full current array when any item is dirty', () => {
    const store = createTestStore(v.object({ items: v.array(v.string()) }), {
      initialInput: { items: ['a', 'b', 'c'] },
    });
    const itemsStore = store.children.items;
    expect(itemsStore.kind).toBe('array');
    if (itemsStore.kind === 'array') {
      itemsStore.children[1].input.value = 'B';
      itemsStore.children[1].isDirty.value = true;
    }

    expect(
      pickDirty(store, { from: { items: ['a', 'B', 'c'] } })
    ).toStrictEqual({ items: ['a', 'B', 'c'] });
  });

  test('should include dirty leaves under a clean object parent', () => {
    const store = createTestStore(
      v.object({ user: v.object({ email: v.string(), name: v.string() }) }),
      { initialInput: { user: { email: 'a@example.com', name: 'John' } } }
    );
    const userStore = store.children.user;
    expect(userStore.kind).toBe('object');
    if (userStore.kind === 'object') {
      userStore.children.email.input.value = 'b@example.com';
      userStore.children.email.isDirty.value = true;
    }

    expect(
      pickDirty(store, {
        from: { user: { email: 'b@example.com', name: 'John' } },
      })
    ).toStrictEqual({ user: { email: 'b@example.com' } });
  });

  test('should include a dirty leaf whose value is undefined', () => {
    const store = createTestStore(v.object({ name: v.optional(v.string()) }), {
      initialInput: { name: 'John' },
    });
    store.children.name.input.value = undefined;
    store.children.name.isDirty.value = true;

    expect(pickDirty(store, { from: { name: undefined } })).toStrictEqual({
      name: undefined,
    });
  });

  test('should return undefined when the root value shape diverges', () => {
    const store = createTestStore(v.object({ name: v.string() }), {
      initialInput: { name: 'John' },
    });
    store.children.name.input.value = 'Jane';
    store.children.name.isDirty.value = true;

    expect(pickDirty(store, { from: 'transformed-string' })).toBeUndefined();
  });

  test('should skip keys where the value shape diverges and keep aligned siblings', () => {
    const store = createTestStore(
      v.object({
        name: v.string(),
        user: v.object({ email: v.string() }),
      }),
      { initialInput: { name: 'John', user: { email: 'a@example.com' } } }
    );
    store.children.name.input.value = 'Jane';
    store.children.name.isDirty.value = true;
    const userStore = store.children.user;
    expect(userStore.kind).toBe('object');
    if (userStore.kind === 'object') {
      userStore.children.email.input.value = 'b@example.com';
      userStore.children.email.isDirty.value = true;
    }

    expect(
      pickDirty(store, { from: { name: 'Jane', user: 'reshaped' } })
    ).toStrictEqual({ name: 'Jane' });
  });
});
