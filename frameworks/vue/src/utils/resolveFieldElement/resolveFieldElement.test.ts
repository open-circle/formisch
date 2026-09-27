import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import {
  type ComponentPublicInstance,
  defineComponent,
  h,
  type VNode,
} from 'vue';
import { resolveFieldElement } from './resolveFieldElement.ts';

/**
 * Mounts a component with the given render function inside a parent and
 * returns the value its template ref receives.
 *
 * @param render The render function of the component.
 * @param expose Whether the component explicitly exposes its state.
 *
 * @returns The template ref value of the component.
 */
function mountRef(
  render: () => VNode | VNode[],
  expose = false
): ComponentPublicInstance {
  let refValue: ComponentPublicInstance | undefined;
  const Child = defineComponent({
    inheritAttrs: false,
    setup(_, context) {
      if (expose) {
        context.expose({});
      }
      return render;
    },
  });
  mount(
    defineComponent({
      setup() {
        return () =>
          h(Child, {
            ref: (value) => {
              refValue = value as ComponentPublicInstance;
            },
          });
      },
    })
  );
  return refValue!;
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
      const instance = mountRef(() => h(tag));
      expect(resolveFieldElement(instance)).toBe(instance.$el);
    }
  });

  test('should return the root element of a component with exposed state', () => {
    const instance = mountRef(() => h('input'), true);
    const element = resolveFieldElement(instance);
    expect(element).toBeInstanceOf(HTMLInputElement);
    expect(element).toBe(instance.$el);
  });

  test('should return the first nested form control of a component', () => {
    const instance = mountRef(() =>
      h('div', [h('label', 'Name'), h('textarea'), h('input')])
    );
    expect(resolveFieldElement(instance)).toBe(
      (instance.$el as Element).querySelector('textarea')
    );
  });

  test('should return null if a component has no form control', () => {
    const instance = mountRef(() => h('div', [h('span', 'Name')]));
    expect(resolveFieldElement(instance)).toBe(null);
  });

  test('should return null if a component has a fragment root', () => {
    const instance = mountRef(() => [h('label', 'Name'), h('input')]);
    expect(resolveFieldElement(instance)).toBe(null);
  });
});
