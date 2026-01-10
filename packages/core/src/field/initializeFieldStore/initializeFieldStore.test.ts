import * as v from 'valibot';
import { describe, expect, test } from 'vitest';
import { createTestStore } from '../../vitest/index.ts';

describe('initializeFieldStore', () => {
  describe('value fields', () => {
    test('should initialize with correct properties', () => {
      const store = createTestStore(v.object({ name: v.string() }), {
        initialInput: { name: 'John' },
      });
      const field = store.children.name;
      expect(field.kind).toBe('value');
      expect(field.name).toBe('["name"]');
      expect(field.input.value).toBe('John');
      expect(field.initialInput.value).toBe('John');
      expect(field.startInput.value).toBe('John');
      expect(field.errors.value).toBeNull();
      expect(field.isTouched.value).toBe(false);
      expect(field.isDirty.value).toBe(false);
    });

    test('should initialize with undefined input', () => {
      const store = createTestStore(v.object({ name: v.string() }));
      expect(store.children.name.input.value).toBeUndefined();
    });
  });

  describe('object fields', () => {
    test('should initialize with children', () => {
      const store = createTestStore(v.object({ a: v.string(), b: v.number() }));
      expect(store.kind).toBe('object');
      expect(store.name).toBe('[]');
      expect(store.children).toHaveProperty('a');
      expect(store.children).toHaveProperty('b');
    });

    test('should initialize nested object', () => {
      const store = createTestStore(
        v.object({ user: v.object({ name: v.string() }) })
      );
      const userStore = store.children.user;
      expect(userStore.kind).toBe('object');
      if (userStore.kind === 'object') {
        expect(userStore.children.name.kind).toBe('value');
      }
    });

    test('should set input to true for object fields', () => {
      const store = createTestStore(v.object({ name: v.string() }));
      expect(store.input.value).toBe(true);
    });
  });

  describe('array fields', () => {
    test('should initialize with children for each item', () => {
      const store = createTestStore(v.object({ items: v.array(v.string()) }), {
        initialInput: { items: ['a', 'b', 'c'] },
      });
      const itemsStore = store.children.items;
      expect(itemsStore.kind).toBe('array');
      if (itemsStore.kind === 'array') {
        expect(itemsStore.children).toHaveLength(3);
        expect(itemsStore.items.value).toHaveLength(3);
      }
    });

    test('should initialize empty array', () => {
      const store = createTestStore(v.object({ items: v.array(v.string()) }), {
        initialInput: { items: [] },
      });
      const itemsStore = store.children.items;
      expect(itemsStore.kind).toBe('array');
      if (itemsStore.kind === 'array') {
        expect(itemsStore.children).toHaveLength(0);
        expect(itemsStore.items.value).toHaveLength(0);
      }
    });

    test('should set input to true for array fields', () => {
      const store = createTestStore(v.object({ items: v.array(v.string()) }), {
        initialInput: { items: ['a'] },
      });
      expect(store.children.items.input.value).toBe(true);
    });
  });

  describe('wrapped schemas', () => {
    test('should unwrap optional schema', () => {
      const store = createTestStore(v.object({ name: v.optional(v.string()) }));
      expect(store.children.name.kind).toBe('value');
    });

    test('should unwrap nullable schema', () => {
      const store = createTestStore(v.object({ name: v.nullable(v.string()) }));
      expect(store.children.name.kind).toBe('value');
    });

    test('should unwrap nullish schema with null input', () => {
      const store = createTestStore(
        v.object({ user: v.nullish(v.object({ name: v.string() })) }),
        { initialInput: { user: null } }
      );
      expect(store.children.user.input.value).toBeNull();
    });

    test('should unwrap non_optional schema', () => {
      const store = createTestStore(
        v.object({ name: v.nonOptional(v.optional(v.string())) })
      );
      expect(store.children.name.kind).toBe('value');
    });
  });

  describe('union schemas', () => {
    test('should initialize for each union option', () => {
      const store = createTestStore(
        v.object({
          field: v.union([
            v.object({ a: v.string() }),
            v.object({ b: v.number() }),
          ]),
        })
      );
      const fieldStore = store.children.field;
      expect(fieldStore.kind).toBe('object');
      if (fieldStore.kind === 'object') {
        expect(fieldStore.children).toHaveProperty('a');
        expect(fieldStore.children).toHaveProperty('b');
      }
    });
  });

  describe('tuple schemas', () => {
    test('should initialize fixed tuple items', () => {
      const store = createTestStore(
        v.object({ tuple: v.tuple([v.string(), v.number()]) })
      );
      const tupleStore = store.children.tuple;
      expect(tupleStore.kind).toBe('array');
      if (tupleStore.kind === 'array') {
        expect(tupleStore.children).toHaveLength(2);
      }
    });
  });

  describe('lazy schemas', () => {
    test('should unwrap lazy schema', () => {
      const store = createTestStore(
        v.object({ name: v.lazy(() => v.string()) })
      );
      expect(store.children.name.kind).toBe('value');
    });

    test('should unwrap nested lazy schema', () => {
      const store = createTestStore(
        v.object({ user: v.lazy(() => v.object({ name: v.string() })) })
      );
      const userStore = store.children.user;
      expect(userStore.kind).toBe('object');
      if (userStore.kind === 'object') {
        expect(userStore.children.name.kind).toBe('value');
      }
    });
  });

  describe('unsupported schemas', () => {
    test('should throw for record schema', () => {
      expect(() => {
        createTestStore(v.object({ data: v.record(v.string(), v.number()) }));
      }).toThrow('"record" schema is not supported');
    });

    test('should throw for object_with_rest schema', () => {
      expect(() => {
        createTestStore(
          v.object({ data: v.objectWithRest({ a: v.string() }, v.number()) })
        );
      }).toThrow('"object_with_rest" schema is not supported');
    });
  });

  describe('reinitialization errors', () => {
    test('should throw when reinitializing object as array', () => {
      expect(() => {
        createTestStore(
          v.object({
            field: v.union([
              v.object({ name: v.string() }),
              v.array(v.string()),
            ]),
          })
        );
      }).toThrow('cannot be reinitialized as "array"');
    });

    test('should throw when reinitializing array as object', () => {
      expect(() => {
        createTestStore(
          v.object({
            field: v.union([
              v.array(v.string()),
              v.object({ name: v.string() }),
            ]),
          })
        );
      }).toThrow('cannot be reinitialized as "object"');
    });
  });
});
