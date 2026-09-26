import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import { type ComponentPublicInstance, defineComponent, h } from 'vue';
import { resolveFieldElement } from './resolveFieldElement.ts';

/**
 * Mounts a component with the given render function and returns its instance.
 *
 * @param render The render function of the component.
 *
 * @returns The component instance.
 */
function mountInstance(
  render: () => ReturnType<typeof h> | ReturnType<typeof h>[]
): ComponentPublicInstance {
  return mount(defineComponent({ inheritAttrs: false, setup: () => render }))
    .vm;
}

describe('resolveFieldElement', () => {
  test('should return a DOM element as is', () => {
    const element = document.createElement('input');
    expect(resolveFieldElement(element)).toBe(element);
  });

  test('should return a DOM element of another realm as is', () => {
    const iframe = document.createElement('iframe');
    document.body.append(iframe);
    const element = iframe.contentDocument!.createElement('input');
    expect(element).not.toBeInstanceOf(Element);
    expect(resolveFieldElement(element)).toBe(element);
    iframe.remove();
  });

  test('should return the root element of a component if it is a form control', () => {
    for (const tag of ['input', 'select', 'textarea']) {
      const instance = mountInstance(() => h(tag));
      expect(resolveFieldElement(instance)).toBe(instance.$el);
    }
  });

  test('should return the root element of a component with exposed state', () => {
    const wrapper = mount(
      defineComponent({
        setup(_, { expose }) {
          expose({});
          return () => h('input');
        },
      })
    );
    const element = resolveFieldElement(wrapper.vm);
    expect(element).toBe(wrapper.element);
  });

  test('should return the first nested form control of a component', () => {
    const instance = mountInstance(() =>
      h('div', [h('label', 'Name'), h('textarea'), h('input')])
    );
    expect(resolveFieldElement(instance)).toBe(
      (instance.$el as Element).querySelector('textarea')
    );
  });

  test('should return null if a component has no form control', () => {
    const instance = mountInstance(() => h('div', [h('span', 'Name')]));
    expect(resolveFieldElement(instance)).toBe(null);
  });

  test('should return null if a component has a fragment root', () => {
    const instance = mountInstance(() => [h('label', 'Name'), h('input')]);
    expect(resolveFieldElement(instance)).toBe(null);
  });
});
