import * as v from 'valibot';
import { describe, expectTypeOf, test } from 'vitest';
import type { DeepErrorEntry } from '../getDeepErrorEntries/index.ts';
import { createTestStore } from '../vitest/index.ts';
import { getDeepErrorEntry } from './getDeepErrorEntry.ts';

describe('getDeepErrorEntry', () => {
  const store = createTestStore(
    v.object({
      name: v.string(),
      address: v.object({ street: v.string() }),
      items: v.array(v.object({ label: v.string() })),
    })
  );

  type Value = {
    name: string;
    address: { street: string };
    items: { label: string }[];
  };

  test('should return an entry typed for the inferred form value or null', () => {
    expectTypeOf(
      getDeepErrorEntry(store)
    ).toEqualTypeOf<DeepErrorEntry<Value> | null>();
  });

  test('should return the same entry type when scoped to a field path', () => {
    expectTypeOf(
      getDeepErrorEntry(store, { path: ['address'] })
    ).toEqualTypeOf<DeepErrorEntry<Value> | null>();
  });

  test('should reject a path that does not exist on the form', () => {
    // @ts-expect-error - `nonexistent` is not a field of the form
    getDeepErrorEntry(store, { path: ['nonexistent'] });
  });
});
