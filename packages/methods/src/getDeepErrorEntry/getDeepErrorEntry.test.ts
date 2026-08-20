import * as v from 'valibot';
import { describe, expect, test } from 'vitest';
import { createTestStore } from '../vitest/index.ts';
import { getDeepErrorEntry } from './getDeepErrorEntry.ts';

describe('getDeepErrorEntry', () => {
  test('should return null when no errors', () => {
    const store = createTestStore(v.object({ name: v.string() }));

    expect(getDeepErrorEntry(store)).toBeNull();
  });

  test('should return entry for a top-level field', () => {
    const store = createTestStore(v.object({ name: v.string() }));
    store.children.name.errors.value = ['Name is required'];

    expect(getDeepErrorEntry(store)).toStrictEqual({
      path: ['name'],
      errors: ['Name is required'],
    });
  });

  test('should return entry with all errors of the first erroring field', () => {
    const store = createTestStore(v.object({ name: v.string() }));
    store.children.name.errors.value = ['Name is required', 'Name is invalid'];

    expect(getDeepErrorEntry(store)).toStrictEqual({
      path: ['name'],
      errors: ['Name is required', 'Name is invalid'],
    });
  });

  test('should return entry with nested object path', () => {
    const store = createTestStore(
      v.object({
        billing: v.object({
          address: v.object({ city: v.string() }),
        }),
      }),
      { initialInput: { billing: { address: { city: '' } } } }
    );
    const billingStore = store.children.billing;
    expect(billingStore.kind).toBe('object');
    if (billingStore.kind === 'object') {
      const addressStore = billingStore.children.address;
      if (addressStore.kind === 'object') {
        addressStore.children.city.errors.value = ['City is required'];
      }
    }

    expect(getDeepErrorEntry(store)).toStrictEqual({
      path: ['billing', 'address', 'city'],
      errors: ['City is required'],
    });
  });

  test('should return entry with numeric array index path', () => {
    const store = createTestStore(
      v.object({ items: v.array(v.object({ name: v.string() })) }),
      { initialInput: { items: [{ name: '' }, { name: '' }] } }
    );
    const itemsStore = store.children.items;
    expect(itemsStore.kind).toBe('array');
    if (itemsStore.kind === 'array') {
      const item1 = itemsStore.children[1];
      if (item1.kind === 'object') {
        item1.children.name.errors.value = ['Name is required'];
      }
    }

    expect(getDeepErrorEntry(store)).toStrictEqual({
      path: ['items', 1, 'name'],
      errors: ['Name is required'],
    });
  });

  test('should return entry of first erroring field in walk order', () => {
    const store = createTestStore(
      v.object({ name: v.string(), email: v.string() })
    );
    store.children.name.errors.value = ['Name is required'];
    store.children.email.errors.value = ['Email is required'];

    expect(getDeepErrorEntry(store)).toStrictEqual({
      path: ['name'],
      errors: ['Name is required'],
    });
  });

  test('should prefer entry of a field over its descendants', () => {
    const store = createTestStore(
      v.object({ billing: v.object({ name: v.string() }) }),
      { initialInput: { billing: { name: '' } } }
    );
    const billingStore = store.children.billing;
    expect(billingStore.kind).toBe('object');
    if (billingStore.kind === 'object') {
      billingStore.errors.value = ['Billing is incomplete'];
      billingStore.children.name.errors.value = ['Name is required'];
    }

    expect(getDeepErrorEntry(store, { path: ['billing'] })).toStrictEqual({
      path: ['billing'],
      errors: ['Billing is incomplete'],
    });
  });

  test('should return only entry under the given path', () => {
    const store = createTestStore(
      v.object({
        billing: v.object({ name: v.string() }),
        shipping: v.object({ name: v.string() }),
      }),
      { initialInput: { billing: { name: '' }, shipping: { name: '' } } }
    );
    const shippingStore = store.children.shipping;
    expect(shippingStore.kind).toBe('object');
    if (shippingStore.kind === 'object') {
      shippingStore.children.name.errors.value = ['Shipping name is required'];
    }

    expect(getDeepErrorEntry(store, { path: ['billing'] })).toBeNull();
    expect(getDeepErrorEntry(store, { path: ['shipping'] })).toStrictEqual({
      path: ['shipping', 'name'],
      errors: ['Shipping name is required'],
    });
  });

  test('should return null for missing dynamic array item path', () => {
    const store = createTestStore(
      v.object({ items: v.array(v.object({ name: v.string() })) }),
      { initialInput: { items: [] } }
    );

    expect(getDeepErrorEntry(store, { path: ['items', 0, 'name'] })).toBeNull();
  });

  test('should include form-level errors with an empty path', () => {
    const store = createTestStore(v.object({ name: v.string() }));
    store.errors.value = ['Form is invalid'];
    store.children.name.errors.value = ['Name is required'];

    expect(getDeepErrorEntry(store)).toStrictEqual({
      path: [],
      errors: ['Form is invalid'],
    });
  });
});
