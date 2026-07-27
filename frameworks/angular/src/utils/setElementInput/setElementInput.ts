import type { FieldElement } from '@formisch/core/angular';

/**
 * Writes the current input of the field to the element. Handles special cases
 * for selects, checkbox groups, radio groups, and file inputs. This is the
 * write-direction mirror of core's `getElementInput`.
 *
 * @param element The field element.
 * @param input The field input.
 */
export function setElementInput(element: FieldElement, input: unknown): void {
  // If element is select, sync the selection
  if (element instanceof HTMLSelectElement) {
    // If multiple, sync the selected state of each option
    if (element.multiple) {
      const values = Array.isArray(input) ? input.map(String) : [];
      for (const option of element.options) {
        const selected = values.includes(option.value);
        if (option.selected !== selected) {
          option.selected = selected;
        }
      }

      // Otherwise, write the value so a nullish input selects the empty
      // placeholder option instead of deselecting every option, which would
      // make the browser fall back to the first non-disabled option
    } else {
      const value = input == null ? '' : String(input);
      if (element.value !== value) {
        element.value = value;
      }
    }
    return;
  }

  if (element instanceof HTMLInputElement) {
    // If element is checkbox, sync checked state of single or group
    if (element.type === 'checkbox') {
      const checked = Array.isArray(input)
        ? input.includes(element.value)
        : !!input;
      if (element.checked !== checked) {
        element.checked = checked;
      }
      return;
    }

    // If element is radio, check it if its value matches the input
    if (element.type === 'radio') {
      const checked = element.value === input;
      if (element.checked !== checked) {
        element.checked = checked;
      }
      return;
    }

    // If element is file input, only clear it when the input is empty, as
    // file selections cannot be written programmatically
    if (element.type === 'file') {
      if (
        (!input || (Array.isArray(input) && !input.length)) &&
        element.value
      ) {
        element.value = '';
      }
      return;
    }
  }

  // Write element value for all other input types. The guard avoids resetting
  // the caret position while the user is typing.
  const value = input == null ? '' : String(input);
  if (element.value !== value) {
    element.value = value;
  }
}
