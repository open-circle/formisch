import { validate } from '@formisch/methods/svelte';
import { flushSync } from 'svelte';
import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import { renderHook } from '../../vitest/renderHook.ts';
import { createForm } from './createForm.svelte.ts';

describe('createForm', () => {
  describe('initialization', () => {
    test('should return form store with default state', () => {
      const { result } = renderHook(() =>
        createForm({ schema: v.object({ name: v.string() }) })
      );

      const form = result.current;
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

      await vi.waitFor(() => {
        expect(result.current.isValid).toBe(false);
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

      expect(result.current.isValidating).toBe(false);
      expect(result.current.isValid).toBe(true);
    });
  });

  describe('reactivity', () => {
    test('should re-derive form state when validation runs', async () => {
      const { result } = renderHook(() =>
        createForm({
          schema: v.object({
            email: v.pipe(v.string(), v.email('Invalid email')),
          }),
          initialInput: { email: 'invalid' },
        })
      );

      expect(result.current.isValid).toBe(true);

      await validate(result.current);
      flushSync();

      expect(result.current.isValid).toBe(false);
    });
  });

  // Note: React's `store stability` test (memoization across re-renders) is
  // omitted — Svelte runes run once per component, so reference identity is
  // structural, not a runtime contract worth asserting.
});
