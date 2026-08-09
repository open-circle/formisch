// @vitest-environment jsdom
import * as v from 'valibot';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  arrayPath,
  createTestStore,
  objectPath,
  schemaIssue,
  validationIssue,
} from '../../vitest/index.ts';
import { createFormStore } from '../createFormStore/createFormStore.ts';
import { validateFormInput } from './validateFormInput.ts';

describe('validateFormInput', () => {
  describe('successful validation', () => {
    test('should return success result when no issues', async () => {
      const schema = v.object({ name: v.string() });
      const store = createTestStore(schema, { initialInput: { name: 'John' } });

      const result = await validateFormInput(store);

      expect(result).toStrictEqual({
        typed: true,
        success: true,
        output: { name: 'John' },
        issues: undefined,
      });
    });

    test('should set all field errors to null on success', async () => {
      const schema = v.object({ name: v.string(), email: v.string() });
      const store = createTestStore(schema, {
        initialInput: { name: 'John', email: 'a@b.c' },
      });

      // Set some initial errors
      store.errors.value = ['root error'];
      store.children.name.errors.value = ['name error'];

      await validateFormInput(store);

      expect(store.errors.value).toBeNull();
      expect(store.children.name.errors.value).toBeNull();
      expect(store.children.email.errors.value).toBeNull();
    });
  });

  describe('validation with errors', () => {
    test('should assign root errors for issues without path', async () => {
      const schema = v.object({ name: v.string() });
      const store = createTestStore(schema, {
        initialInput: { name: 'John' },
        issues: [schemaIssue('Invalid type')],
      });

      await validateFormInput(store);

      expect(store.errors.value).toStrictEqual(['Invalid type']);
    });

    test('should assign nested errors for issues with path', async () => {
      const schema = v.object({ name: v.string() });
      const store = createTestStore(schema, {
        initialInput: { name: '' },
        issues: [validationIssue('Name is required', [objectPath('name')])],
      });

      await validateFormInput(store);

      expect(store.children.name.errors.value).toStrictEqual([
        'Name is required',
      ]);
    });

    test('should accumulate multiple errors on same field', async () => {
      const schema = v.object({ email: v.string() });
      const store = createTestStore(schema, {
        initialInput: { email: '' },
        issues: [
          validationIssue('Email is required', [objectPath('email')]),
          validationIssue('Invalid email format', [objectPath('email')]),
        ],
      });

      await validateFormInput(store);

      expect(store.children.email.errors.value).toStrictEqual([
        'Email is required',
        'Invalid email format',
      ]);
    });

    test('should handle nested object path', async () => {
      const schema = v.object({ user: v.object({ name: v.string() }) });
      const store = createTestStore(schema, {
        initialInput: { user: { name: '' } },
        issues: [
          validationIssue('Name is required', [
            objectPath('user', {}),
            objectPath('name'),
          ]),
        ],
      });

      await validateFormInput(store);

      const userStore = store.children.user;
      expect(userStore.kind).toBe('object');
      if (userStore.kind === 'object') {
        expect(userStore.children.name.errors.value).toStrictEqual([
          'Name is required',
        ]);
      }
    });

    test('should handle array path with index', async () => {
      const schema = v.object({ items: v.array(v.string()) });
      const store = createTestStore(schema, {
        initialInput: { items: ['a', ''] },
        issues: [
          validationIssue('Item is required', [
            objectPath('items', []),
            arrayPath(1),
          ]),
        ],
      });

      await validateFormInput(store);

      const itemsStore = store.children.items;
      expect(itemsStore.kind).toBe('array');
      if (itemsStore.kind === 'array') {
        expect(itemsStore.children[1].errors.value).toStrictEqual([
          'Item is required',
        ]);
      }
    });

    test('should handle multiple root errors', async () => {
      const schema = v.object({ name: v.string() });
      const store = createTestStore(schema, {
        initialInput: { name: '' },
        issues: [
          schemaIssue('First root error'),
          schemaIssue('Second root error'),
        ],
      });

      await validateFormInput(store);

      expect(store.errors.value).toStrictEqual([
        'First root error',
        'Second root error',
      ]);
    });
  });

  describe('edge cases for path handling', () => {
    test('should stop path building at symbol keys', async () => {
      const schema = v.object({ name: v.string() });
      const symbolPath: v.UnknownPathItem = {
        type: 'unknown',
        origin: 'value',
        input: {},
        key: Symbol('test'),
        value: '',
      };
      const store = createTestStore(schema, {
        initialInput: { name: '' },
        issues: [
          validationIssue('Symbol key error', [symbolPath, objectPath('name')]),
        ],
      });

      await validateFormInput(store);

      // Path building stops at symbol key, error is effectively lost
      expect(store.errors.value).toBeNull();
      expect(store.children.name.errors.value).toBeNull();
    });

    test('should stop path building at map type path items', async () => {
      const schema = v.object({ name: v.string() });
      const mapPath: v.MapPathItem = {
        type: 'map',
        origin: 'value',
        input: new Map(),
        key: 'key',
        value: '',
      };
      const store = createTestStore(schema, {
        initialInput: { name: '' },
        issues: [validationIssue('Map error', [mapPath])],
      });

      await validateFormInput(store);

      // Map paths are not supported
      expect(store.errors.value).toBeNull();
    });

    test('should stop path building at set type path items', async () => {
      const schema = v.object({ name: v.string() });
      const setPath: v.SetPathItem = {
        type: 'set',
        origin: 'value',
        input: new Set(),
        key: null,
        value: '',
      };
      const store = createTestStore(schema, {
        initialInput: { name: '' },
        issues: [validationIssue('Set error', [setPath])],
      });

      await validateFormInput(store);

      // Set paths are not supported
      expect(store.errors.value).toBeNull();
    });

    test('should build partial path when unsupported type appears mid-path', async () => {
      const schema = v.object({ user: v.object({ name: v.string() }) });
      const mapPath: v.MapPathItem = {
        type: 'map',
        origin: 'value',
        input: new Map(),
        key: 'key',
        value: '',
      };
      const store = createTestStore(schema, {
        initialInput: { user: { name: '' } },
        issues: [
          validationIssue('Mid-path error', [
            objectPath('user', {}),
            mapPath,
            objectPath('name'),
          ]),
        ],
      });

      await validateFormInput(store);

      // Path building stops at map, so only ['user'] is built
      expect(store.children.user.errors.value).toStrictEqual([
        'Mid-path error',
      ]);
    });
  });

  describe('focus behavior', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
    });

    test('should focus first error field when shouldFocus is true', async () => {
      const schema = v.object({ name: v.string(), email: v.string() });
      const store = createTestStore(schema, {
        initialInput: { name: '', email: '' },
        issues: [
          validationIssue('Name is required', [objectPath('name')]),
          validationIssue('Email is required', [objectPath('email')]),
        ],
      });

      const inputElement = document.createElement('input');
      document.body.appendChild(inputElement);
      store.children.name.elements = [inputElement];

      await validateFormInput(store, { shouldFocus: true });

      expect(document.activeElement).toBe(inputElement);
    });

    test('should not focus when shouldFocus is false', async () => {
      const schema = v.object({ name: v.string() });
      const store = createTestStore(schema, {
        initialInput: { name: '' },
        issues: [validationIssue('Name is required', [objectPath('name')])],
      });

      const inputElement = document.createElement('input');
      document.body.appendChild(inputElement);
      const mockFocus = vi.spyOn(inputElement, 'focus');
      store.children.name.elements = [inputElement];

      await validateFormInput(store, { shouldFocus: false });

      expect(mockFocus).not.toHaveBeenCalled();
    });

    test('should not focus when shouldFocus is undefined', async () => {
      const schema = v.object({ name: v.string() });
      const store = createTestStore(schema, {
        initialInput: { name: '' },
        issues: [validationIssue('Name is required', [objectPath('name')])],
      });

      const inputElement = document.createElement('input');
      document.body.appendChild(inputElement);
      const mockFocus = vi.spyOn(inputElement, 'focus');
      store.children.name.elements = [inputElement];

      await validateFormInput(store);

      expect(mockFocus).not.toHaveBeenCalled();
    });

    test('should focus next error field when the first has no element', async () => {
      const schema = v.object({ name: v.string(), email: v.string() });
      const store = createTestStore(schema, {
        initialInput: { name: '', email: '' },
        issues: [
          validationIssue('Name is required', [objectPath('name')]),
          validationIssue('Email is required', [objectPath('email')]),
        ],
      });

      // The first erroring field (name) has no registered element, so focus
      // must fall through to the second erroring field (email)
      const emailInput = document.createElement('input');
      document.body.appendChild(emailInput);
      store.children.email.elements = [emailInput];

      await validateFormInput(store, { shouldFocus: true });

      expect(document.activeElement).toBe(emailInput);
    });

    test('should skip an erroring field whose element cannot be focused', async () => {
      const schema = v.object({ name: v.string(), email: v.string() });
      const store = createTestStore(schema, {
        initialInput: { name: '', email: '' },
        issues: [
          validationIssue('Name is required', [objectPath('name')]),
          validationIssue('Email is required', [objectPath('email')]),
        ],
      });

      // The first erroring field has a disabled (unfocusable) element, so the
      // focus must fall through to the second erroring field
      const nameInput = document.createElement('input');
      nameInput.disabled = true;
      const emailInput = document.createElement('input');
      document.body.appendChild(nameInput);
      document.body.appendChild(emailInput);
      store.children.name.elements = [nameInput];
      store.children.email.elements = [emailInput];

      await validateFormInput(store, { shouldFocus: true });

      expect(document.activeElement).toBe(emailInput);
    });

    test('should only focus first field with error', async () => {
      const schema = v.object({ name: v.string(), email: v.string() });
      const store = createTestStore(schema, {
        initialInput: { name: '', email: '' },
        issues: [
          validationIssue('Name is required', [objectPath('name')]),
          validationIssue('Email is required', [objectPath('email')]),
        ],
      });

      const nameInput = document.createElement('input');
      const emailInput = document.createElement('input');
      document.body.appendChild(nameInput);
      document.body.appendChild(emailInput);
      const mockFocusName = vi.spyOn(nameInput, 'focus');
      const mockFocusEmail = vi.spyOn(emailInput, 'focus');
      store.children.name.elements = [nameInput];
      store.children.email.elements = [emailInput];

      await validateFormInput(store, { shouldFocus: true });

      expect(mockFocusName).toHaveBeenCalledOnce();
      expect(mockFocusEmail).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(nameInput);
    });
  });

  describe('validation state management', () => {
    test('should set isValidating to true during validation', async () => {
      const schema = v.object({ name: v.string() });
      let isValidatingDuringParse = false;

      const parse = vi.fn().mockImplementation(async () => {
        isValidatingDuringParse = true;
        return { typed: true, success: true, output: {}, issues: undefined };
      });

      const store = createFormStore({ schema }, parse);
      await validateFormInput(store);

      expect(isValidatingDuringParse).toBe(true);
    });

    test('should set isValidating to false after validation', async () => {
      const schema = v.object({ name: v.string() });
      const store = createTestStore(schema, { initialInput: { name: 'John' } });

      await validateFormInput(store);

      expect(store.isValidating.value).toBe(false);
    });

    test('should increment validation ID for each validation', async () => {
      const schema = v.object({ name: v.string() });
      const store = createTestStore(schema, { initialInput: { name: 'John' } });

      expect(store.validationId).toBe(0);
      await validateFormInput(store);
      expect(store.validationId).toBe(1);
      await validateFormInput(store);
      expect(store.validationId).toBe(2);
    });

    test('should reset validation state when parse rejects', async () => {
      const schema = v.object({ name: v.string() });
      const parse = vi.fn().mockRejectedValue(new Error('Parse failed'));
      const store = createFormStore({ schema }, parse);

      await expect(validateFormInput(store)).rejects.toThrow('Parse failed');

      // The validating state must not leak on error
      expect(store.isValidating.value).toBe(false);
    });

    test('should handle concurrent validations', async () => {
      const schema = v.object({ name: v.string() });
      type ParseResult = v.SafeParseResult<typeof schema>;
      let resolveFirst: (value: ParseResult) => void;
      let resolveSecond: (value: ParseResult) => void;

      const parseFirst = new Promise<ParseResult>((resolve) => {
        resolveFirst = resolve;
      });
      const parseSecond = new Promise<ParseResult>((resolve) => {
        resolveSecond = resolve;
      });

      let callCount = 0;
      const parse = vi.fn().mockImplementation(() => {
        callCount++;
        return callCount === 1 ? parseFirst : parseSecond;
      });

      const store = createFormStore({ schema }, parse);

      // Start two validations
      const validation1 = validateFormInput(store);
      const validation2 = validateFormInput(store);

      expect(store.isValidating.value).toBe(true);

      // Resolve first validation
      resolveFirst!({
        typed: true,
        success: true,
        output: { name: 'John' },
        issues: undefined,
      });
      await validation1;

      // The first validation is stale, so it must not reset the validating
      // state of the second validation that is still pending
      expect(store.isValidating.value).toBe(true);

      // Resolve second validation
      resolveSecond!({
        typed: true,
        success: true,
        output: { name: 'Jane' },
        issues: undefined,
      });
      await validation2;

      expect(store.isValidating.value).toBe(false);
    });

    test('should not let an older validation overwrite newer errors', async () => {
      const schema = v.object({
        name: v.pipe(v.string(), v.nonEmpty('New error')),
      });
      type ParseResult = v.SafeParseResult<typeof schema>;
      let resolveFirst: (value: ParseResult) => void;
      let resolveSecond: (value: ParseResult) => void;
      const firstResult = new Promise<ParseResult>((resolve) => {
        resolveFirst = resolve;
      });
      const secondResult = new Promise<ParseResult>((resolve) => {
        resolveSecond = resolve;
      });
      const parse = vi
        .fn()
        .mockReturnValueOnce(firstResult)
        .mockReturnValueOnce(secondResult);
      const store = createFormStore({ schema }, parse);

      const firstValidation = validateFormInput(store);
      const secondValidation = validateFormInput(store);

      resolveSecond!(v.safeParse(schema, { name: '' }));
      await secondValidation;
      expect(store.children.name.errors.value).toStrictEqual(['New error']);

      resolveFirst!({
        typed: true,
        success: true,
        output: { name: 'valid' },
        issues: undefined,
      });
      await firstValidation;

      expect(store.children.name.errors.value).toStrictEqual(['New error']);
      expect(store.isValidating.value).toBe(false);
    });

    test('should not clear validating state when focusing starts a new validation', async () => {
      const schema = v.object({
        name: v.pipe(v.string(), v.nonEmpty('Error')),
      });
      type ParseResult = v.SafeParseResult<typeof schema>;
      let resolveSecond: (value: ParseResult) => void;
      const secondResult = new Promise<ParseResult>((resolve) => {
        resolveSecond = resolve;
      });
      const parse = vi
        .fn()
        .mockResolvedValueOnce(v.safeParse(schema, { name: '' }))
        .mockReturnValueOnce(secondResult);
      const store = createFormStore({ schema }, parse);

      // Register an element for the erroring field so it can receive focus
      const nameInput = document.createElement('input');
      document.body.appendChild(nameInput);
      store.children.name.elements.push(nameInput);

      // Focus another element whose blur handler synchronously starts a new
      // validation when the focus moves to the erroring field
      let secondValidation: Promise<unknown> | undefined;
      const otherInput = document.createElement('input');
      document.body.appendChild(otherInput);
      otherInput.addEventListener('blur', () => {
        secondValidation = validateFormInput(store);
      });
      otherInput.focus();

      await validateFormInput(store, { shouldFocus: true });

      // The synchronously started validation is still pending, so the older
      // validation must not clear its validating state
      expect(secondValidation).toBeDefined();
      expect(store.isValidating.value).toBe(true);

      resolveSecond!(v.safeParse(schema, { name: '' }));
      await secondValidation;
      expect(store.isValidating.value).toBe(false);
    });
  });
});
