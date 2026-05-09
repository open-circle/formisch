import { insert, swap } from '@formisch/methods/solid';
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
import { createForm } from '../createForm/index.ts';
import { useFieldArray } from './useFieldArray.ts';

describe('useFieldArray', () => {
  describe('initialization', () => {
    test('should return field array store with default state and empty items', () => {
      const { result } = renderHook(() => {
        const form = createForm({
          schema: v.object({ items: v.array(v.string()) }),
        });
        return useFieldArray(form, { path: ['items'] });
      });

      const fieldArray = result;
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

      expect(result.items).toHaveLength(3);
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

      expect(result.fieldArray.items).toHaveLength(2);

      insert(result.form, {
        path: ['items'],
        initialInput: 'c',
      });

      expect(result.fieldArray.items).toHaveLength(3);
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

      const keysBefore = [...result.fieldArray.items];

      swap(result.form, { path: ['items'], at: 0, and: 2 });

      const keysAfter = [...result.fieldArray.items];
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
        expect(result.errors).toEqual(['Need at least 2 items']);
        expect(result.isValid).toBe(false);
      });
    });

    test('should re-render the component when items change', async () => {
      function Test(): JSX.Element {
        const form = createForm({
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

      render(() => <Test />);

      const count = screen.getByTestId('count');
      expect(count).toHaveTextContent('2');

      fireEvent.click(screen.getByText('Add'));

      await waitFor(() => {
        expect(count).toHaveTextContent('3');
      });
    });
  });

  // Note: React's `store stability` test (memoization across re-renders) is
  // omitted — Solid primitives run once per reactive root, so reference
  // identity is structural, not a runtime contract worth asserting.
});
