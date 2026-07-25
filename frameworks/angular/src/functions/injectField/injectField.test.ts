import {
  createEnvironmentInjector,
  EnvironmentInjector,
  provideZonelessChangeDetection,
  runInInjectionContext,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { getFieldStore, INTERNAL } from '@formisch/core/angular';
import * as v from 'valibot';
import { beforeEach, describe, expect, it } from 'vitest';
import { CONTROL } from '../../types/control.ts';
import { injectForm } from '../injectForm/index.ts';
import { injectField } from './injectField.ts';

const Schema = v.object({
  email: v.pipe(v.string(), v.email()),
});

describe('injectField', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  function setup() {
    return TestBed.runInInjectionContext(() => {
      const form = injectForm({ schema: Schema });
      const field = injectField(form, { path: ['email'] });
      return { form, field };
    });
  }

  it('returns the correct path', () => {
    const { field } = setup();
    expect(field.path).toEqual(['email']);
  });

  it('initializes input as a signal with an empty string', () => {
    const { field } = setup();
    expect(field.input()).toBe('');
  });

  it('initializes errors to null', () => {
    const { field } = setup();
    expect(field.errors()).toBeNull();
  });

  it('initializes isTouched to false', () => {
    const { field } = setup();
    expect(field.isTouched()).toBe(false);
  });

  it('initializes isEdited to false', () => {
    const { field } = setup();
    expect(field.isEdited()).toBe(false);
  });

  it('initializes isDirty to false', () => {
    const { field } = setup();
    expect(field.isDirty()).toBe(false);
  });

  it('marks the field as edited when setInput is called', () => {
    const { field } = setup();
    field.setInput('test@example.com');
    expect(field.isEdited()).toBe(true);
  });

  it('initializes isValid to true', () => {
    const { field } = setup();
    expect(field.isValid()).toBe(true);
  });

  it('exposes the name as a JSON-stringified path signal', () => {
    const { field } = setup();
    expect(field.name()).toBe('["email"]');
  });

  it('updates the input signal when setInput is called', () => {
    const { field } = setup();
    field.setInput('test@example.com');
    expect(field.input()).toBe('test@example.com');
  });

  it('updates the input value when the control onInput is called', () => {
    const { field } = setup();
    const element = document.createElement('input');
    element.value = 'test@example.com';
    field[CONTROL].onInput({ target: element } as unknown as Event);
    expect(field.input()).toBe('test@example.com');
  });

  it('does not change the input value when the control onChange is called', () => {
    const { field } = setup();
    field[CONTROL].onChange();
    expect(field.input()).toBe('');
  });

  it('registers and unregisters the element via the control ref', () => {
    const { form, field } = setup();
    const internalFieldStore = getFieldStore(form[INTERNAL], ['email']);
    const element = document.createElement('input');
    const cleanup = field[CONTROL].ref(element);
    expect(internalFieldStore.elements).toContain(element);
    expect(typeof cleanup).toBe('function');
    cleanup?.();
    expect(internalFieldStore.elements).not.toContain(element);
  });

  it('ignores a null element passed to the control ref', () => {
    const { form, field } = setup();
    const internalFieldStore = getFieldStore(form[INTERNAL], ['email']);
    expect(field[CONTROL].ref(null)).toBeUndefined();
    expect(internalFieldStore.elements).toHaveLength(0);
  });

  it('keeps initialElements in sync when unregistering the element', () => {
    const { form, field } = setup();
    const internalFieldStore = getFieldStore(form[INTERNAL], ['email']);
    const element = document.createElement('input');
    const cleanup = field[CONTROL].ref(element);
    expect(internalFieldStore.initialElements).toContain(element);
    cleanup?.();
    expect(internalFieldStore.initialElements).not.toContain(element);
    expect(internalFieldStore.elements).toBe(
      internalFieldStore.initialElements
    );
  });

  it('drops disconnected elements from the field store on destroy', () => {
    const injector = createEnvironmentInjector(
      [],
      TestBed.inject(EnvironmentInjector)
    );
    const { form, field } = runInInjectionContext(injector, () => {
      const form = injectForm({ schema: Schema });
      return { form, field: injectField(form, { path: ['email'] }) };
    });
    const internalFieldStore = getFieldStore(form[INTERNAL], ['email']);

    const connected = document.createElement('input');
    document.body.append(connected);
    const disconnected = document.createElement('input');
    field[CONTROL].ref(connected);
    field[CONTROL].ref(disconnected);
    expect(internalFieldStore.elements).toEqual([connected, disconnected]);

    injector.destroy();

    // Only the element still in the document survives, so resetting a
    // remounted field restores its live element instead of a stale one
    expect(internalFieldStore.elements).toEqual([connected]);
    expect(internalFieldStore.initialElements).toEqual([connected]);
    connected.remove();
  });

  it('does not touch initialElements when a reorder moved the elements', () => {
    const { form, field } = setup();
    const internalFieldStore = getFieldStore(form[INTERNAL], ['email']);
    const element = document.createElement('input');
    const cleanup = field[CONTROL].ref(element);
    const initialElements = internalFieldStore.initialElements;
    // Simulate a reorder having moved the elements to a new array
    internalFieldStore.elements = [...internalFieldStore.elements];
    cleanup?.();
    expect(internalFieldStore.initialElements).toBe(initialElements);
    expect(internalFieldStore.initialElements).toContain(element);
  });
});
