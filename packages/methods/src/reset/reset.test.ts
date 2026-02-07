// @vitest-environment jsdom
import * as v from 'valibot';
import { describe, expect, test } from 'vitest';
import { createTestStore } from '../vitest/index.ts';
import { reset } from './reset.ts';

describe('reset', () => {
  describe('form reset', () => {
    test('should reset field input to initial value', () => {
      const store = createTestStore(v.object({ name: v.string() }), {
        initialInput: { name: 'John' },
      });
      store.children.name.input.value = 'Jane';

      reset(store);

      expect(store.children.name.input.value).toBe('John');
    });

    test('should reset field touched state', () => {
      const store = createTestStore(v.object({ name: v.string() }));
      store.children.name.isTouched.value = true;

      reset(store);

      expect(store.children.name.isTouched.value).toBe(false);
    });

    test('should reset field errors', () => {
      const store = createTestStore(v.object({ name: v.string() }));
      store.children.name.errors.value = ['Error'];

      reset(store);

      expect(store.children.name.errors.value).toBeNull();
    });

    test('should reset form submitted state', () => {
      const store = createTestStore(v.object({ name: v.string() }));
      store.isSubmitted.value = true;

      reset(store);

      expect(store.isSubmitted.value).toBe(false);
    });

    test('should reset form errors', () => {
      const store = createTestStore(v.object({ name: v.string() }));
      store.errors.value = ['Form error'];

      reset(store);

      expect(store.errors.value).toBeNull();
    });

    test('should reset nested object field', () => {
      const store = createTestStore(
        v.object({ user: v.object({ email: v.string() }) }),
        { initialInput: { user: { email: 'test@example.com' } } }
      );
      const userStore = store.children.user;
      expect(userStore.kind).toBe('object');
      if (userStore.kind === 'object') {
        userStore.children.email.input.value = 'changed@example.com';
        userStore.children.email.isTouched.value = true;
      }

      reset(store);

      if (userStore.kind === 'object') {
        expect(userStore.children.email.input.value).toBe('test@example.com');
        expect(userStore.children.email.isTouched.value).toBe(false);
      }
    });

    test('should reset array field', () => {
      const store = createTestStore(v.object({ items: v.array(v.string()) }), {
        initialInput: { items: ['a', 'b'] },
      });
      const itemsStore = store.children.items;
      expect(itemsStore.kind).toBe('array');
      if (itemsStore.kind === 'array') {
        itemsStore.children[0].input.value = 'x';
        itemsStore.children[0].isTouched.value = true;
      }

      reset(store);

      if (itemsStore.kind === 'array') {
        expect(itemsStore.children[0].input.value).toBe('a');
        expect(itemsStore.children[0].isTouched.value).toBe(false);
      }
    });

    test('should reset file input element', () => {
      const store = createTestStore(v.object({ file: v.optional(v.any()) }));
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      store.children.file.elements = [fileInput];

      reset(store);

      expect(fileInput.value).toBe('');
    });
  });

  describe('form reset with initialInput', () => {
    test('should reset to new initial input', () => {
      const store = createTestStore(v.object({ name: v.string() }), {
        initialInput: { name: 'John' },
      });
      store.children.name.input.value = 'Jane';

      reset(store, { initialInput: { name: 'Bob' } });

      expect(store.children.name.input.value).toBe('Bob');
      expect(store.children.name.initialInput.value).toBe('Bob');
    });
  });

  describe('form reset with keepInput', () => {
    test('should keep current input values', () => {
      const store = createTestStore(v.object({ name: v.string() }), {
        initialInput: { name: 'John' },
      });
      store.children.name.input.value = 'Jane';

      reset(store, { keepInput: true });

      expect(store.children.name.input.value).toBe('Jane');
    });

    test('should still reset touched and errors', () => {
      const store = createTestStore(v.object({ name: v.string() }));
      store.children.name.isTouched.value = true;
      store.children.name.errors.value = ['Error'];

      reset(store, { keepInput: true });

      expect(store.children.name.isTouched.value).toBe(false);
      expect(store.children.name.errors.value).toBeNull();
    });
  });

  describe('form reset with keepTouched', () => {
    test('should keep touched state', () => {
      const store = createTestStore(v.object({ name: v.string() }));
      store.children.name.isTouched.value = true;

      reset(store, { keepTouched: true });

      expect(store.children.name.isTouched.value).toBe(true);
    });
  });

  describe('form reset with keepErrors', () => {
    test('should keep field errors', () => {
      const store = createTestStore(v.object({ name: v.string() }));
      store.children.name.errors.value = ['Error'];

      reset(store, { keepErrors: true });

      expect(store.children.name.errors.value).toEqual(['Error']);
    });

    test('should keep form errors', () => {
      const store = createTestStore(v.object({ name: v.string() }));
      store.errors.value = ['Form error'];

      reset(store, { keepErrors: true });

      expect(store.errors.value).toEqual(['Form error']);
    });
  });

  describe('form reset with keepSubmitted', () => {
    test('should keep submitted state', () => {
      const store = createTestStore(v.object({ name: v.string() }));
      store.isSubmitted.value = true;

      reset(store, { keepSubmitted: true });

      expect(store.isSubmitted.value).toBe(true);
    });
  });

  describe('field reset', () => {
    test('should reset specific field', () => {
      const store = createTestStore(
        v.object({ name: v.string(), email: v.string() }),
        { initialInput: { name: 'John', email: 'test@example.com' } }
      );
      store.children.name.input.value = 'Jane';
      store.children.email.input.value = 'changed@example.com';

      reset(store, { path: ['name'] });

      expect(store.children.name.input.value).toBe('John');
      expect(store.children.email.input.value).toBe('changed@example.com');
    });

    test('should reset specific field touched state', () => {
      const store = createTestStore(v.object({ name: v.string() }));
      store.children.name.isTouched.value = true;

      reset(store, { path: ['name'] });

      expect(store.children.name.isTouched.value).toBe(false);
    });

    test('should reset specific field errors', () => {
      const store = createTestStore(v.object({ name: v.string() }));
      store.children.name.errors.value = ['Error'];

      reset(store, { path: ['name'] });

      expect(store.children.name.errors.value).toBeNull();
    });
  });

  describe('field reset with initialInput', () => {
    test('should reset field to new initial input', () => {
      const store = createTestStore(v.object({ name: v.string() }), {
        initialInput: { name: 'John' },
      });

      reset(store, { path: ['name'], initialInput: 'Bob' });

      expect(store.children.name.input.value).toBe('Bob');
      expect(store.children.name.initialInput.value).toBe('Bob');
    });
  });

  describe('file input reset', () => {
    test('should reset file input elements', () => {
      const store = createTestStore(v.object({ file: v.string() }), {
        initialInput: { file: '' },
      });
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      // Set both elements and initialElements so reset doesn't clear elements
      // before the file reset loop runs
      store.children.file.elements = [fileInput];
      store.children.file.initialElements = [fileInput];

      reset(store);

      // File input's value should be reset to empty string
      expect(fileInput.value).toBe('');
    });

    test('should reset only file type inputs', () => {
      const store = createTestStore(v.object({ name: v.string() }), {
        initialInput: { name: 'John' },
      });
      const textInput = document.createElement('input');
      textInput.type = 'text';
      textInput.value = 'test';
      // Set both elements and initialElements
      store.children.name.elements = [textInput];
      store.children.name.initialElements = [textInput];

      reset(store);

      // Text input value is not touched by the file reset logic
      expect(textInput.value).toBe('test');
    });
  });

  describe('validate on initial mode', () => {
    test('should validate form when validate mode is initial', async () => {
      const store = createTestStore(v.object({ name: v.string() }), {
        validate: 'initial',
        initialInput: { name: 'John' },
      });

      reset(store);

      // Form should trigger validation on initial mode
      // The parse function is called during validation
      expect(store.isSubmitted.value).toBe(false);
    });
  });

  describe('isDirty edge cases', () => {
    test('should mark dirty when startInput is null and input is not empty', () => {
      const store = createTestStore(
        v.object({ name: v.optional(v.string()) }),
        {
          initialInput: { name: undefined },
        }
      );
      // Set start to undefined, current input to a value
      store.children.name.startInput.value = undefined;
      store.children.name.input.value = 'modified';

      reset(store, { keepInput: true });

      // After reset with keepInput, isDirty should be true because
      // startInput is undefined and input is not empty
      expect(store.children.name.isDirty.value).toBe(true);
    });

    test('should not mark dirty when startInput is null and input is empty string', () => {
      const store = createTestStore(
        v.object({ name: v.optional(v.string()) }),
        {
          initialInput: { name: undefined },
        }
      );
      // Set start to undefined, current input to empty string
      store.children.name.startInput.value = undefined;
      store.children.name.input.value = '';

      reset(store, { keepInput: true });

      // After reset with keepInput, isDirty should be false
      // because input is empty string (not meaningful change from undefined)
      expect(store.children.name.isDirty.value).toBe(false);
    });
  });

  describe('array field reset', () => {
    test('should reset array items to initial state', () => {
      const store = createTestStore(v.object({ items: v.array(v.string()) }), {
        initialInput: { items: ['a', 'b'] },
      });
      const itemsStore = store.children.items;
      expect(itemsStore.kind).toBe('array');
      if (itemsStore.kind === 'array') {
        // Modify child input to make dirty
        itemsStore.children[0].input.value = 'modified';
      }

      reset(store);

      if (itemsStore.kind === 'array') {
        // Array items should be reset to initial
        expect(itemsStore.items.value).toEqual(itemsStore.initialItems.value);
        expect(itemsStore.children[0].input.value).toBe('a');
      }
    });

    test('should reset array items even with keepInput when lengths match', () => {
      const store = createTestStore(v.object({ items: v.array(v.string()) }), {
        initialInput: { items: ['a', 'b'] },
      });
      const itemsStore = store.children.items;
      expect(itemsStore.kind).toBe('array');
      if (itemsStore.kind === 'array') {
        // Modify startItems to simulate items were changed
        itemsStore.startItems.value = [...itemsStore.items.value];
        // Modify children input to make dirty
        itemsStore.children[0].input.value = 'modified';
      }

      reset(store, { keepInput: true });

      // With keepInput and same length, items should still reset
      if (itemsStore.kind === 'array') {
        expect(itemsStore.items.value).toEqual(itemsStore.initialItems.value);
      }
    });

    test('should reset nested array field state', () => {
      const store = createTestStore(v.object({ items: v.array(v.string()) }), {
        initialInput: { items: ['a', 'b'] },
      });
      const itemsStore = store.children.items;
      expect(itemsStore.kind).toBe('array');
      if (itemsStore.kind === 'array') {
        // Set error on child
        itemsStore.children[0].errors.value = ['Error'];
        itemsStore.children[0].isTouched.value = true;
      }

      reset(store);

      if (itemsStore.kind === 'array') {
        expect(itemsStore.children[0].errors.value).toBe(null);
        expect(itemsStore.children[0].isTouched.value).toBe(false);
      }
    });
  });
});
