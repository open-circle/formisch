import { Component, provideZonelessChangeDetection } from '@angular/core';
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

  it('triggers validation after initial render when validate is initial', async () => {
    @Component({ standalone: true, template: '' })
    class TestComponent {
      readonly form = injectForm({ schema: Schema, validate: 'initial' });
    }

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    // validateFormInput is async and void-ed, so Angular's scheduler does not
    // track it. Give the microtask queue one turn to let the validation
    // promise resolve and the signals update before asserting.
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.form.isValid()).toBe(false);
  });
});
