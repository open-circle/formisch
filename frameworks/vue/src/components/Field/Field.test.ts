import { mount } from '@vue/test-utils';
import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import { useForm } from '../../composables/index.ts';
import type { FieldStore } from '../../types/index.ts';
import Field from './Field.vue';

const schema = v.object({ name: v.string() });
type FormSchema = typeof schema;

describe('Field', () => {
  test('should render markup returned from default slot', () => {
    const Test = defineComponent({
      setup() {
        const form = useForm({ schema });
        return () =>
          h(
            Field,
            { of: form, path: ['name'] },
            {
              default: () => h('span', { 'data-testid': 'content' }, 'hello'),
            }
          );
      },
    });

    const wrapper = mount(Test);
    expect(wrapper.get('[data-testid="content"]').text()).toBe('hello');
  });

  test('should invoke default slot with the field store', () => {
    const slotFn = vi.fn((field: FieldStore<FormSchema, ['name']>) => {
      void field;
      return h('span');
    });

    const Test = defineComponent({
      setup() {
        const form = useForm({ schema, initialInput: { name: 'John' } });
        return () =>
          h(Field, { of: form, path: ['name'] }, { default: slotFn });
      },
    });

    mount(Test);

    expect(slotFn).toHaveBeenCalled();
    const field = slotFn.mock.lastCall![0];
    expect(field.path).toEqual(['name']);
    expect(field.input).toBe('John');
    expect(field.props.name).toBe('["name"]');
    expect(typeof field.props.onChange).toBe('function');
  });

  test('should re-render when the field store updates', async () => {
    const Test = defineComponent({
      setup() {
        const form = useForm({ schema, initialInput: { name: 'initial' } });
        return () =>
          h(
            Field,
            { of: form, path: ['name'] },
            {
              default: (field: FieldStore<FormSchema, ['name']>) => [
                h('input', {
                  'data-testid': 'input',
                  ...field.props,
                  value: field.input ?? '',
                  onInput: (e: Event) => {
                    field.input = (e.target as HTMLInputElement).value;
                  },
                }),
                h('span', { 'data-testid': 'dirty' }, String(field.isDirty)),
              ],
            }
          );
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
});
