// @vitest-environment jsdom
import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import { createTestStore } from '../vitest/index.ts';
import { focus } from './focus.ts';

describe('focus', () => {
  test('should focus first element of field', () => {
    const store = createTestStore(v.object({ name: v.string() }));
    const input = document.createElement('input');
    const focusSpy = vi.spyOn(input, 'focus');
    store.children.name.elements = [input];

    focus(store, { path: ['name'] });

    expect(focusSpy).toHaveBeenCalledOnce();
  });

  test('should not throw if field has no elements', () => {
    const store = createTestStore(v.object({ name: v.string() }));
    store.children.name.elements = [];

    expect(() => focus(store, { path: ['name'] })).not.toThrow();
  });

  test('should focus first element when field has multiple elements', () => {
    const store = createTestStore(v.object({ name: v.string() }));
    const input1 = document.createElement('input');
    const input2 = document.createElement('input');
    const focusSpy1 = vi.spyOn(input1, 'focus');
    const focusSpy2 = vi.spyOn(input2, 'focus');
    store.children.name.elements = [input1, input2];

    focus(store, { path: ['name'] });

    expect(focusSpy1).toHaveBeenCalledOnce();
    expect(focusSpy2).not.toHaveBeenCalled();
  });

  test('should focus nested field', () => {
    const store = createTestStore(
      v.object({ user: v.object({ email: v.string() }) }),
      { initialInput: { user: { email: '' } } }
    );
    const input = document.createElement('input');
    const focusSpy = vi.spyOn(input, 'focus');

    const userStore = store.children.user;
    expect(userStore.kind).toBe('object');
    if (userStore.kind === 'object') {
      userStore.children.email.elements = [input];
    }

    focus(store, { path: ['user', 'email'] });

    expect(focusSpy).toHaveBeenCalledOnce();
  });
});
