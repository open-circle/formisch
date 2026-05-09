import { insert } from '@formisch/methods/vue';
import { mount } from '@vue/test-utils';
import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import { useForm } from '../../composables/index.ts';
import type { FieldArrayStore } from '../../types/index.ts';
import FieldArray from './FieldArray.vue';

const schema = v.object({ items: v.array(v.string()) });
type Schema = typeof schema;

describe('FieldArray', () => {
  test('should render markup returned from default slot', () => {
    const Test = defineComponent({
      setup() {
        const form = useForm({ schema });
        return () =>
          h(
            FieldArray,
            { of: form, path: ['items'] },
            {
              default: () => h('span', { 'data-testid': 'content' }, 'hello'),
            }
          );
      },
    });

    const wrapper = mount(Test);
    expect(wrapper.get('[data-testid="content"]').text()).toBe('hello');
  });

  test('should invoke default slot with the field array store', () => {
    const slotFn = vi.fn((field: FieldArrayStore<Schema, ['items']>) => {
      void field;
      return h('span');
    });

    const Test = defineComponent({
      setup() {
        const form = useForm({ schema, initialInput: { items: ['a', 'b'] } });
        return () =>
          h(FieldArray, { of: form, path: ['items'] }, { default: slotFn });
      },
    });

    mount(Test);

    expect(slotFn).toHaveBeenCalled();
    const field = slotFn.mock.lastCall![0];
    expect(field.path).toEqual(['items']);
    expect(field.items).toHaveLength(2);
    expect(field.isValid).toBe(true);
  });

  test('should re-render when the field array store updates', async () => {
    const Test = defineComponent({
      setup() {
        const form = useForm({ schema, initialInput: { items: ['a', 'b'] } });
        return () =>
          h('div', [
            h(
              'button',
              {
                type: 'button',
                onClick: () =>
                  insert(form, { path: ['items'], initialInput: 'c' }),
              },
              'Add'
            ),
            h(
              FieldArray,
              { of: form, path: ['items'] },
              {
                default: (field: FieldArrayStore<Schema, ['items']>) =>
                  h(
                    'span',
                    { 'data-testid': 'count' },
                    String(field.items.length)
                  ),
              }
            ),
          ]);
      },
    });

    const wrapper = mount(Test);
    const count = wrapper.get('[data-testid="count"]');

    expect(count.text()).toBe('2');

    await wrapper.get('button').trigger('click');
    await wrapper.vm.$nextTick();
    expect(count.text()).toBe('3');
  });
});
