import { insert, swap } from '@formisch/methods/vue';
import { mount } from '@vue/test-utils';
import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import { renderHook } from '../../vitest/renderHook.ts';
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

      insert(result.current.form, {
        path: ['items'],
        initialInput: 'c',
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

      swap(result.current.form, { path: ['items'], at: 0, and: 2 });

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

      await vi.waitFor(() => {
        expect(result.current.errors).toEqual(['Need at least 2 items']);
        expect(result.current.isValid).toBe(false);
      });
    });

    test('should re-render the component when items change', async () => {
      const Test = defineComponent({
        setup() {
          const form = useForm({
            schema: v.object({ items: v.array(v.string()) }),
            initialInput: { items: ['a', 'b'] },
          });
          const fieldArray = useFieldArray(form, { path: ['items'] });
          return () =>
            h('div', [
              h(
                'span',
                { 'data-testid': 'count' },
                String(fieldArray.items.length)
              ),
              h(
                'button',
                {
                  onClick: () =>
                    insert(form, { path: ['items'], initialInput: 'c' }),
                },
                'Add'
              ),
            ]);
        },
      });

      const wrapper = mount(Test);
      expect(wrapper.get('[data-testid="count"]').text()).toBe('2');

      await wrapper.get('button').trigger('click');

      await vi.waitFor(() => {
        expect(wrapper.get('[data-testid="count"]').text()).toBe('3');
      });
    });
  });
});
