import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import { createTestStore } from '../../vitest/index.ts';
import type { FieldElement } from '../../types/index.ts';
import { focusFieldElement } from './focusFieldElement.react-native.ts';

/**
 * Creates a fake `TextInput` ref stand-in with a spyable `focus` method.
 */
function createElement(): FieldElement {
  return { focus: vi.fn() } as unknown as FieldElement;
}

describe('focusFieldElement (react-native)', () => {
  test('should return false and focus nothing for a field without elements', () => {
    const store = createTestStore(v.object({ name: v.string() }));
    store.children.name.elements = [];

    expect(focusFieldElement(store.children.name)).toBe(false);
  });

  test('should focus the first registered element and return true', () => {
    const store = createTestStore(v.object({ name: v.string() }));
    const first = createElement();
    const second = createElement();
    store.children.name.elements = [first, second];

    expect(focusFieldElement(store.children.name)).toBe(true);
    expect(first.focus).toHaveBeenCalledOnce();
    expect(second.focus).not.toHaveBeenCalled();
  });
});
