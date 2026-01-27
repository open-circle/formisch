import { renderHook, waitFor } from '@testing-library/react';
import * as v from 'valibot';
import { describe, expect, test } from 'vitest';
import { useForm } from './useForm.ts';

describe('useForm', () => {
  describe('initialization', () => {
    test('should create form store with default values', () => {
      const schema = v.object({ name: v.string() });
      const { result } = renderHook(() => useForm({ schema }));

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isSubmitted).toBe(false);
      expect(result.current.isValidating).toBe(false);
      expect(result.current.isTouched).toBe(false);
      expect(result.current.isDirty).toBe(false);
      expect(result.current.isValid).toBe(true);
      expect(result.current.errors).toBe(null);
    });

    test('should accept initial input values', () => {
      const schema = v.object({ email: v.string() });
      const { result } = renderHook(() =>
        useForm({
          schema,
          initialInput: { email: 'test@example.com' },
        })
      );

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.errors).toBe(null);
    });

    test('should accept validation mode configuration', () => {
      const schema = v.object({ name: v.string() });
      const { result } = renderHook(() =>
        useForm({
          schema,
          validate: 'blur',
          revalidate: 'input',
        })
      );

      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('initial validation', () => {
    test('should run initial validation when validate is set to initial', async () => {
      const schema = v.object({
        email: v.pipe(v.string(), v.email('Invalid email')),
      });

      const { result } = renderHook(() =>
        useForm({
          schema,
          validate: 'initial',
          initialInput: { email: 'invalid' },
        })
      );

      await waitFor(() => {
        expect(result.current.isValid).toBe(false);
      });
    });

    test('should not run validation on initial render when validate is not initial', () => {
      const schema = v.object({
        email: v.pipe(v.string(), v.email('Invalid email')),
      });

      const { result } = renderHook(() =>
        useForm({
          schema,
          validate: 'blur',
          initialInput: { email: 'invalid' },
        })
      );

      expect(result.current.isValidating).toBe(false);
      expect(result.current.isValid).toBe(true);
    });
  });

  describe('store stability', () => {
    test('should return stable store reference across renders', () => {
      const schema = v.object({ name: v.string() });
      const { result, rerender } = renderHook(() => useForm({ schema }));

      const firstStore = result.current;
      rerender();
      const secondStore = result.current;

      expect(firstStore).toBe(secondStore);
    });
  });

  describe('nested schema', () => {
    test('should handle nested object schema', () => {
      const schema = v.object({
        user: v.object({
          name: v.string(),
          email: v.string(),
        }),
      });

      const { result } = renderHook(() =>
        useForm({
          schema,
          initialInput: {
            user: { name: 'John', email: 'john@example.com' },
          },
        })
      );

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.errors).toBe(null);
    });

    test('should handle array schema', () => {
      const schema = v.object({
        items: v.array(v.string()),
      });

      const { result } = renderHook(() =>
        useForm({
          schema,
          initialInput: { items: ['a', 'b', 'c'] },
        })
      );

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.errors).toBe(null);
    });
  });
});
