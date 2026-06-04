import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  type FieldElement,
  getFieldStore,
  INTERNAL,
} from '@formisch/core/angular';
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

  it('initializes input as a signal with undefined', () => {
    const { field } = setup();
    expect(field.input()).toBeUndefined();
  });

  it('initializes errors to null', () => {
    const { field } = setup();
    expect(field.errors()).toBeNull();
  });

  it('initializes isTouched to false', () => {
    const { field } = setup();
    expect(field.isTouched()).toBe(false);
  });

  it('initializes isDirty to false', () => {
    const { field } = setup();
    expect(field.isDirty()).toBe(false);
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
    field[CONTROL].onInput(element as unknown as FieldElement);
    expect(field.input()).toBe('test@example.com');
  });

  it('does not change the input value when the control onChange is called', () => {
    const { field } = setup();
    field[CONTROL].onChange();
    expect(field.input()).toBeUndefined();
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
});
