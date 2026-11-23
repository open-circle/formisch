import { mount } from '@vue/test-utils';
import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import { useForm } from '../../composables/index.ts';
import type { FieldStore } from '../../types/index.ts';
import Field from '../Field/Field.vue';
import Form from './Form.vue';

const schema = v.object({
  email: v.pipe(v.string(), v.nonEmpty('Email is required')),
});

describe('Form', () => {
  test('should render a form element with noValidate, children, and forwarded attributes', () => {
    const Test = defineComponent({
      setup() {
        const form = useForm({ schema });
        return () =>
          h(
            Form,
            {
              of: form,
              onSubmit: vi.fn(),
              'aria-label': 'Test',
              class: 'my-form',
              id: 'signup',
            },
            {
              default: () => h('span', { 'data-testid': 'child' }, 'child'),
            }
          );
      },
    });

    const wrapper = mount(Test);

    const formElement = wrapper.get('form').element;
    expect(formElement.tagName).toBe('FORM');
    expect(formElement.hasAttribute('novalidate')).toBe(true);
    expect(formElement.classList.contains('my-form')).toBe(true);
    expect(formElement.getAttribute('id')).toBe('signup');
    expect(formElement.getAttribute('aria-label')).toBe('Test');
    expect(wrapper.find('[data-testid="child"]').exists()).toBe(true);
  });

  test('should call onSubmit with the validated output when submitted', async () => {
    const onSubmit = vi.fn();

    const Test = defineComponent({
      setup() {
        const form = useForm({
          schema,
          initialInput: { email: 'user@example.com' },
        });
        return () =>
          h(
            Form,
            { of: form, onSubmit, 'aria-label': 'Test' },
            {
              default: () => h('button', { type: 'submit' }, 'Submit'),
            }
          );
      },
    });

    const wrapper = mount(Test);

    await wrapper.get('form').trigger('submit');

    await vi.waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        { email: 'user@example.com' },
        expect.any(Object)
      );
    });
  });

  test('should not call onSubmit when validation fails', async () => {
    const onSubmit = vi.fn();

    const Test = defineComponent({
      setup() {
        const form = useForm({ schema, initialInput: { email: '' } });
        return () =>
          h(
            Form,
            { of: form, onSubmit, 'aria-label': 'Test' },
            {
              default: () => [
                h('span', { 'data-testid': 'valid' }, String(form.isValid)),
                h('button', { type: 'submit' }, 'Submit'),
              ],
            }
          );
      },
    });

    const wrapper = mount(Test);
    const valid = wrapper.get('[data-testid="valid"]');

    expect(valid.text()).toBe('true');

    await wrapper.get('form').trigger('submit');

    await vi.waitFor(() => {
      expect(valid.text()).toBe('false');
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('should render field errors before focusing the first invalid field', async () => {
    const onSubmit = vi.fn();
    let snapshotAtFocus:
      | { ariaInvalid: string | null; errorText: string | null }
      | undefined;

    const Test = defineComponent({
      setup() {
        const form = useForm({ schema, initialInput: { email: '' } });
        return () =>
          h(
            Form,
            { of: form, onSubmit, 'aria-label': 'Test' },
            {
              default: () =>
                h(
                  Field,
                  { of: form, path: ['email'] },
                  {
                    default: (field: FieldStore<typeof schema, ['email']>) => [
                      h('input', {
                        ...field.props,
                        value: field.input ?? '',
                        'aria-invalid': Boolean(field.errors),
                        'aria-errormessage': 'email-error',
                        onFocus: (event: FocusEvent) => {
                          const input = event.target as HTMLInputElement;
                          snapshotAtFocus = {
                            ariaInvalid: input.getAttribute('aria-invalid'),
                            errorText:
                              document.getElementById('email-error')
                                ?.textContent ?? null,
                          };
                        },
                      }),
                      field.errors
                        ? h('div', { id: 'email-error' }, field.errors[0])
                        : null,
                      h('button', { type: 'submit' }, 'Submit'),
                    ],
                  }
                ),
            }
          );
      },
    });

    const wrapper = mount(Test, { attachTo: document.body });

    await wrapper.get('form').trigger('submit');

    await vi.waitFor(() => {
      expect(snapshotAtFocus).toBeDefined();
    });

    expect(snapshotAtFocus).toStrictEqual({
      ariaInvalid: 'true',
      errorText: 'Email is required',
    });
    expect(document.activeElement).toBe(wrapper.get('input').element);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
