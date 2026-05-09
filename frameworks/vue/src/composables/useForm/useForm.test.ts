import { validate } from '@formisch/methods/vue';
import { mount } from '@vue/test-utils';
import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import { renderHook } from '../../vitest/renderHook.ts';
import { useForm } from './useForm.ts';

describe('useForm', () => {
  describe('initialization', () => {
    test('should return form store with default state', () => {
      const { result } = renderHook(() =>
        useForm({ schema: v.object({ name: v.string() }) })
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
        useForm({
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
        useForm({
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
    test('should re-render the component when form state changes', async () => {
      const Test = defineComponent({
        setup() {
          const form = useForm({
            schema: v.object({
              email: v.pipe(v.string(), v.email('Invalid email')),
            }),
            initialInput: { email: 'invalid' },
          });
          return () =>
            h('div', [
              h('span', { 'data-testid': 'valid' }, String(form.isValid)),
              h('button', { onClick: () => validate(form) }, 'Validate'),
            ]);
        },
      });

      const wrapper = mount(Test);
      expect(wrapper.get('[data-testid="valid"]').text()).toBe('true');

      await wrapper.get('button').trigger('click');

      await vi.waitFor(() => {
        expect(wrapper.get('[data-testid="valid"]').text()).toBe('false');
      });
    });
  });
});
