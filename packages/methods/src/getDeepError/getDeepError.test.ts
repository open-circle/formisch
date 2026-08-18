import * as v from 'valibot';
import { describe, expect, test } from 'vitest';
import { createTestStore } from '../vitest/index.ts';
import { getDeepError } from './getDeepError.ts';

describe('getDeepError', () => {
  test('should return null when no errors', () => {
    const store = createTestStore(v.object({ name: v.string() }));

    expect(getDeepError(store)).toBeNull();
  });

  test('should return first error of a top-level field', () => {
    const store = createTestStore(v.object({ name: v.string() }));
    store.children.name.errors.value = ['Name is required'];

    expect(getDeepError(store)).toBe('Name is required');
  });

  test('should return only the first of multiple errors of a field', () => {
    const store = createTestStore(v.object({ name: v.string() }));
    store.children.name.errors.value = ['Name is required', 'Name is invalid'];

    expect(getDeepError(store)).toBe('Name is required');
  });

  test('should return error of a deeply nested field', () => {
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

    expect(getDeepError(store)).toBe('City is required');
  });

  test('should return error of first erroring field in walk order', () => {
    const store = createTestStore(
      v.object({ name: v.string(), email: v.string() })
    );
    store.children.name.errors.value = ['Name is required'];
    store.children.email.errors.value = ['Email is required'];

    expect(getDeepError(store)).toBe('Name is required');
  });

  test('should prefer error of a field over errors of its descendants', () => {
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

    expect(getDeepError(store, { path: ['billing'] })).toBe(
      'Billing is incomplete'
    );
  });

  test('should return only errors under the given path', () => {
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

    expect(getDeepError(store, { path: ['billing'] })).toBeNull();
    expect(getDeepError(store, { path: ['shipping'] })).toBe(
      'Shipping name is required'
    );
  });

  test('should return error of a field at a numeric array index path', () => {
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

    expect(getDeepError(store)).toBe('Name is required');
  });

  test('should return null for missing dynamic array item path', () => {
    const store = createTestStore(
      v.object({ items: v.array(v.object({ name: v.string() })) }),
      { initialInput: { items: [] } }
    );

    expect(getDeepError(store, { path: ['items', 0, 'name'] })).toBeNull();
  });

  test('should include form-level errors', () => {
    const store = createTestStore(v.object({ name: v.string() }));
    store.errors.value = ['Form is invalid'];
    store.children.name.errors.value = ['Name is required'];

    expect(getDeepError(store)).toBe('Form is invalid');
  });
});
