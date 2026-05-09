import { validate } from '@formisch/methods/solid';
import {
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@solidjs/testing-library';
import type { JSX } from 'solid-js';
import * as v from 'valibot';
import { describe, expect, test } from 'vitest';
import { createForm } from './createForm.ts';

describe('createForm', () => {
  describe('initialization', () => {
    test('should return form store with default state', () => {
      const { result } = renderHook(() =>
        createForm({ schema: v.object({ name: v.string() }) })
      );

      const form = result;
      expect(form.isSubmitting).toBe(false);
      expect(form.isSubmitted).toBe(false);
      expect(form.isValidating).toBe(false);
      expect(form.isTouched).toBe(false);
      expect(form.isDirty).toBe(false);
      expect(form.isValid).toBe(true);
      expect(form.errors).toBe(null);
    });
  });

  describe('initial validation', () => {
    test('should run validation on mount when validate is "initial"', async () => {
      const { result } = renderHook(() =>
        createForm({
          schema: v.object({
            email: v.pipe(v.string(), v.email('Invalid email')),
          }),
          validate: 'initial',
          initialInput: { email: 'invalid' },
        })
      );

      await waitFor(() => {
        expect(result.isValid).toBe(false);
      });
    });

    test('should not run validation on mount otherwise', () => {
      const { result } = renderHook(() =>
        createForm({
          schema: v.object({
            email: v.pipe(v.string(), v.email('Invalid email')),
          }),
          validate: 'blur',
          initialInput: { email: 'invalid' },
        })
      );

      expect(result.isValidating).toBe(false);
      expect(result.isValid).toBe(true);
    });
  });

  describe('reactivity', () => {
    test('should re-render the component when form state changes', async () => {
      function Test(): JSX.Element {
        const form = createForm({
          schema: v.object({
            email: v.pipe(v.string(), v.email('Invalid email')),
          }),
          initialInput: { email: 'invalid' },
        });
        return (
          <div>
            <span data-testid="valid">{String(form.isValid)}</span>
            <button onClick={() => validate(form)}>Validate</button>
          </div>
        );
      }

      render(() => <Test />);

      const valid = screen.getByTestId('valid');
      expect(valid).toHaveTextContent('true');

      fireEvent.click(screen.getByText('Validate'));

      await waitFor(() => {
        expect(valid).toHaveTextContent('false');
      });
    });
  });

  // Note: React's `store stability` test (memoization across re-renders) does
  // not apply here — Solid primitives run once per reactive root, so reference
  // identity is a structural property, not a runtime contract worth asserting.
});
