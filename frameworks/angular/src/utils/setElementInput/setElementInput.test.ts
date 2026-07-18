import { describe, expect, it } from 'vitest';
import { setElementInput } from './setElementInput.ts';

function createSelect(values: string[], multiple: boolean): HTMLSelectElement {
  const select = document.createElement('select');
  select.multiple = multiple;
  for (const value of values) {
    const option = document.createElement('option');
    option.value = value;
    select.append(option);
  }
  return select;
}

describe('setElementInput', () => {
  it('writes the input to text elements', () => {
    const element = document.createElement('input');
    setElementInput(element, 'foo');
    expect(element.value).toBe('foo');
  });

  it('writes the input to textarea elements', () => {
    const element = document.createElement('textarea');
    setElementInput(element, 'foo');
    expect(element.value).toBe('foo');
  });

  it('writes an empty string for null and undefined', () => {
    const element = document.createElement('input');
    element.value = 'foo';
    setElementInput(element, undefined);
    expect(element.value).toBe('');
    element.value = 'foo';
    setElementInput(element, null);
    expect(element.value).toBe('');
  });

  it('does not rewrite an unchanged value', () => {
    const element = document.createElement('input');
    element.value = 'foo';
    const descriptor = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value'
    )!;
    let writes = 0;
    Object.defineProperty(element, 'value', {
      get() {
        return descriptor.get!.call(element) as string;
      },
      set(value: string) {
        writes++;
        descriptor.set!.call(element, value);
      },
    });
    setElementInput(element, 'foo');
    expect(writes).toBe(0);
    setElementInput(element, 'bar');
    expect(writes).toBe(1);
  });

  it('checks a single checkbox based on a boolean input', () => {
    const element = document.createElement('input');
    element.type = 'checkbox';
    setElementInput(element, true);
    expect(element.checked).toBe(true);
    setElementInput(element, false);
    expect(element.checked).toBe(false);
  });

  it('checks a group checkbox based on array membership', () => {
    const element = document.createElement('input');
    element.type = 'checkbox';
    element.value = 'option_1';
    setElementInput(element, ['option_1', 'option_2']);
    expect(element.checked).toBe(true);
    setElementInput(element, ['option_2']);
    expect(element.checked).toBe(false);
  });

  it('checks a radio if its value matches the input', () => {
    const element = document.createElement('input');
    element.type = 'radio';
    element.value = 'option_1';
    setElementInput(element, 'option_1');
    expect(element.checked).toBe(true);
    setElementInput(element, 'option_2');
    expect(element.checked).toBe(false);
  });

  it('syncs the option selection of a single select', () => {
    const element = createSelect(['', 'option_1', 'option_2'], false);
    setElementInput(element, 'option_2');
    expect(element.value).toBe('option_2');
    setElementInput(element, undefined);
    expect(element.options[2].selected).toBe(false);
  });

  it('syncs the option selection of a multiple select', () => {
    const element = createSelect(['option_1', 'option_2', 'option_3'], true);
    setElementInput(element, ['option_1', 'option_3']);
    expect(element.options[0].selected).toBe(true);
    expect(element.options[1].selected).toBe(false);
    expect(element.options[2].selected).toBe(true);
    setElementInput(element, []);
    expect(element.options[0].selected).toBe(false);
    expect(element.options[2].selected).toBe(false);
  });

  it('does not touch a file input with a present input', () => {
    const element = document.createElement('input');
    element.type = 'file';
    setElementInput(element, new File([], 'file.txt'));
    expect(element.value).toBe('');
  });

  it('does not throw when clearing an empty file input', () => {
    const element = document.createElement('input');
    element.type = 'file';
    expect(() => setElementInput(element, undefined)).not.toThrow();
    expect(() => setElementInput(element, [])).not.toThrow();
    expect(element.value).toBe('');
  });
});
