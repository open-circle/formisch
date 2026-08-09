import * as v from 'valibot';
import { describe, expectTypeOf, test } from 'vitest';
import { createTestStore } from '../vitest/index.ts';
import { getDeepError } from './getDeepError.ts';

describe('getDeepError', () => {
  const store = createTestStore(
    v.object({
      name: v.string(),
      address: v.object({ street: v.string() }),
      items: v.array(v.object({ label: v.string() })),
    })
  );

  test('should return a string or null for the entire form', () => {
    expectTypeOf(getDeepError(store)).toEqualTypeOf<string | null>();
  });

  test('should return the same type when scoped to a field path', () => {
    expectTypeOf(getDeepError(store, { path: ['address'] })).toEqualTypeOf<
      string | null
    >();
  });

  test('should reject a path that does not exist on the form', () => {
    // @ts-expect-error - `nonexistent` is not a field of the form
    getDeepError(store, { path: ['nonexistent'] });
  });
});
