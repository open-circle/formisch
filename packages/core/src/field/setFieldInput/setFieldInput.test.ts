// @vitest-environment jsdom
import * as v from 'valibot';
import { describe, expect, test } from 'vitest';
import { copyItemState } from '../../array/copyItemState/copyItemState.ts';
import { swapItemState } from '../../array/swapItemState/swapItemState.ts';
import { validateFormInput } from '../../form/validateFormInput/validateFormInput.ts';
import { createTestStore } from '../../vitest/index.ts';
import { getFieldBool } from '../getFieldBool/getFieldBool.ts';
import { getFieldInput } from '../getFieldInput/getFieldInput.ts';
import { setFieldInput } from './setFieldInput.ts';

describe('setFieldInput', () => {
  describe('value fields', () => {
    test('should set string value', () => {
      const store = createTestStore(v.object({ name: v.string() }));
      setFieldInput(store, ['name'], 'John');
      expect(getFieldInput(store.children.name)).toBe('John');
    });

    test('should mark field as touched', () => {
      const store = createTestStore(v.object({ name: v.string() }));
      setFieldInput(store, ['name'], 'John');
      expect(store.children.name.isTouched.value).toBe(true);
    });

    test('should mark field as edited', () => {
      const store = createTestStore(v.object({ name: v.string() }));
      setFieldInput(store, ['name'], 'John');
      expect(store.children.name.isEdited.value).toBe(true);
    });

    test('should keep field edited after reverting to initial value', () => {
      const store = createTestStore(v.object({ name: v.string() }), {
        initialInput: { name: 'John' },
      });
      setFieldInput(store, ['name'], 'Jane');
      setFieldInput(store, ['name'], 'John');
      // Unlike `isDirty`, `isEdited` stays `true` even after the value is
      // changed back to its initial value
      expect(store.children.name.isDirty.value).toBe(false);
      expect(store.children.name.isEdited.value).toBe(true);
    });

    test('should mark field as dirty when value changes', () => {
      const store = createTestStore(v.object({ name: v.string() }), {
        initialInput: { name: 'John' },
      });
      setFieldInput(store, ['name'], 'Jane');
      expect(store.children.name.isDirty.value).toBe(true);
    });

    test('should not mark field as dirty for empty string from undefined', () => {
      const store = createTestStore(v.object({ name: v.string() }));
      setFieldInput(store, ['name'], '');
      expect(store.children.name.isDirty.value).toBe(false);
    });

    test('should not mark field as dirty for NaN from undefined', () => {
      const store = createTestStore(v.object({ age: v.number() }));
      setFieldInput(store, ['age'], NaN);
      expect(store.children.age.isDirty.value).toBe(false);
    });
  });

  describe('object fields', () => {
    test('should set nested object value', () => {
      const store = createTestStore(
        v.object({ user: v.object({ name: v.string() }) })
      );
      setFieldInput(store, ['user', 'name'], 'John');
      const userStore = store.children.user;
      expect(userStore.kind).toBe('object');
      if (userStore.kind === 'object') {
        expect(getFieldInput(userStore.children.name)).toBe('John');
      }
    });

    test('should mark parent input as truthy when setting nested field', () => {
      const store = createTestStore(
        v.object({ user: v.nullish(v.object({ name: v.string() })) }),
        { initialInput: { user: null } }
      );
      setFieldInput(store, ['user', 'name'], 'John');
      expect(store.children.user.input.value).toBe(true);
    });

    test('should mark a nullish parent dirty when its empty child is set', () => {
      const store = createTestStore(
        v.object({ user: v.nullish(v.object({ name: v.string() })) })
      );

      setFieldInput(store, ['user', 'name'], '');

      expect(store.children.user.input.value).toBe(true);
      expect(store.children.user.isDirty.value).toBe(true);
      expect(getFieldBool(store, 'isDirty')).toBe(true);
    });

    test('should not mark a present parent dirty when setting nested field', () => {
      const store = createTestStore(
        v.object({ user: v.object({ name: v.string() }) }),
        { initialInput: { user: { name: 'John' } } }
      );

      setFieldInput(store, ['user', 'name'], 'Jane');
      expect(store.children.user.isDirty.value).toBe(false);
      expect(getFieldBool(store, 'isDirty')).toBe(true);

      // Reverting the nested field leaves the whole form pristine, as the
      // parent was present at its baseline and never became dirty itself
      setFieldInput(store, ['user', 'name'], 'John');
      expect(store.children.user.isDirty.value).toBe(false);
      expect(getFieldBool(store, 'isDirty')).toBe(false);
    });

    test('should clear parent dirty state when nested input restores it', () => {
      const store = createTestStore(
        v.object({ user: v.nullish(v.object({ name: v.string() })) }),
        { initialInput: { user: { name: 'John' } } }
      );

      setFieldInput(store, ['user'], null);
      expect(getFieldBool(store, 'isDirty')).toBe(true);

      setFieldInput(store, ['user', 'name'], 'John');
      expect(getFieldInput(store)).toStrictEqual({ user: { name: 'John' } });
      expect(store.children.user.isDirty.value).toBe(false);
      expect(getFieldBool(store, 'isDirty')).toBe(false);
    });
  });

  describe('array fields', () => {
    test('should set array item value', () => {
      const store = createTestStore(v.object({ items: v.array(v.string()) }), {
        initialInput: { items: ['a', 'b'] },
      });
      setFieldInput(store, ['items', 0], 'updated');
      const itemsStore = store.children.items;
      expect(itemsStore.kind).toBe('array');
      if (itemsStore.kind === 'array') {
        expect(getFieldInput(itemsStore.children[0])).toBe('updated');
      }
    });

    test('should truncate array when setting shorter array', () => {
      const store = createTestStore(v.object({ items: v.array(v.string()) }), {
        initialInput: { items: ['a', 'b', 'c'] },
      });
      setFieldInput(store, ['items'], ['x']);
      const itemsStore = store.children.items;
      expect(itemsStore.kind).toBe('array');
      if (itemsStore.kind === 'array') {
        expect(itemsStore.items.value).toHaveLength(1);
      }
    });

    test('should extend array when setting longer array', () => {
      const store = createTestStore(v.object({ items: v.array(v.string()) }), {
        initialInput: { items: ['a'] },
      });
      setFieldInput(store, ['items'], ['x', 'y', 'z']);
      const itemsStore = store.children.items;
      expect(itemsStore.kind).toBe('array');
      if (itemsStore.kind === 'array') {
        expect(itemsStore.items.value).toHaveLength(3);
        expect(getFieldInput(itemsStore)).toStrictEqual(['x', 'y', 'z']);
      }
    });

    test('should keep array dirty from length change when setting nested child', () => {
      const store = createTestStore(
        v.object({ items: v.array(v.object({ name: v.string() })) }),
        { initialInput: { items: [{ name: 'a' }] } }
      );

      // Grow the array so its dirty state is based on the length change
      setFieldInput(store, ['items'], [{ name: 'a' }, { name: 'b' }]);
      expect(store.children.items.isDirty.value).toBe(true);

      // Setting a nested child must not reset the length-based dirty state
      setFieldInput(store, ['items', 0, 'name'], 'a');
      expect(store.children.items.isDirty.value).toBe(true);
    });

    test('should keep array dirty from reordering when setting nested child', () => {
      const store = createTestStore(
        v.object({ items: v.array(v.object({ name: v.string() })) }),
        { initialInput: { items: [{ name: 'a' }, { name: 'b' }] } }
      );

      const itemsStore = store.children.items;
      expect(itemsStore.kind).toBe('array');
      if (itemsStore.kind === 'array') {
        // Simulate a swap by reversing the item IDs and marking the array as
        // dirty, like the `swap` method of `@formisch/methods` does
        itemsStore.items.value = [...itemsStore.items.value].reverse();
        itemsStore.isDirty.value = true;

        // Setting a nested child must not reset the identity-based dirty
        // state, as the item order still differs from the baseline
        setFieldInput(store, ['items', 0, 'name'], 'a');
        expect(itemsStore.isDirty.value).toBe(true);
      }
    });

    test('should set null for nullish array', () => {
      const store = createTestStore(
        v.object({ items: v.nullish(v.array(v.string())) }),
        { initialInput: { items: ['a'] } }
      );
      setFieldInput(store, ['items'], null);
      expect(store.children.items.input.value).toBeNull();
    });

    test('should keep a tuple at its fixed length when given a longer input', () => {
      const store = createTestStore(
        v.object({ pair: v.tuple([v.string(), v.number()]) }),
        { initialInput: { pair: ['a', 1] } }
      );
      const pairStore = store.children.pair;
      expect(pairStore.kind).toBe('array');
      if (pairStore.kind === 'array') {
        // Tuples have no `item` schema, so the extra entry must be ignored
        expect(() => setFieldInput(store, ['pair'], ['x', 2, 3])).not.toThrow();
        expect(pairStore.items.value).toHaveLength(2);
        expect(getFieldInput(pairStore.children[0])).toBe('x');
        expect(getFieldInput(pairStore.children[1])).toBe(2);
      }
    });

    test('should not grow a tuple beyond its children when items were cleared', () => {
      const store = createTestStore(
        v.object({ pair: v.tuple([v.string(), v.number()]) }),
        { initialInput: { pair: ['a', 1] } }
      );
      const pairStore = store.children.pair;
      expect(pairStore.kind).toBe('array');
      if (pairStore.kind === 'array') {
        // Simulate a previously cleared tuple (e.g. reset to `null`), then set
        // a longer-than-fixed input
        pairStore.items.value = [];
        setFieldInput(store, ['pair'], ['x', 2, 3]);

        // Items stay capped to the fixed child count, so reads do not throw
        expect(pairStore.items.value).toHaveLength(2);
        expect(() => getFieldInput(pairStore)).not.toThrow();
        expect(getFieldInput(pairStore.children[0])).toBe('x');
        expect(getFieldInput(pairStore.children[1])).toBe(2);
      }
    });
  });

  describe('dirty state for arrays', () => {
    test('should mark array as dirty when length changes', () => {
      const store = createTestStore(v.object({ items: v.array(v.string()) }), {
        initialInput: { items: ['a', 'b'] },
      });
      setFieldInput(store, ['items'], ['a']);
      expect(store.children.items.isDirty.value).toBe(true);
    });

    test('should clear array isDirty after reverting to initial input', () => {
      const store = createTestStore(v.object({ items: v.array(v.string()) }), {
        initialInput: { items: ['a', 'b', 'c', 'd'] },
      });
      setFieldInput(store, ['items'], ['b', 'c', 'd']);
      expect(getFieldBool(store.children.items, 'isDirty')).toBe(true);
      setFieldInput(store, ['items'], ['a', 'b', 'c', 'd']);
      expect(getFieldBool(store.children.items, 'isDirty')).toBe(false);
    });

    test('should clear array isDirty after reverting from longer back to initial', () => {
      const store = createTestStore(v.object({ items: v.array(v.string()) }), {
        initialInput: { items: ['a', 'b'] },
      });
      setFieldInput(store, ['items'], ['a', 'b', 'c']);
      expect(getFieldBool(store.children.items, 'isDirty')).toBe(true);
      setFieldInput(store, ['items'], ['a', 'b']);
      expect(getFieldBool(store.children.items, 'isDirty')).toBe(false);
    });

    test('should keep array dirty from reordering when setting array input', () => {
      const store = createTestStore(
        v.object({ items: v.array(v.object({ name: v.string() })) }),
        { initialInput: { items: [{ name: 'a' }, { name: 'b' }] } }
      );

      const itemsStore = store.children.items;
      expect(itemsStore.kind).toBe('array');
      if (itemsStore.kind === 'array') {
        // Swap both items and mark the array as dirty, like the `swap` method
        // of `@formisch/methods` does
        itemsStore.items.value = [...itemsStore.items.value].reverse();
        swapItemState(store, itemsStore.children[0], itemsStore.children[1]);
        itemsStore.isDirty.value = true;

        // Setting the array to the input it already has must not reset the
        // identity-based dirty state, as the item order still differs from
        // the baseline
        setFieldInput(store, ['items'], [{ name: 'b' }, { name: 'a' }]);
        expect(getFieldInput(itemsStore)).toStrictEqual([
          { name: 'b' },
          { name: 'a' },
        ]);
        expect(getFieldBool(itemsStore, 'isDirty')).toBe(true);
      }
    });
  });

  describe('reusing child stores when growing', () => {
    test('should clear stale errors but keep the dirty baseline when reused', () => {
      const store = createTestStore(v.object({ items: v.array(v.string()) }), {
        initialInput: { items: ['a', 'b', 'c'] },
      });
      const itemsStore = store.children.items;
      expect(itemsStore.kind).toBe('array');
      if (itemsStore.kind === 'array') {
        // Give the third item a stale error, then shrink the array so its child
        // store becomes a stale, invisible leftover
        itemsStore.children[2].errors.value = ['Stale error'];
        setFieldInput(store, ['items'], ['a']);

        // Grow back so the stale child store is reused for a changed value
        setFieldInput(store, ['items'], ['a', 'x', 'y']);

        // The reused child carries the new value with cleared errors, but stays
        // dirty because its value ('y') differs from its initial input ('c')
        expect(itemsStore.children[2].input.value).toBe('y');
        expect(itemsStore.children[2].errors.value).toBeNull();
        expect(itemsStore.children[2].isDirty.value).toBe(true);
      }
    });

    test('should report dirty after shrinking then growing with changed values', () => {
      const store = createTestStore(v.object({ items: v.array(v.string()) }), {
        initialInput: { items: ['a', 'b', 'c'] },
      });
      setFieldInput(store, ['items'], ['a']); // shrink
      setFieldInput(store, ['items'], ['a', 'x', 'y']); // grow with changed values
      // Same final input as a direct edit, so the array must be dirty
      expect(getFieldBool(store.children.items, 'isDirty')).toBe(true);
    });

    test('should report clean after shrinking then growing back to initial', () => {
      const store = createTestStore(v.object({ items: v.array(v.string()) }), {
        initialInput: { items: ['a', 'b', 'c'] },
      });
      setFieldInput(store, ['items'], ['a']); // shrink
      setFieldInput(store, ['items'], ['a', 'b', 'c']); // grow back to initial
      // Content matches the initial input again, so the array must be clean
      expect(getFieldBool(store.children.items, 'isDirty')).toBe(false);
    });

    test('should let regrown items take the place of their start items', () => {
      const store = createTestStore(v.object({ items: v.array(v.string()) }), {
        initialInput: { items: ['a', 'b', 'c'] },
      });
      const itemsStore = store.children.items;
      expect(itemsStore.kind).toBe('array');
      if (itemsStore.kind === 'array') {
        const initialItems = [...itemsStore.initialItems.value];
        setFieldInput(store, ['items'], ['a']); // shrink
        setFieldInput(store, ['items'], ['a', 'x', 'y', 'z']); // grow beyond start

        // The regrown items are new, the first two of them take the place of
        // the start items of their index and the initial items are unchanged
        expect(itemsStore.items.value[0]).toBe(initialItems[0]);
        expect(initialItems).not.toContain(itemsStore.items.value[1]);
        expect(itemsStore.startItems.value).toStrictEqual(
          itemsStore.items.value.slice(0, 3)
        );
        expect(itemsStore.startItems.value).not.toContain(
          itemsStore.items.value[3]
        );
        expect(itemsStore.initialItems.value).toStrictEqual(initialItems);
      }
    });

    test('should clear elements of a regrown child', () => {
      const store = createTestStore(v.object({ items: v.array(v.string()) }), {
        initialInput: { items: ['a', 'b'] },
      });
      const itemsStore = store.children.items;
      expect(itemsStore.kind).toBe('array');
      if (itemsStore.kind === 'array') {
        const element = document.createElement('input');
        itemsStore.children[1].elements.push(element);
        setFieldInput(store, ['items'], ['a']); // shrink
        setFieldInput(store, ['items'], ['a', 'b']); // grow back to initial

        // The regrown child gets a new item, which a framework renders anew,
        // so the elements of the previous item must not stay registered
        expect(itemsStore.children[1].elements).toEqual([]);
      }
    });

    test('should stay clean when setting nested child after growing back to initial', () => {
      const store = createTestStore(v.object({ items: v.array(v.string()) }), {
        initialInput: { items: ['a', 'b', 'c'] },
      });
      setFieldInput(store, ['items'], ['a']); // shrink
      setFieldInput(store, ['items'], ['a', 'b', 'c']); // grow back to initial

      // Setting a nested child to its baseline compares the item IDs of the
      // array, which must match the start items again after regrowing
      setFieldInput(store, ['items', 0], 'a');
      expect(getFieldBool(store.children.items, 'isDirty')).toBe(false);
    });

    test('should report clean after shrinking then growing nested arrays back to initial', () => {
      const store = createTestStore(
        v.object({ rows: v.array(v.object({ tags: v.array(v.string()) })) }),
        { initialInput: { rows: [{ tags: ['x'] }, { tags: ['y', 'z'] }] } }
      );
      setFieldInput(store, ['rows'], [{ tags: ['x'] }]); // shrink
      expect(getFieldBool(store.children.rows, 'isDirty')).toBe(true);
      setFieldInput(store, ['rows'], [{ tags: ['x'] }, { tags: ['y', 'z'] }]); // grow back to initial
      // The nested array of the regrown child gets its start items again
      expect(getFieldBool(store.children.rows, 'isDirty')).toBe(false);
    });

    test('should keep nested array of an item beyond the start items clean when regrown', () => {
      const store = createTestStore(
        v.object({ rows: v.array(v.object({ tags: v.array(v.string()) })) }),
        { initialInput: { rows: [{ tags: ['x'] }] } }
      );
      const rows = [{ tags: ['x'] }, { tags: ['y', 'z'] }];
      setFieldInput(store, ['rows'], rows); // grow beyond start
      setFieldInput(store, ['rows'], [{ tags: ['x'] }]); // shrink
      setFieldInput(store, ['rows'], rows); // grow beyond start again

      const rowsStore = store.children.rows;
      expect(rowsStore.kind).toBe('array');
      if (rowsStore.kind === 'array') {
        // The second row is a new item, so the array is dirty, but the nested
        // array of its reset child has the items and input of its baseline
        expect(rowsStore.isDirty.value).toBe(true);
        expect(getFieldBool(rowsStore.children[1], 'isDirty')).toBe(false);
      }
    });

    test('should let a regrown item without a child store take the place of its start item', () => {
      const store = createTestStore(
        v.object({ rows: v.array(v.object({ tags: v.array(v.string()) })) }),
        { initialInput: { rows: [{ tags: ['x'] }, { tags: [] }] } }
      );
      const rowsStore = store.children.rows;
      expect(rowsStore.kind).toBe('array');
      if (rowsStore.kind === 'array') {
        setFieldInput(store, ['rows', 0, 'tags'], []); // shrink

        // Swap both rows like the `swap` method of `@formisch/methods` does,
        // which moves the start items of the emptied nested array to the
        // second row, but not its child store
        rowsStore.items.value = [...rowsStore.items.value].reverse();
        swapItemState(store, rowsStore.children[0], rowsStore.children[1]);
        rowsStore.isDirty.value = true;

        setFieldInput(store, ['rows', 1, 'tags'], ['x']); // grow back to initial

        // The regrown item takes the place of its start item although its
        // child store is new, so the nested array is clean again
        const rowStore = rowsStore.children[1];
        expect(rowStore.kind).toBe('object');
        if (rowStore.kind === 'object') {
          const tagsStore = rowStore.children.tags;
          expect(tagsStore.kind).toBe('array');
          if (tagsStore.kind === 'array') {
            expect(tagsStore.startItems.value).toStrictEqual(
              tagsStore.items.value
            );
          }
        }
        expect(getFieldBool(rowsStore.children[1], 'isDirty')).toBe(false);
      }
    });

    test('should stay dirty when an array that lost an item grows back to its start length', () => {
      const store = createTestStore(v.object({ items: v.array(v.string()) }), {
        initialInput: { items: ['a', 'b', 'c'] },
      });
      const itemsStore = store.children.items;
      expect(itemsStore.kind).toBe('array');
      if (itemsStore.kind === 'array') {
        // Remove the second item and mark the array as dirty, like the
        // `remove` method of `@formisch/methods` does
        const [firstItem, , thirdItem] = itemsStore.items.value;
        itemsStore.items.value = [firstItem, thirdItem];
        copyItemState(store, itemsStore.children[2], itemsStore.children[1]);
        itemsStore.isDirty.value = true;

        // Grow back to the start length with the input the items have
        setFieldInput(store, ['items'], ['a', 'c', 'c']);

        // The second index still holds the third item, so the array stays
        // dirty although it has its start length again
        expect(itemsStore.items.value).toHaveLength(3);
        expect(new Set(itemsStore.items.value).size).toBe(3);
        expect(itemsStore.items.value.slice(0, 2)).toStrictEqual([
          firstItem,
          thirdItem,
        ]);
        expect(getFieldBool(itemsStore, 'isDirty')).toBe(true);
      }
    });
  });

  describe('dirty state for objects', () => {
    test('should mark object as dirty when input becomes null', () => {
      const store = createTestStore(
        v.object({ user: v.nullish(v.object({ name: v.string() })) }),
        { initialInput: { user: { name: 'John' } } }
      );
      setFieldInput(store, ['user'], null);
      expect(store.children.user.isDirty.value).toBe(true);
    });
  });

  test('should discard pending validation when input changes', async () => {
    const schema = v.object({
      name: v.pipe(v.string(), v.nonEmpty('Required')),
    });
    type ParseResult = v.SafeParseResult<typeof schema>;
    let resolveParse: (value: ParseResult) => void;
    const pendingParse = new Promise<ParseResult>((resolve) => {
      resolveParse = resolve;
    });
    const store = createTestStore(schema, { initialInput: { name: '' } });
    store.parse = () => pendingParse;
    const pendingValidation = validateFormInput(store);

    setFieldInput(store, ['name'], 'John');
    expect(store.isValidating.value).toBe(false);

    resolveParse!(v.safeParse(schema, { name: '' }));
    await pendingValidation;
    expect(store.children.name.input.value).toBe('John');
    expect(store.children.name.errors.value).toBeNull();
  });
});
