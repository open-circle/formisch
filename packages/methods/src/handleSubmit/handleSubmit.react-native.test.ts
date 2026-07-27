import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import { createTestStore } from '../vitest/index.ts';
import { handleSubmit } from './handleSubmit.react-native.ts';

const schema = v.object({ name: v.string() });

describe('handleSubmit (react-native)', () => {
  test('should call handler with only the validated output', async () => {
    const store = createTestStore(schema, {
      initialInput: { name: 'John' },
    });
    const handler = vi.fn();

    const submitHandler = handleSubmit(store, handler);
    await submitHandler();

    // Unlike the DOM variants, no event is forwarded to the handler
    expect(handler).toHaveBeenCalledExactlyOnceWith({ name: 'John' });
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
        },
      ],
    });
    const handler = vi.fn();

    const submitHandler = handleSubmit(store, handler);
    await submitHandler();

    expect(handler).not.toHaveBeenCalled();
  });

  test('should set isSubmitted after form submission', async () => {
    const store = createTestStore(schema, {
      initialInput: { name: 'John' },
    });
    const handler = vi.fn();

    const submitHandler = handleSubmit(store, handler);
    await submitHandler();

    expect(store.isSubmitted.value).toBe(true);
  });
});
