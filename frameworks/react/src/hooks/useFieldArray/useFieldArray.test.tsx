import { insert, remove, swap } from '@formisch/methods/vanilla';
import { act, renderHook, waitFor } from '@testing-library/react';
import * as v from 'valibot';
import { describe, expect, test } from 'vitest';
import { useForm } from '../useForm/index.ts';
import { useFieldArray } from './useFieldArray.ts';

describe('useFieldArray', () => {
  describe('initialization', () => {
    test('should create field array store with correct path', () => {
      const schema = v.object({ items: v.array(v.string()) });

      const { result } = renderHook(() => {
        const form = useForm({ schema });
        return useFieldArray(form, { path: ['items'] });
      });

      expect(result.current.path).toEqual(['items']);
    });

    test('should have empty items for uninitialized array', () => {
      const schema = v.object({ items: v.array(v.string()) });

      const { result } = renderHook(() => {
        const form = useForm({ schema });
        return useFieldArray(form, { path: ['items'] });
      });

      expect(result.current.items).toEqual([]);
    });

    test('should have items when initial input is provided', () => {
      const schema = v.object({ items: v.array(v.string()) });

      const { result } = renderHook(() => {
        const form = useForm({
          schema,
          initialInput: { items: ['a', 'b', 'c'] },
        });
        return useFieldArray(form, { path: ['items'] });
      });

      expect(result.current.items).toHaveLength(3);
    });
  });

  describe('field array state', () => {
    test('should have default state values', () => {
      const schema = v.object({ tags: v.array(v.string()) });

      const { result } = renderHook(() => {
        const form = useForm({ schema });
        return useFieldArray(form, { path: ['tags'] });
      });

      expect(result.current.errors).toBe(null);
      expect(result.current.isTouched).toBe(false);
      expect(result.current.isDirty).toBe(false);
      expect(result.current.isValid).toBe(true);
    });

    test('should show errors after validation', async () => {
      const schema = v.object({
        items: v.pipe(
          v.array(v.string()),
          v.minLength(2, 'Need at least 2 items')
        ),
      });

      const { result } = renderHook(() => {
        const form = useForm({
          schema,
          validate: 'initial',
          initialInput: { items: ['one'] },
        });
        return useFieldArray(form, { path: ['items'] });
      });

      await waitFor(() => {
        expect(result.current.errors).not.toBe(null);
        expect(result.current.isValid).toBe(false);
      });
    });
  });

  describe('nested arrays', () => {
    test('should handle nested array path', () => {
      const schema = v.object({
        users: v.array(
          v.object({
            tags: v.array(v.string()),
          })
        ),
      });

      const { result } = renderHook(() => {
        const form = useForm({
          schema,
          initialInput: {
            users: [{ tags: ['tag1', 'tag2'] }],
          },
        });
        return useFieldArray(form, { path: ['users', 0, 'tags'] });
      });

      expect(result.current.path).toEqual(['users', 0, 'tags']);
      expect(result.current.items).toHaveLength(2);
    });
  });

  describe('array of objects', () => {
    test('should handle array of objects', () => {
      const schema = v.object({
        contacts: v.array(
          v.object({
            name: v.string(),
            email: v.string(),
          })
        ),
      });

      const { result } = renderHook(() => {
        const form = useForm({
          schema,
          initialInput: {
            contacts: [
              { name: 'John', email: 'john@example.com' },
              { name: 'Jane', email: 'jane@example.com' },
            ],
          },
        });
        return useFieldArray(form, { path: ['contacts'] });
      });

      expect(result.current.items).toHaveLength(2);
    });
  });

  describe('store stability', () => {
    test('should return stable store reference across renders', () => {
      const schema = v.object({ items: v.array(v.string()) });

      const { result, rerender } = renderHook(() => {
        const form = useForm({ schema });
        return useFieldArray(form, { path: ['items'] });
      });

      const firstStore = result.current;
      rerender();
      const secondStore = result.current;

      // Path should be the same reference
      expect(firstStore.path).toEqual(secondStore.path);
    });
  });

  describe('array operations reactivity', () => {
    test('should update items when insert is called', () => {
      const schema = v.object({ items: v.array(v.string()) });

      const { result } = renderHook(() => {
        const form = useForm({
          schema,
          initialInput: { items: ['a', 'b'] },
        });
        const fieldArray = useFieldArray(form, { path: ['items'] });
        return { form, fieldArray };
      });

      expect(result.current.fieldArray.items).toHaveLength(2);

      act(() => {
        insert(result.current.form, {
          path: ['items'],
          initialInput: 'c',
        });
      });

      expect(result.current.fieldArray.items).toHaveLength(3);
    });

    test('should update items when remove is called', () => {
      const schema = v.object({ items: v.array(v.string()) });

      const { result } = renderHook(() => {
        const form = useForm({
          schema,
          initialInput: { items: ['a', 'b', 'c'] },
        });
        const fieldArray = useFieldArray(form, { path: ['items'] });
        return { form, fieldArray };
      });

      expect(result.current.fieldArray.items).toHaveLength(3);

      act(() => {
        remove(result.current.form, {
          path: ['items'],
          at: 1,
        });
      });

      expect(result.current.fieldArray.items).toHaveLength(2);
    });

    test('should maintain stable item keys after swap', () => {
      const schema = v.object({ items: v.array(v.string()) });

      const { result } = renderHook(() => {
        const form = useForm({
          schema,
          initialInput: { items: ['a', 'b', 'c'] },
        });
        const fieldArray = useFieldArray(form, { path: ['items'] });
        return { form, fieldArray };
      });

      const keysBefore = result.current.fieldArray.items.map((item) => item.id);

      act(() => {
        swap(result.current.form, {
          path: ['items'],
          at: 0,
          and: 2,
        });
      });

      const keysAfter = result.current.fieldArray.items.map((item) => item.id);

      // Keys should be swapped, not regenerated
      expect(keysAfter[0]).toBe(keysBefore[2]);
      expect(keysAfter[2]).toBe(keysBefore[0]);
      expect(keysAfter[1]).toBe(keysBefore[1]);
    });
  });
});
