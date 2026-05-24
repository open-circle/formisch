import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import * as v from 'valibot';
import { describe, beforeEach, expect, it } from 'vitest';
import { injectForm } from '../injectForm/index.ts';
import { injectField } from './injectField.ts';

const Schema = v.object({
  email: v.pipe(v.string(), v.email()),
});

describe('injectField', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
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

  it('updates input signal when onInput is called', () => {
    const { field } = setup();
    field.onInput('test@example.com');
    expect(field.input()).toBe('test@example.com');
  });

  it('exposes a name prop as JSON-stringified path', () => {
    const { field } = setup();
    expect(field.props.name).toBe('["email"]');
  });
});
