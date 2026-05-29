import { Component, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import * as v from 'valibot';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { injectForm } from '../../functions/index.ts';
import { FormischForm } from './FormischForm.ts';

const Schema = v.object({ email: v.pipe(v.string(), v.email()) });

@Component({
  standalone: true,
  imports: [FormischForm],
  template: `
    <formisch-form [of]="form" [submitFn]="handleSubmit">
      <button type="submit">Submit</button>
    </formisch-form>
  `,
})
class TestHost {
  form = injectForm({ schema: Schema });
  handleSubmit = vi.fn();
}

describe('FormischForm', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [provideExperimentalZonelessChangeDetection()],
    });
  });

  it('renders a native form element', async () => {
    const fixture = TestBed.createComponent(TestHost);
    await fixture.whenStable();
    const form = (fixture.nativeElement as HTMLElement).querySelector('form');
    expect(form).not.toBeNull();
  });

  it('sets novalidate on the form element', async () => {
    const fixture = TestBed.createComponent(TestHost);
    await fixture.whenStable();
    const form = (fixture.nativeElement as HTMLElement).querySelector('form');
    expect(form.hasAttribute('novalidate')).toBe(true);
  });

  it('registers the form element on the internal store', async () => {
    const fixture = TestBed.createComponent(TestHost);
    await fixture.whenStable();
    const { INTERNAL } = await import('@formisch/core/angular');
    const internalStore = fixture.componentInstance.form[INTERNAL];
    expect(internalStore.element).toBeInstanceOf(HTMLFormElement);
  });
});
