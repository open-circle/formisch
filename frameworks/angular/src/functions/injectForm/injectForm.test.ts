import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import * as v from 'valibot';
import { beforeEach, describe, expect, it } from 'vitest';
import { injectForm } from './injectForm.ts';

const Schema = v.object({
  email: v.pipe(v.string(), v.email()),
});

describe('injectForm', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  function setup() {
    return TestBed.runInInjectionContext(() => injectForm({ schema: Schema }));
  }

  it('initializes isSubmitting to false', () => {
    const form = setup();
    expect(form.isSubmitting()).toBe(false);
  });

  it('initializes isSubmitted to false', () => {
    const form = setup();
    expect(form.isSubmitted()).toBe(false);
  });

  it('initializes isValidating to false', () => {
    const form = setup();
    expect(form.isValidating()).toBe(false);
  });

  it('initializes isTouched to false', () => {
    const form = setup();
    expect(form.isTouched()).toBe(false);
  });

  it('initializes isDirty to false', () => {
    const form = setup();
    expect(form.isDirty()).toBe(false);
  });

  it('initializes isValid to true when no validation errors', () => {
    const form = setup();
    expect(form.isValid()).toBe(true);
  });

  it('initializes errors to null', () => {
    const form = setup();
    expect(form.errors()).toBeNull();
  });
});
