import { insert, swap } from '@formisch/methods/honox';
import { fireEvent, screen, waitFor } from '@testing-library/dom';
import { flushSync } from 'hono/jsx/dom';
import type { JSX } from 'hono/jsx/jsx-runtime';
import * as v from 'valibot';
import { describe, expect, test } from 'vitest';
import { renderHono } from '../../vitest/render.tsx';
import { renderHook } from '../../vitest/renderHook.tsx';
import { useForm } from '../useForm/index.ts';
import { useFieldArray } from './useFieldArray.ts';

describe('useFieldArray', () => {
  describe('initialization', () => {
    test('should return field array store with default state and empty items', () => {
      const { result } = renderHook(() => {
        const form = useForm({
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
        const form = useForm({
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
        const form = useForm({
          schema: v.object({ items: v.array(v.string()) }),
          initialInput: { items: ['a', 'b'] },
        });
        const fieldArray = useFieldArray(form, { path: ['items'] });
        return { form, fieldArray };
      });

      expect(result.current.fieldArray.items).toHaveLength(2);

      flushSync(() => {
        insert(result.current.form, {
          path: ['items'],
          initialInput: 'c',
        });
      });

      expect(result.current.fieldArray.items).toHaveLength(3);
    });

    test('should preserve item keys when swap is called', () => {
      const { result } = renderHook(() => {
        const form = useForm({
          schema: v.object({ items: v.array(v.string()) }),
          initialInput: { items: ['a', 'b', 'c'] },
        });
        const fieldArray = useFieldArray(form, { path: ['items'] });
        return { form, fieldArray };
      });

      const keysBefore = [...result.current.fieldArray.items];

      flushSync(() => {
        swap(result.current.form, { path: ['items'], at: 0, and: 2 });
      });

      const keysAfter = [...result.current.fieldArray.items];
      expect(keysAfter[0]).toBe(keysBefore[2]);
      expect(keysAfter[1]).toBe(keysBefore[1]);
      expect(keysAfter[2]).toBe(keysBefore[0]);
    });

    test('should surface errors and isValid after validation', async () => {
      const { result } = renderHook(() => {
        const form = useForm({
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
      function Test(): JSX.Element {
        const form = useForm({
          schema: v.object({ items: v.array(v.string()) }),
          initialInput: { items: ['a', 'b'] },
        });
        const fieldArray = useFieldArray(form, { path: ['items'] });
        return (
          <div>
            <span data-testid="count">{fieldArray.items.length}</span>
            <button
              onClick={() =>
                insert(form, { path: ['items'], initialInput: 'c' })
              }
            >
              Add
            </button>
          </div>
        );
      }

      renderHono(<Test />);

      const count = screen.getByTestId('count');
      expect(count).toHaveTextContent('2');

      flushSync(() => {
        fireEvent.click(screen.getByText('Add'));
      });

      await waitFor(() => {
        expect(count).toHaveTextContent('3');
      });
    });
  });

  describe('store stability', () => {
    test('should return memoized store reference across re-renders', () => {
      const { result, rerender } = renderHook(() => {
        const form = useForm({
          schema: v.object({ items: v.array(v.string()) }),
        });
        return useFieldArray(form, { path: ['items'] });
      });

      const first = result.current;
      rerender();
      expect(result.current).toBe(first);
    });
  });
});
