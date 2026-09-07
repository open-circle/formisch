// @vitest-environment jsdom
import type { SubmitEventHandler, SubmitHandler } from '@formisch/core';
import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import { reset } from '../reset/reset.ts';
import { setInput } from '../setInput/setInput.ts';
import { createTestStore } from '../vitest/index.ts';
import { handleSubmit } from './handleSubmit.ts';

const schema = v.object({ name: v.string() });
type Schema = typeof schema;

describe('handleSubmit', () => {
  test('should call handler with output on valid form', async () => {
    const store = createTestStore(schema, {
      initialInput: { name: 'John' },
    });
    const handler: SubmitEventHandler<Schema> = vi.fn();
    const event = new SubmitEvent('submit');
    vi.spyOn(event, 'preventDefault');

    const submitHandler = handleSubmit(store, handler);
    await submitHandler(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(handler).toHaveBeenCalledWith({ name: 'John' }, event);
  });

  test('should call handler without event when none provided', async () => {
    const store = createTestStore(schema, {
      initialInput: { name: 'John' },
    });
    const handler: SubmitHandler<Schema> = vi.fn();

    const submitHandler = handleSubmit(store, handler) as () => Promise<void>;
    await submitHandler();

    expect(handler).toHaveBeenCalledWith({ name: 'John' }, undefined);
  });

  test('should set isSubmitting during submission', async () => {
    const store = createTestStore(schema, {
      initialInput: { name: 'John' },
    });
    let submittingDuringCall = false;
    const handler: SubmitEventHandler<Schema> = vi.fn(() => {
      submittingDuringCall = store.isSubmitting.value;
    });

    const submitHandler = handleSubmit(store, handler);
    await submitHandler(new SubmitEvent('submit'));

    expect(submittingDuringCall).toBe(true);
    expect(store.isSubmitting.value).toBe(false);
  });

  test('should set isSubmitted after form submission', async () => {
    const store = createTestStore(schema, {
      initialInput: { name: 'John' },
    });
    const handler: SubmitEventHandler<Schema> = vi.fn();

    const submitHandler = handleSubmit(store, handler);
    await submitHandler(new SubmitEvent('submit'));

    expect(store.isSubmitted.value).toBe(true);
  });

  test('should not call handler on invalid form', async () => {
    const store = createTestStore(schema, {
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
    const handler: SubmitEventHandler<Schema> = vi.fn();

    const submitHandler = handleSubmit(store, handler);
    await submitHandler(new SubmitEvent('submit'));

    expect(handler).not.toHaveBeenCalled();
  });

  test('should focus first error field on invalid form', async () => {
    const store = createTestStore(schema, {
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

    const submitHandler = handleSubmit(
      store,
      vi.fn() as SubmitEventHandler<Schema>
    );
    await submitHandler(new SubmitEvent('submit'));

    expect(focusSpy).toHaveBeenCalledOnce();
  });

  test('should set form errors when handler throws', async () => {
    const store = createTestStore(schema, {
      initialInput: { name: 'John' },
    });
    const error = new Error('Submit failed');
    const handler: SubmitEventHandler<Schema> = vi
      .fn()
      .mockRejectedValue(error);

    const submitHandler = handleSubmit(store, handler);
    await submitHandler(new SubmitEvent('submit'));

    expect(store.errors.value).toEqual(['Submit failed']);
  });

  test('should reset isSubmitting after error', async () => {
    const store = createTestStore(schema, {
      initialInput: { name: 'John' },
    });
    const handler: SubmitEventHandler<Schema> = vi
      .fn()
      .mockRejectedValue(new Error('Failed'));

    const submitHandler = handleSubmit(store, handler);
    await submitHandler(new SubmitEvent('submit'));

    expect(store.isSubmitting.value).toBe(false);
  });

  test('should set generic error message for non-Error throws', async () => {
    const store = createTestStore(schema, {
      initialInput: { name: 'John' },
    });
    const handler: SubmitEventHandler<Schema> = vi
      .fn()
      .mockRejectedValue('string error');

    const submitHandler = handleSubmit(store, handler);
    await submitHandler(new SubmitEvent('submit'));

    expect(store.errors.value).toEqual(['An unknown error has occurred.']);
  });

  test('should handle async handler', async () => {
    const store = createTestStore(schema, {
      initialInput: { name: 'John' },
    });
    const handler: SubmitEventHandler<Schema> = vi
      .fn()
      .mockResolvedValue(undefined);

    const submitHandler = handleSubmit(store, handler);
    await submitHandler(new SubmitEvent('submit'));

    expect(handler).toHaveBeenCalledOnce();
    expect(store.isSubmitting.value).toBe(false);
  });

  describe('superseded submissions', () => {
    test.each([
      { action: 'reset', rejects: false },
      { action: 'reset', rejects: true },
      { action: 'setInput', rejects: false },
      { action: 'setInput', rejects: true },
      { action: 'submit', rejects: false },
      { action: 'submit', rejects: true },
    ])(
      'should discard pending validation after $action (rejects: $rejects)',
      async ({ action, rejects }) => {
        type ParseResult = v.SafeParseResult<Schema>;
        let resolveParse: (value: ParseResult) => void;
        let rejectParse: (error: Error) => void;
        const pendingParse = new Promise<ParseResult>((resolve, reject) => {
          resolveParse = resolve;
          rejectParse = reject;
        });
        const store = createTestStore(schema, {
          initialInput: { name: 'John' },
          revalidate: 'blur',
        });
        store.parse = vi
          .fn()
          .mockReturnValueOnce(pendingParse)
          .mockImplementation((input: unknown) =>
            Promise.resolve(v.safeParse(schema, input))
          );
        const oldHandler = vi.fn();
        const pendingSubmission = handleSubmit(store, oldHandler)();

        if (action === 'reset') {
          reset(store);
          expect(store.isSubmitting.value).toBe(false);
        } else if (action === 'setInput') {
          setInput(store, { path: ['name'], input: 'Jane' });
        } else {
          const newHandler = vi.fn();
          await handleSubmit(store, newHandler)();
          expect(newHandler).toHaveBeenCalledOnce();
        }

        if (rejects) {
          rejectParse!(new Error('Old validation failed'));
        } else {
          resolveParse!(v.safeParse(schema, { name: 'John' }));
        }
        await pendingSubmission;

        expect(oldHandler).not.toHaveBeenCalled();
        expect(store.errors.value).toBeNull();
        expect(store.isSubmitting.value).toBe(false);
      }
    );

    test.each([false, true])(
      'should preserve newer submission state when an old handler finishes (reset: %s)',
      async (shouldReset) => {
        let rejectOldHandler: (error: Error) => void;
        const oldResult = new Promise<void>((_, reject) => {
          rejectOldHandler = reject;
        });
        let resolveOldStarted: () => void;
        const oldStarted = new Promise<void>((resolve) => {
          resolveOldStarted = resolve;
        });
        let resolveNewHandler: () => void;
        const newResult = new Promise<void>((resolve) => {
          resolveNewHandler = resolve;
        });
        let resolveNewStarted: () => void;
        const newStarted = new Promise<void>((resolve) => {
          resolveNewStarted = resolve;
        });
        const store = createTestStore(schema, {
          initialInput: { name: 'John' },
        });
        const oldSubmission = handleSubmit(store, () => {
          resolveOldStarted!();
          return oldResult;
        })();
        await oldStarted;

        if (shouldReset) {
          reset(store);
          expect(store.isSubmitting.value).toBe(false);
        }
        const newSubmission = handleSubmit(store, () => {
          resolveNewStarted!();
          return newResult;
        })();
        await newStarted;

        rejectOldHandler!(new Error('Old request failed'));
        await oldSubmission;
        expect(store.isSubmitting.value).toBe(true);
        expect(store.errors.value).toBeNull();

        resolveNewHandler!();
        await newSubmission;
        expect(store.isSubmitting.value).toBe(false);
      }
    );

    test.each(['setInput', 'reset'])(
      'should handle late handler errors after %s',
      async (action) => {
        let rejectHandler: (error: Error) => void;
        const pendingResult = new Promise<void>((_, reject) => {
          rejectHandler = reject;
        });
        let resolveStarted: () => void;
        const started = new Promise<void>((resolve) => {
          resolveStarted = resolve;
        });
        const store = createTestStore(schema, {
          initialInput: { name: 'John' },
        });
        const submission = handleSubmit(store, () => {
          resolveStarted!();
          return pendingResult;
        })();
        await started;

        if (action === 'setInput') {
          setInput(store, { path: ['name'], input: 'Jane' });
        } else {
          reset(store);
        }
        rejectHandler!(new Error('Request failed'));
        await submission;
        expect(store.errors.value).toEqual(
          action === 'setInput' ? ['Request failed'] : null
        );
        expect(store.isSubmitting.value).toBe(false);
      }
    );
  });
});
