import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import type { FieldElement as NativeFieldElement } from '../../types/field/field.react-native.ts';
import type { FieldElement } from '../../types/index.ts';
import { createTestStore, toFormisch } from '../../vitest/index.ts';
import { focusFieldElement } from './focusFieldElement.react-native.ts';

/**
 * Creates a fake `TextInput` ref stand-in with a spyable `focus` method.
 */
function createElement(overrides?: Partial<NativeFieldElement>): FieldElement {
  return { focus: vi.fn(), ...overrides } as unknown as FieldElement;
}

describe('focusFieldElement (react-native)', () => {
  test('should return false and focus nothing for a field without elements', () => {
    const store = createTestStore(toFormisch(v.object({ name: v.string() })));
    store.children.name.elements = [];

    expect(focusFieldElement(store.children.name)).toBe(false);
  });

  test('should focus the first registered element and return true', () => {
    const store = createTestStore(toFormisch(v.object({ name: v.string() })));
    const first = createElement();
    const second = createElement();
    store.children.name.elements = [first, second];

    expect(focusFieldElement(store.children.name)).toBe(true);
    expect(first.focus).toHaveBeenCalledOnce();
    expect(second.focus).not.toHaveBeenCalled();
  });

  test('should verify focus via isFocused and stop at the focused element', () => {
    const store = createTestStore(toFormisch(v.object({ name: v.string() })));
    const first = createElement({ isFocused: () => true });
    const second = createElement();
    store.children.name.elements = [first, second];

    expect(focusFieldElement(store.children.name)).toBe(true);
    expect(first.focus).toHaveBeenCalledOnce();
    expect(second.focus).not.toHaveBeenCalled();
  });

  test('should skip elements that report not being focused', () => {
    const store = createTestStore(toFormisch(v.object({ name: v.string() })));
    const first = createElement({ isFocused: () => false });
    const second = createElement();
    store.children.name.elements = [first, second];

    expect(focusFieldElement(store.children.name)).toBe(true);
    expect(first.focus).toHaveBeenCalledOnce();
    expect(second.focus).toHaveBeenCalledOnce();
  });

  test('should return false if every element reports not being focused', () => {
    const store = createTestStore(toFormisch(v.object({ name: v.string() })));
    const first = createElement({ isFocused: () => false });
    const second = createElement({ isFocused: () => false });
    store.children.name.elements = [first, second];

    expect(focusFieldElement(store.children.name)).toBe(false);
    expect(first.focus).toHaveBeenCalledOnce();
    expect(second.focus).toHaveBeenCalledOnce();
  });
});
