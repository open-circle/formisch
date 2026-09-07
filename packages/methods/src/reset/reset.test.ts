// @vitest-environment jsdom
import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import { setInput } from '../setInput/setInput.ts';
import { validate } from '../validate/validate.ts';
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

    test('should reset field edited state', () => {
      const store = createTestStore(v.object({ name: v.string() }));
      store.children.name.isEdited.value = true;

      reset(store);

      expect(store.children.name.isEdited.value).toBe(false);
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

  describe('form reset with keepEdited', () => {
    test('should keep edited state', () => {
      const store = createTestStore(v.object({ name: v.string() }));
      store.children.name.isEdited.value = true;

      reset(store, { keepEdited: true });

      expect(store.children.name.isEdited.value).toBe(true);
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

    test('should reset field to empty string initial input', () => {
      const store = createTestStore(v.object({ name: v.string() }), {
        initialInput: { name: 'John' },
      });

      reset(store, { path: ['name'], initialInput: '' });

      expect(store.children.name.input.value).toBe('');
      expect(store.children.name.initialInput.value).toBe('');
    });

    test('should reset field to zero initial input', () => {
      const store = createTestStore(v.object({ count: v.number() }), {
        initialInput: { count: 42 },
      });

      reset(store, { path: ['count'], initialInput: 0 });

      expect(store.children.count.input.value).toBe(0);
      expect(store.children.count.initialInput.value).toBe(0);
    });

    test('should reset field to false initial input', () => {
      const store = createTestStore(v.object({ flag: v.boolean() }), {
        initialInput: { flag: true },
      });

      reset(store, { path: ['flag'], initialInput: false });

      expect(store.children.flag.input.value).toBe(false);
      expect(store.children.flag.initialInput.value).toBe(false);
    });

    test('should reset field to null initial input', () => {
      const store = createTestStore(
        v.object({ name: v.nullable(v.string()) }),
        { initialInput: { name: 'John' } }
      );

      reset(store, { path: ['name'], initialInput: null });

      expect(store.children.name.input.value).toBeNull();
      expect(store.children.name.initialInput.value).toBeNull();
    });

    test('should reset field to its empty input when initialInput is explicitly undefined', () => {
      const store = createTestStore(v.object({ name: v.string() }), {
        initialInput: { name: 'John' },
      });
      store.children.name.input.value = 'Jane';

      reset(store, { path: ['name'], initialInput: undefined });

      // A required string falls back to its empty input, staying consistent
      // with form initialization
      expect(store.children.name.input.value).toBe('');
      expect(store.children.name.initialInput.value).toBe('');
    });

    test('should keep existing initial input when initialInput key is omitted', () => {
      const store = createTestStore(v.object({ name: v.string() }), {
        initialInput: { name: 'John' },
      });
      store.children.name.input.value = 'Jane';

      reset(store, { path: ['name'] });

      expect(store.children.name.input.value).toBe('John');
      expect(store.children.name.initialInput.value).toBe('John');
    });

    test('should reset nullish object field to new initial input', () => {
      const store = createTestStore(
        v.object({ user: v.nullish(v.object({ name: v.string() })) })
      );

      reset(store, { path: ['user'], initialInput: { name: 'John' } });

      expect(store.children.user.initialInput.value).toBe(true);
      expect(store.children.user.input.value).toBe(true);
      const userStore = store.children.user;
      expect(userStore.kind).toBe('object');
      if (userStore.kind === 'object') {
        expect(userStore.children.name.initialInput.value).toBe('John');
        expect(userStore.children.name.input.value).toBe('John');
      }
    });

    test('should reset nullish object field to undefined initial input', () => {
      const store = createTestStore(
        v.object({ user: v.nullish(v.object({ name: v.string() })) }),
        { initialInput: { user: { name: 'John' } } }
      );

      reset(store, { path: ['user'], initialInput: undefined });

      expect(store.children.user.initialInput.value).toBeUndefined();
      expect(store.children.user.input.value).toBeUndefined();
    });

    test('should reset nullish array field to new initial input', () => {
      const store = createTestStore(
        v.object({ items: v.nullish(v.array(v.string())) })
      );

      reset(store, { path: ['items'], initialInput: ['x', 'y'] });

      expect(store.children.items.initialInput.value).toBe(true);
      expect(store.children.items.input.value).toBe(true);
      const itemsStore = store.children.items;
      expect(itemsStore.kind).toBe('array');
      if (itemsStore.kind === 'array') {
        expect(itemsStore.items.value).toHaveLength(2);
        expect(itemsStore.children[0].input.value).toBe('x');
        expect(itemsStore.children[1].input.value).toBe('y');
      }
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

  describe('reset while an async validation is pending', () => {
    test('should not apply a stale validation result for input replaced by reset', async () => {
      const schema = v.object({
        name: v.pipe(v.string(), v.nonEmpty('Name is required')),
      });
      type ParseResult = v.SafeParseResult<typeof schema>;

      // Manually controlled parse result so the test decides exactly when
      // the async validation resolves, instead of relying on real timers.
      let resolveValidation: (value: ParseResult) => void;
      const pendingParse = new Promise<ParseResult>((resolve) => {
        resolveValidation = resolve;
      });

      const store = createTestStore(schema, { initialInput: { name: 'John' } });
      const parse = vi.fn().mockReturnValue(pendingParse);
      store.parse = parse;

      // Enter an invalid value for the field
      setInput(store, { path: ['name'], input: '' });

      // Start async validation for the invalid input and keep it pending.
      // `validate` is the public method that mirrors what a framework
      // wrapper triggers when validation runs (e.g. on blur).
      const pendingValidation = validate(store);
      expect(parse).toHaveBeenCalledWith({ name: '' });
      expect(store.isValidating.value).toBe(true);

      // Reset the form while the validation above is still in flight
      reset(store);

      // A: reset immediately restores the valid initial input, clears
      // errors, and does not leave the form stuck in a validating state
      // since no new validation was started (`validate` is not 'initial')
      expect(store.children.name.input.value).toBe('John');
      expect(store.children.name.errors.value).toBeNull();
      expect(store.isValidating.value).toBe(false);

      // Complete the pending validation with a real error result for the
      // input that was actually validated (before reset replaced it)
      const staleResult = v.safeParse(schema, { name: '' });
      expect(staleResult.success).toBe(false);
      resolveValidation!(staleResult);
      await pendingValidation;

      // B: the stale validation result must not reintroduce errors for
      // input that no longer exists after reset, and must not resurrect
      // the validating state either
      expect(store.children.name.input.value).toBe('John');
      expect(store.children.name.errors.value).toBeNull();
      expect(store.isValidating.value).toBe(false);
    });

    test('should keep isValidating true until the new validation started by reset completes, even if the stale validation resolves first', async () => {
      const schema = v.object({
        name: v.pipe(v.string(), v.nonEmpty('Name is required')),
      });
      type ParseResult = v.SafeParseResult<typeof schema>;

      let resolveOldValidation: (value: ParseResult) => void;
      const pendingOldParse = new Promise<ParseResult>((resolve) => {
        resolveOldValidation = resolve;
      });
      let resolveNewValidation: (value: ParseResult) => void;
      const pendingNewParse = new Promise<ParseResult>((resolve) => {
        resolveNewValidation = resolve;
      });

      // The initial input is invalid so the validation reset('initial')
      // starts has a genuine error to report once it resolves.
      const store = createTestStore(schema, {
        validate: 'initial',
        initialInput: { name: '' },
      });
      const parse = vi
        .fn()
        .mockReturnValueOnce(pendingOldParse)
        .mockReturnValueOnce(pendingNewParse);
      store.parse = parse;

      // Set the input directly, bypassing `setInput`'s own validation
      // trigger (which would fire an extra time here since `validate:
      // 'initial'` falls back to `revalidate` for input-change events), so
      // the explicit `validate(store)` call below is the only thing that
      // starts the "old" validation.
      store.children.name.input.value = 'temporary';
      const oldValidation = validate(store);
      expect(store.isValidating.value).toBe(true);

      // Reset while the old validation is still in flight. Since `validate`
      // is 'initial', reset starts a brand new validation for the restored
      // (invalid) initial input.
      reset(store);
      expect(parse).toHaveBeenCalledTimes(2);
      expect(store.isValidating.value).toBe(true);

      // Resolve the OLD validation first, with a real (but now irrelevant)
      // success result for the input it actually validated ('temporary' is
      // non-empty, so it passes). Using a success result here specifically
      // checks that the stale validation is discarded outright rather than
      // merely failing to overwrite an error: if it were still processed, it
      // would incorrectly clear `isValidating` early, even though it reports
      // no error of its own.
      const staleResult = v.safeParse(schema, { name: 'temporary' });
      expect(staleResult.success).toBe(true);
      resolveOldValidation!(staleResult);
      await oldValidation;

      // The new validation triggered by reset has not resolved yet, so the
      // form must still report as validating, and the stale (successful)
      // result must not have been applied either.
      expect(store.isValidating.value).toBe(true);
      expect(store.children.name.errors.value).toBeNull();

      // Resolve the NEW validation with the genuine result for the reset
      // (invalid) initial input.
      const newResult = v.safeParse(schema, { name: '' });
      expect(newResult.success).toBe(false);
      resolveNewValidation!(newResult);
      await pendingNewParse;

      expect(store.isValidating.value).toBe(false);
      expect(store.children.name.errors.value).toEqual(['Name is required']);
    });
  });

  describe('reset with keepErrors while an async validation is pending', () => {
    test('should not let a stale validation result overwrite errors kept by keepErrors', async () => {
      const schema = v.object({
        name: v.pipe(v.string(), v.nonEmpty('Name is required')),
      });
      type ParseResult = v.SafeParseResult<typeof schema>;

      let resolveValidation: (value: ParseResult) => void;
      const pendingParse = new Promise<ParseResult>((resolve) => {
        resolveValidation = resolve;
      });

      const store = createTestStore(schema, { initialInput: { name: 'John' } });
      const parse = vi.fn().mockReturnValue(pendingParse);
      store.parse = parse;

      // Give the field a pre-existing error that keepErrors should preserve.
      store.children.name.errors.value = ['Existing error'];

      setInput(store, { path: ['name'], input: '' });
      const pendingValidation = validate(store);
      expect(store.isValidating.value).toBe(true);

      reset(store, { keepErrors: true });

      // keepErrors preserves the pre-existing error, and the pending
      // validation is still invalidated like in a regular reset.
      expect(store.children.name.input.value).toBe('John');
      expect(store.children.name.errors.value).toEqual(['Existing error']);
      expect(store.isValidating.value).toBe(false);

      const staleResult = v.safeParse(schema, { name: '' });
      resolveValidation!(staleResult);
      await pendingValidation;

      // The stale validation must not overwrite the kept error either.
      expect(store.children.name.errors.value).toEqual(['Existing error']);
      expect(store.isValidating.value).toBe(false);
    });
  });

  describe('reset with keepInput while an async validation is pending', () => {
    test('should discard the stale validation and reset error/validating state even though keepInput preserves the input it was validating', async () => {
      const schema = v.object({
        name: v.pipe(v.string(), v.nonEmpty('Name is required')),
      });
      type ParseResult = v.SafeParseResult<typeof schema>;

      let resolveValidation: (value: ParseResult) => void;
      const pendingParse = new Promise<ParseResult>((resolve) => {
        resolveValidation = resolve;
      });

      // `validate: 'submit'` is used so that entering the invalid value via
      // the public `setInput` API does not itself trigger a validation
      // (submit-mode only auto-validates once the form has been submitted),
      // leaving `validate(store)` below as the sole trigger.
      const store = createTestStore(schema, {
        validate: 'submit',
        initialInput: { name: 'John' },
      });
      const parse = vi.fn().mockReturnValue(pendingParse);
      store.parse = parse;

      // Enter a value different from the initial input that fails validation.
      setInput(store, { path: ['name'], input: '' });

      // Start async validation for the current (invalid) input via the
      // public API and keep it pending.
      const pendingValidation = validate(store);
      expect(parse).toHaveBeenCalledWith({ name: '' });
      expect(store.isValidating.value).toBe(true);

      // Reset while that validation is still in flight, keeping the current
      // input instead of reverting to the initial value.
      reset(store, { keepInput: true });

      // `keepInput` preserves the input, but reset still invalidates pending
      // validation and clears the validating state. Errors are cleared unless
      // `keepErrors` is also enabled.
      expect(store.children.name.input.value).toBe('');
      expect(store.children.name.errors.value).toBeNull();
      expect(store.isValidating.value).toBe(false);

      // Complete the pre-reset validation with a real error result for the
      // input it actually validated, which - because of keepInput - is
      // still the field's current input.
      const staleResult = v.safeParse(schema, { name: '' });
      expect(staleResult.success).toBe(false);
      resolveValidation!(staleResult);
      await pendingValidation;

      // The stale result must still not be applied, even though it was
      // validating the exact value keepInput preserved.
      expect(store.children.name.input.value).toBe('');
      expect(store.children.name.errors.value).toBeNull();
      expect(store.isValidating.value).toBe(false);
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
