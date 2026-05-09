import { mount } from '@vue/test-utils';
import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import Form from '../../components/Form/Form.vue';
import { renderHook } from '../../vitest/renderHook.ts';
import { useForm } from '../useForm/index.ts';
import { useField } from './useField.ts';

describe('useField', () => {
  describe('initialization', () => {
    test('should return field store with default state and props', () => {
      const { result } = renderHook(() => {
        const form = useForm({ schema: v.object({ name: v.string() }) });
        return useField(form, { path: ['name'] });
      });

      const field = result.current;
      expect(field.path).toEqual(['name']);
      expect(field.input).toBe(undefined);
      expect(field.errors).toBe(null);
      expect(field.isTouched).toBe(false);
      expect(field.isDirty).toBe(false);
      expect(field.isValid).toBe(true);
      expect(field.props.name).toBe('["name"]');
      expect(field.props.autofocus).toBe(false);
    });

    test('should reflect initialInput from form', () => {
      const { result } = renderHook(() => {
        const form = useForm({
          schema: v.object({ name: v.string() }),
          initialInput: { name: 'John' },
        });
        return useField(form, { path: ['name'] });
      });

      expect(result.current.input).toBe('John');
    });
  });

  describe('input updates', () => {
    test('should update input and isDirty via DOM input event (input setter)', async () => {
      const Test = defineComponent({
        setup() {
          const form = useForm({
            schema: v.object({ name: v.string() }),
            initialInput: { name: 'initial' },
          });
          const field = useField(form, { path: ['name'] });
          return () =>
            h('div', [
              h('input', {
                'data-testid': 'input',
                ...field.props,
                value: field.input ?? '',
                onInput: (e: Event) => {
                  field.input = (e.target as HTMLInputElement).value;
                },
              }),
              h('span', { 'data-testid': 'dirty' }, String(field.isDirty)),
            ]);
        },
      });

      const wrapper = mount(Test);
      const input = wrapper.get<HTMLInputElement>('[data-testid="input"]');
      const dirty = wrapper.get('[data-testid="dirty"]');
      expect(input.element.value).toBe('initial');
      expect(dirty.text()).toBe('false');

      await input.setValue('changed');

      expect(input.element.value).toBe('changed');
      expect(dirty.text()).toBe('true');
    });

    test('should update input and trigger validation via input setter', async () => {
      const { result } = renderHook(() => {
        const form = useForm({
          schema: v.object({
            email: v.pipe(v.string(), v.email('Invalid email')),
          }),
          validate: 'input',
          initialInput: { email: '' },
        });
        return useField(form, { path: ['email'] });
      });

      result.current.input = 'not-an-email';

      expect(result.current.input).toBe('not-an-email');

      await vi.waitFor(() => {
        expect(result.current.errors).toEqual(['Invalid email']);
        expect(result.current.isValid).toBe(false);
      });
    });
  });

  describe('validation modes', () => {
    test('should run validate:"touch" on focus and flip isTouched', async () => {
      const Test = defineComponent({
        setup() {
          const form = useForm({
            schema: v.object({
              email: v.pipe(v.string(), v.nonEmpty('Required')),
            }),
            validate: 'touch',
            initialInput: { email: '' },
          });
          const field = useField(form, { path: ['email'] });
          return () =>
            h('div', [
              h('input', { 'data-testid': 'input', ...field.props }),
              h('span', { 'data-testid': 'touched' }, String(field.isTouched)),
              h('span', { 'data-testid': 'valid' }, String(field.isValid)),
            ]);
        },
      });

      const wrapper = mount(Test);
      const touched = wrapper.get('[data-testid="touched"]');
      const valid = wrapper.get('[data-testid="valid"]');
      expect(touched.text()).toBe('false');
      expect(valid.text()).toBe('true');

      await wrapper.get('[data-testid="input"]').trigger('focus');

      await vi.waitFor(() => {
        expect(touched.text()).toBe('true');
        expect(valid.text()).toBe('false');
      });
    });

    // Vue, Preact, Solid, and Svelte fire validation through a separate
    // `onChange`/`onchange` handler in `field.props`; React folds it into
    // the same handler that updates the input value.
    test('should run validate:"change" on change event and surface errors', async () => {
      const Test = defineComponent({
        setup() {
          const form = useForm({
            schema: v.object({
              email: v.pipe(v.string(), v.email('Invalid email')),
            }),
            validate: 'change',
            initialInput: { email: 'invalid' },
          });
          const field = useField(form, { path: ['email'] });
          return () =>
            h('div', [
              h('input', {
                'data-testid': 'input',
                ...field.props,
                value: field.input ?? '',
              }),
              h('span', { 'data-testid': 'valid' }, String(field.isValid)),
            ]);
        },
      });

      const wrapper = mount(Test);
      const valid = wrapper.get('[data-testid="valid"]');
      expect(valid.text()).toBe('true');

      await wrapper.get('[data-testid="input"]').trigger('change');

      await vi.waitFor(() => {
        expect(valid.text()).toBe('false');
      });
    });

    test('should run validate:"blur" on blur and surface errors', async () => {
      const Test = defineComponent({
        setup() {
          const form = useForm({
            schema: v.object({
              email: v.pipe(v.string(), v.email('Invalid email')),
            }),
            validate: 'blur',
            initialInput: { email: 'invalid' },
          });
          const field = useField(form, { path: ['email'] });
          return () =>
            h('div', [
              h('input', {
                'data-testid': 'input',
                ...field.props,
                value: field.input ?? '',
              }),
              h('span', { 'data-testid': 'valid' }, String(field.isValid)),
            ]);
        },
      });

      const wrapper = mount(Test);
      const valid = wrapper.get('[data-testid="valid"]');
      expect(valid.text()).toBe('true');

      await wrapper.get('[data-testid="input"]').trigger('blur');

      await vi.waitFor(() => {
        expect(valid.text()).toBe('false');
      });
    });
  });

  describe('element registration', () => {
    test('should focus the registered element when validation fails on submit', async () => {
      const Test = defineComponent({
        setup() {
          const form = useForm({
            schema: v.object({
              email: v.pipe(v.string(), v.nonEmpty('Required')),
            }),
            initialInput: { email: '' },
          });
          const field = useField(form, { path: ['email'] });
          return () =>
            h(
              Form,
              { of: form, onSubmit: vi.fn(), 'aria-label': 'Test' },
              {
                default: () => [
                  h('input', {
                    'data-testid': 'input',
                    ...field.props,
                    value: field.input ?? '',
                  }),
                  h('button', { type: 'submit' }, 'Submit'),
                ],
              }
            );
        },
      });

      const wrapper = mount(Test, { attachTo: document.body });
      const input = wrapper.get<HTMLInputElement>('[data-testid="input"]');
      expect(document.activeElement).not.toBe(input.element);

      await wrapper.get('form').trigger('submit');

      await vi.waitFor(() => {
        expect(document.activeElement).toBe(input.element);
      });
    });

    test('should unmount cleanly when the registered element is removed', () => {
      const Test = defineComponent({
        setup() {
          const form = useForm({ schema: v.object({ name: v.string() }) });
          const field = useField(form, { path: ['name'] });
          return () => h('input', { 'data-testid': 'input', ...field.props });
        },
      });

      const wrapper = mount(Test, { attachTo: document.body });
      expect(document.querySelector('[data-testid="input"]')).not.toBeNull();

      wrapper.unmount();

      expect(document.querySelector('[data-testid="input"]')).toBeNull();
    });
  });
});
