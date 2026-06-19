import * as v from 'valibot';
import { describe, expect, test } from 'vitest';
import { createTestStore } from '../vitest/index.ts';
import { hasDeepErrors } from './hasDeepErrors.ts';

describe('hasDeepErrors', () => {
  test('should return false when no errors', () => {
    const store = createTestStore(v.object({ name: v.string() }));

    expect(hasDeepErrors(store)).toBe(false);
  });

  test('should return true when a top-level field has errors', () => {
    const store = createTestStore(v.object({ name: v.string() }));
    store.children.name.errors.value = ['Name is required'];

    expect(hasDeepErrors(store)).toBe(true);
  });

  test('should return true when a nested field has errors', () => {
    const store = createTestStore(
      v.object({ user: v.object({ email: v.string() }) }),
      { initialInput: { user: { email: '' } } }
    );
    const userStore = store.children.user;
    expect(userStore.kind).toBe('object');
    if (userStore.kind === 'object') {
      userStore.children.email.errors.value = ['Email is required'];
    }

    expect(hasDeepErrors(store)).toBe(true);
  });

  test('should return true when an array item has errors', () => {
    const store = createTestStore(v.object({ items: v.array(v.string()) }), {
      initialInput: { items: ['a', 'b'] },
    });
    const itemsStore = store.children.items;
    expect(itemsStore.kind).toBe('array');
    if (itemsStore.kind === 'array') {
      itemsStore.children[1].errors.value = ['Item 1 error'];
    }

    expect(hasDeepErrors(store)).toBe(true);
  });

  test('should only consider errors under the given path', () => {
    const store = createTestStore(
      v.object({
        billing: v.object({ name: v.string() }),
        shipping: v.object({ name: v.string() }),
      }),
      {
        initialInput: { billing: { name: '' }, shipping: { name: '' } },
      }
    );
    const shippingStore = store.children.shipping;
    expect(shippingStore.kind).toBe('object');
    if (shippingStore.kind === 'object') {
      shippingStore.children.name.errors.value = ['Shipping name is required'];
    }

    expect(hasDeepErrors(store, { path: ['billing'] })).toBe(false);
    expect(hasDeepErrors(store, { path: ['shipping'] })).toBe(true);
  });

  test('should detect errors on an intermediate object node', () => {
    const store = createTestStore(
      v.object({ billing: v.object({ name: v.string() }) }),
      { initialInput: { billing: { name: 'John' } } }
    );
    const billingStore = store.children.billing;
    expect(billingStore.kind).toBe('object');
    if (billingStore.kind === 'object') {
      billingStore.errors.value = ['Billing is incomplete'];
    }

    expect(hasDeepErrors(store, { path: ['billing'] })).toBe(true);
  });

  test('should return true for form-level errors only', () => {
    const store = createTestStore(v.object({ name: v.string() }));
    store.errors.value = ['Form is invalid'];

    expect(hasDeepErrors(store)).toBe(true);
  });
});
