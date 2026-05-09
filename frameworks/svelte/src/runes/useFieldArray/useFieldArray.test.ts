import { insert, swap } from '@formisch/methods/svelte';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { flushSync } from 'svelte';
import * as v from 'valibot';
import { describe, expect, test } from 'vitest';
import FieldArrayHost from '../../vitest/FieldArrayHost.svelte';
import { renderHook } from '../../vitest/renderHook.ts';
import { createForm } from '../createForm/createForm.svelte.ts';
import { useFieldArray } from './useFieldArray.svelte.ts';

describe('useFieldArray', () => {
  describe('initialization', () => {
    test('should return field array store with default state and empty items', () => {
      const { result } = renderHook(() => {
        const form = createForm({
          schema: v.object({ items: v.array(v.string()) }),
        });
        return useFieldArray(form, { path: ['items'] });
      });

      const fieldArray = result.current;
      expect(fieldArray.path).toEqual(['items']);
      expect(fieldArray.items).toEqual([]);
      expect(fieldArray.errors).toBe(null);
      expect(fieldArray.isTouched).toBe(false);
      expect(fieldArray.isDirty).toBe(false);
      expect(fieldArray.isValid).toBe(true);
    });

    test('should reflect initialInput from form', () => {
      const { result } = renderHook(() => {
        const form = createForm({
          schema: v.object({ items: v.array(v.string()) }),
          initialInput: { items: ['a', 'b', 'c'] },
        });
        return useFieldArray(form, { path: ['items'] });
      });

      expect(result.current.items).toHaveLength(3);
    });
  });

  describe('reactivity', () => {
    test('should grow items when insert is called', () => {
      const { result } = renderHook(() => {
        const form = createForm({
          schema: v.object({ items: v.array(v.string()) }),
          initialInput: { items: ['a', 'b'] },
        });
        const fieldArray = useFieldArray(form, { path: ['items'] });
        return { form, fieldArray };
      });

      expect(result.current.fieldArray.items).toHaveLength(2);

      insert(result.current.form, { path: ['items'], initialInput: 'c' });
      flushSync();

      expect(result.current.fieldArray.items).toHaveLength(3);
    });

    test('should preserve item keys when swap is called', () => {
      const { result } = renderHook(() => {
        const form = createForm({
          schema: v.object({ items: v.array(v.string()) }),
          initialInput: { items: ['a', 'b', 'c'] },
        });
        const fieldArray = useFieldArray(form, { path: ['items'] });
        return { form, fieldArray };
      });

      const keysBefore = [...result.current.fieldArray.items];

      swap(result.current.form, { path: ['items'], at: 0, and: 2 });
      flushSync();

      const keysAfter = [...result.current.fieldArray.items];
      expect(keysAfter[0]).toBe(keysBefore[2]);
      expect(keysAfter[1]).toBe(keysBefore[1]);
      expect(keysAfter[2]).toBe(keysBefore[0]);
    });

    test('should surface errors and isValid after validation', async () => {
      const { result } = renderHook(() => {
        const form = createForm({
          schema: v.object({
            items: v.pipe(
              v.array(v.string()),
              v.minLength(2, 'Need at least 2 items')
            ),
          }),
          validate: 'initial',
          initialInput: { items: ['only-one'] },
        });
        return useFieldArray(form, { path: ['items'] });
      });

      await waitFor(() => {
        expect(result.current.errors).toEqual(['Need at least 2 items']);
        expect(result.current.isValid).toBe(false);
      });
    });

    test('should re-render the component when items change', async () => {
      render(FieldArrayHost, {
        props: {
          config: {
            schema: v.object({ items: v.array(v.string()) }),
            initialInput: { items: ['a', 'b'] },
          },
          path: ['items'],
        },
      });

      const count = screen.getByTestId('count');
      expect(count).toHaveTextContent('2');

      await fireEvent.click(screen.getByText('Add'));
      flushSync();

      expect(count).toHaveTextContent('3');
    });
  });

  // Note: React's `store stability` test (memoization across re-renders) is
  // omitted — Svelte runes run once per component, so reference identity is
  // structural, not a runtime contract worth asserting.
});
