import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import {
  type ComponentPublicInstance,
  defineComponent,
  h,
  type VNode,
} from 'vue';
import { resolveFieldElements } from './resolveFieldElements.ts';

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

describe('resolveFieldElements', () => {
  test('should return a DOM element as is', () => {
    const element = document.createElement('input');
    expect(resolveFieldElements(element)).toEqual([element]);
  });

  test('should return a DOM element of another realm as is', () => {
    const iframe = document.createElement('iframe');
    document.body.append(iframe);
    const element = iframe.contentDocument!.createElement('input');
    expect(element).not.toBeInstanceOf(Element);
    expect(resolveFieldElements(element)).toEqual([element]);
    iframe.remove();
  });

  test('should return the root element of a component if it is a form control', () => {
    for (const tag of ['input', 'select', 'textarea']) {
      const instance = mountRef(() => h(tag));
      expect(resolveFieldElements(instance)).toEqual([instance.$el]);
    }
  });

  test('should return the root element of a component with exposed state', () => {
    const instance = mountRef(() => h('input'), true);
    const [element] = resolveFieldElements(instance);
    expect(element).toBeInstanceOf(HTMLInputElement);
    expect(element).toBe(instance.$el);
  });

  test('should return all nested form controls of a component', () => {
    const instance = mountRef(() =>
      h('div', [
        h('label', 'Name'),
        h('input', { type: 'hidden' }),
        h('textarea'),
        h('select'),
      ])
    );
    const [, hidden, textarea, select] = (instance.$el as Element).children;
    expect(resolveFieldElements(instance)).toEqual([hidden, textarea, select]);
  });

  test('should return an empty array if a component has no form control', () => {
    const instance = mountRef(() => h('div', [h('span', 'Name')]));
    expect(resolveFieldElements(instance)).toEqual([]);
  });

  test('should return an empty array if a component has a fragment root', () => {
    const instance = mountRef(() => [h('label', 'Name'), h('input')]);
    expect(resolveFieldElements(instance)).toEqual([]);
  });
});
