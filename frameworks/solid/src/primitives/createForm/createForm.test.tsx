import { validate } from '@formisch/methods/solid';
import {
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@solidjs/testing-library';
import type { JSX } from '@solidjs/web';
import { createEffect } from 'solid-js';
import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import { useField } from '../useField/index.ts';
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
    test('should allow immediate writes inside an owned component scope', () => {
      function Test(): JSX.Element {
        const form = createForm({
          schema: v.object({ name: v.string() }),
          initialInput: { name: 'initial' },
        });
        const field = useField(form, { path: ['name'] });
        field.onInput('owned');
        return <span data-testid="owned">{field.input}</span>;
      }
      render(() => <Test />);
      expect(screen.getByTestId('owned')).toHaveTextContent('owned');
    });

    test('should expose immediate field state while batching reactive updates', async () => {
      const observed: string[] = [];
      const { result } = renderHook(() => {
        const form = createForm({
          schema: v.object({ name: v.string() }),
          initialInput: { name: 'initial' },
        });
        const field = useField(form, { path: ['name'] });
        createEffect(
          () => field.input,
          (input) => {
            observed.push(input ?? '');
          }
        );
        return { form, field };
      });
      expect(observed).toEqual(['initial']);
      result.field.onInput('intermediate');
      expect(result.field.input).toBe('intermediate');
      expect(result.field.isDirty).toBe(true);
      expect(result.form.isDirty).toBe(true);
      expect(result.form.isEdited).toBe(true);
      result.field.onInput('final');
      expect(result.field.input).toBe('final');
      expect(observed).toEqual(['initial']);
      await vi.waitFor(() => expect(observed).toEqual(['initial', 'final']));
    });

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
