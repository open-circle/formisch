import type { FieldElement } from '@formisch/core/vue';
import type { ComponentPublicInstance } from 'vue';

/**
 * Resolves the field element from a template ref, which is a component
 * instance instead of a DOM element when the field props are bound to a
 * component that wraps the actual form control.
 *
 * @param element The DOM element or component instance.
 *
 * @returns The resolved field element, if any.
 */
export function resolveFieldElement(
  element: Element | ComponentPublicInstance
): FieldElement | null {
  // If element is a DOM element, return it as is
  // Hint: We check for `$el` instead of using `instanceof Element`, so that
  // elements of another realm, such as an iframe, are handled correctly
  if (!('$el' in element)) {
    return element as FieldElement;
  }

  // Otherwise, resolve the root element of the component and use it if it is
  // a form control or search its descendants for the first form control
  const rootNode: Node | null = element.$el;
  if (rootNode?.nodeType === 1) {
    const rootElement = rootNode as Element;
    return rootElement.matches('input, select, textarea')
      ? (rootElement as FieldElement)
      : rootElement.querySelector<FieldElement>('input, select, textarea');
  }

  // Hint: Components with a fragment root do not have a root element
  return null;
}
