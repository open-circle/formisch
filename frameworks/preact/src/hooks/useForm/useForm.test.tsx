import { validate } from '@formisch/methods/preact';
import {
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/preact';
import type { JSX } from 'preact';
import * as v from 'valibot';
import { describe, expect, test } from 'vitest';
import { useForm } from './useForm.ts';

describe('useForm', () => {
  describe('initialization', () => {
    test('should return form store with default state', () => {
      const { result } = renderHook(() =>
        useForm({ schema: v.object({ name: v.string() }) })
      );

      const form = result.current;
      expect(form.isSubmitting.value).toBe(false);
      expect(form.isSubmitted.value).toBe(false);
      expect(form.isValidating.value).toBe(false);
      expect(form.isTouched.value).toBe(false);
      expect(form.isDirty.value).toBe(false);
      expect(form.isValid.value).toBe(true);
      expect(form.errors.value).toBe(null);
    });
  });

  describe('initial validation', () => {
    test('should run validation on mount when validate is "initial"', async () => {
      const { result } = renderHook(() =>
        useForm({
          schema: v.object({
            email: v.pipe(v.string(), v.email('Invalid email')),
          }),
          validate: 'initial',
          initialInput: { email: 'invalid' },
        })
      );

      await waitFor(() => {
        expect(result.current.isValid.value).toBe(false);
      });
    });

    test('should not run validation on mount otherwise', () => {
      const { result } = renderHook(() =>
        useForm({
          schema: v.object({
            email: v.pipe(v.string(), v.email('Invalid email')),
          }),
          validate: 'blur',
          initialInput: { email: 'invalid' },
        })
      );

      expect(result.current.isValidating.value).toBe(false);
      expect(result.current.isValid.value).toBe(true);
    });
  });

  describe('reactivity', () => {
    test('should re-render the component when form state changes', async () => {
      function Test(): JSX.Element {
        const form = useForm({
          schema: v.object({
            email: v.pipe(v.string(), v.email('Invalid email')),
          }),
          initialInput: { email: 'invalid' },
        });
        return (
          <div>
            <span data-testid="valid">{String(form.isValid.value)}</span>
            <button onClick={() => validate(form)}>Validate</button>
          </div>
        );
      }

      render(<Test />);

      const valid = screen.getByTestId('valid');
      expect(valid).toHaveTextContent('true');

      fireEvent.click(screen.getByText('Validate'));

      await waitFor(() => {
        expect(valid).toHaveTextContent('false');
      });
    });
  });

  describe('store stability', () => {
    test('should return memoized store reference across re-renders', () => {
      const { result, rerender } = renderHook(() =>
        useForm({ schema: v.object({ name: v.string() }) })
      );

      const first = result.current;
      rerender();
      expect(result.current).toBe(first);
    });
  });
});
