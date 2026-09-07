// @vitest-environment jsdom
import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import { getErrors } from '../getErrors/getErrors.ts';
import { getInput } from '../getInput/getInput.ts';
import { insert } from '../insert/insert.ts';
import { move } from '../move/move.ts';
import { remove } from '../remove/remove.ts';
import { replace } from '../replace/replace.ts';
import { reset } from '../reset/reset.ts';
import { setInput } from '../setInput/setInput.ts';
import { swap } from '../swap/swap.ts';
import { createTestStore } from '../vitest/index.ts';
import { validate } from './validate.ts';

describe('validate', () => {
  test('should validate form and return success result', async () => {
    const store = createTestStore(v.object({ name: v.string() }), {
      initialInput: { name: 'John' },
    });

    const result = await validate(store);

    expect(result.success).toBe(true);
  });

  test('should return failure result when validation fails', async () => {
    const store = createTestStore(v.object({ name: v.string() }), {
      initialInput: { name: '' },
      issues: [
        {
          kind: 'validation',
          type: 'non_empty',
          input: '',
          expected: '!""',
          received: '""',
          message: 'Name is required',
          path: [
            {
              type: 'object',
              origin: 'value',
              input: {},
              key: 'name',
              value: '',
            },
          ],
        },
      ],
    });

    const result = await validate(store);

    expect(result.success).toBe(false);
  });

  test('should focus first error field when shouldFocus is true', async () => {
    const store = createTestStore(v.object({ name: v.string() }), {
      issues: [
        {
          kind: 'validation',
          type: 'non_empty',
          input: '',
          expected: '!""',
          received: '""',
          message: 'Name is required',
          path: [
            {
              type: 'object',
              origin: 'value',
              input: {},
              key: 'name',
              value: '',
            },
          ],
        },
      ],
    });
    const input = document.createElement('input');
    const focusSpy = vi.spyOn(input, 'focus');
    store.children.name.elements = [input];

    await validate(store, { shouldFocus: true });

    expect(focusSpy).toHaveBeenCalledOnce();
  });

  test('should not focus when shouldFocus is false', async () => {
    const store = createTestStore(v.object({ name: v.string() }), {
      issues: [
        {
          kind: 'validation',
          type: 'non_empty',
          input: '',
          expected: '!""',
          received: '""',
          message: 'Name is required',
          path: [
            {
              type: 'object',
              origin: 'value',
              input: {},
              key: 'name',
              value: '',
            },
          ],
        },
      ],
    });
    const input = document.createElement('input');
    const focusSpy = vi.spyOn(input, 'focus');
    store.children.name.elements = [input];

    await validate(store, { shouldFocus: false });

    expect(focusSpy).not.toHaveBeenCalled();
  });

  describe('input changes during validation', () => {
    test.each<'blur' | 'input'>(['blur', 'input'])(
      'should discard old errors after setInput in %s mode',
      async (mode) => {
        const schema = v.object({
          name: v.pipe(v.string(), v.nonEmpty('Required')),
        });
        type ParseResult = v.SafeParseResult<typeof schema>;
        let resolveParse: (value: ParseResult) => void;
        const pendingParse = new Promise<ParseResult>((resolve) => {
          resolveParse = resolve;
        });
        const store = createTestStore(schema, {
          validate: mode,
          initialInput: { name: '' },
        });
        store.parse = vi
          .fn()
          .mockReturnValueOnce(pendingParse)
          .mockResolvedValue(v.safeParse(schema, { name: 'John' }));
        const pendingValidation = validate(store);

        setInput(store, { path: ['name'], input: 'John' });
        resolveParse!(v.safeParse(schema, { name: '' }));
        await pendingValidation;

        expect(store.children.name.errors.value).toBeNull();
        expect(store.isValidating.value).toBe(false);
      }
    );

    test('should discard old errors after a field reset', async () => {
      const schema = v.object({
        name: v.pipe(v.string(), v.nonEmpty('Required')),
      });
      type ParseResult = v.SafeParseResult<typeof schema>;
      let resolveParse: (value: ParseResult) => void;
      const pendingParse = new Promise<ParseResult>((resolve) => {
        resolveParse = resolve;
      });
      const store = createTestStore(schema, { initialInput: { name: 'John' } });
      store.parse = () => pendingParse;
      setInput(store, { path: ['name'], input: '' });
      const pendingValidation = validate(store);

      reset(store, { path: ['name'] });
      expect(store.isValidating.value).toBe(false);
      resolveParse!(v.safeParse(schema, { name: '' }));
      await pendingValidation;

      expect(store.children.name.input.value).toBe('John');
      expect(store.children.name.errors.value).toBeNull();
    });

    test.each(['insert', 'remove', 'replace', 'move', 'swap'])(
      'should not apply errors to a different array item after %s',
      async (method) => {
        const schema = v.object({
          names: v.array(v.pipe(v.string(), v.nonEmpty('Required'))),
        });
        type ParseResult = v.SafeParseResult<typeof schema>;
        let resolveParse: (value: ParseResult) => void;
        const pendingParse = new Promise<ParseResult>((resolve) => {
          resolveParse = resolve;
        });
        const store = createTestStore(schema, {
          validate: 'blur',
          initialInput: { names: ['', 'John'] },
        });
        store.parse = () => pendingParse;
        const pendingValidation = validate(store);

        if (method === 'insert') {
          insert(store, { path: ['names'], at: 0, initialInput: 'Jane' });
        } else if (method === 'remove') {
          remove(store, { path: ['names'], at: 0 });
        } else if (method === 'replace') {
          replace(store, { path: ['names'], at: 0, initialInput: 'Jane' });
        } else if (method === 'move') {
          move(store, { path: ['names'], from: 0, to: 1 });
        } else {
          swap(store, { path: ['names'], at: 0, and: 1 });
        }

        expect(store.isValidating.value).toBe(false);
        resolveParse!(v.safeParse(schema, { names: ['', 'John'] }));
        await pendingValidation;

        expect(getInput(store, { path: ['names', 0] })).not.toBe('');
        expect(getErrors(store, { path: ['names', 0] })).toBeNull();
      }
    );

    test.each(['insert', 'remove', 'replace', 'move', 'swap'])(
      'should preserve pending validation when %s is ignored',
      async (method) => {
        const schema = v.object({
          names: v.array(v.pipe(v.string(), v.nonEmpty('Required'))),
        });
        type ParseResult = v.SafeParseResult<typeof schema>;
        let resolveParse: (value: ParseResult) => void;
        const pendingParse = new Promise<ParseResult>((resolve) => {
          resolveParse = resolve;
        });
        const store = createTestStore(schema, {
          initialInput: { names: [''] },
        });
        store.parse = () => pendingParse;
        const pendingValidation = validate(store);

        if (method === 'insert') {
          insert(store, { path: ['names'], at: -1 });
        } else if (method === 'remove') {
          remove(store, { path: ['names'], at: -1 });
        } else if (method === 'replace') {
          replace(store, { path: ['names'], at: -1 });
        } else if (method === 'move') {
          move(store, { path: ['names'], from: 0, to: 0 });
        } else {
          swap(store, { path: ['names'], at: 0, and: 0 });
        }

        expect(store.isValidating.value).toBe(true);
        resolveParse!(v.safeParse(schema, { names: [''] }));
        await pendingValidation;
        expect(getErrors(store, { path: ['names', 0] })).toEqual(['Required']);
      }
    );
  });
});
