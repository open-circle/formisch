import {
  Component,
  provideZonelessChangeDetection,
  signal,
  type Type,
  type WritableSignal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { INTERNAL, type SubmitEventHandler } from '@formisch/core/angular';
import * as v from 'valibot';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { injectForm } from '../../functions/index.ts';
import type { FormStore } from '../../types/index.ts';
import { loadDistComponent } from '../../vitest/loadDistComponent.ts';

const Schema = v.object({
  email: v.pipe(v.string(), v.nonEmpty(), v.email()),
});

let TestHost: Type<{
  form: FormStore<typeof Schema>;
  submitted: v.InferOutput<typeof Schema> | undefined;
}>;
let AsyncSubmitHost: Type<{
  form: FormStore<typeof Schema>;
  submitted: v.InferOutput<typeof Schema> | undefined;
  resolveSubmit: (() => void) | undefined;
}>;
let RejectSubmitHost: Type<{
  form: FormStore<typeof Schema>;
}>;
let SwapHost: Type<{
  firstForm: FormStore<typeof Schema>;
  secondForm: FormStore<typeof Schema>;
  useFirstForm: WritableSignal<boolean>;
}>;

describe('FormischForm', () => {
  beforeAll(async () => {
    const FormischForm = await loadDistComponent('FormischForm');

    @Component({
      selector: 'formisch-form-test-host',
      standalone: true,
      imports: [FormischForm],
      template: `<form [formischForm]="form" [formischSubmit]="handleSubmit">
        <button type="submit" data-testid="submit">Submit</button>
      </form>`,
    })
    class TestHostComponent {
      readonly form = injectForm({
        schema: Schema,
        initialInput: { email: 'jane@example.com' },
      });
      submitted: v.InferOutput<typeof Schema> | undefined = undefined;
      readonly handleSubmit: SubmitEventHandler<typeof Schema> = (output) => {
        this.submitted = output;
      };
    }

    TestHost = TestHostComponent as Type<{
      form: FormStore<typeof Schema>;
      submitted: v.InferOutput<typeof Schema> | undefined;
    }>;

    @Component({
      selector: 'formisch-form-async-host',
      standalone: true,
      imports: [FormischForm],
      template: `<form
        [formischForm]="form"
        [formischSubmit]="handleSubmit"
      ></form>`,
    })
    class AsyncSubmitHostComponent {
      readonly form = injectForm({
        schema: Schema,
        initialInput: { email: 'jane@example.com' },
      });
      submitted: v.InferOutput<typeof Schema> | undefined = undefined;
      resolveSubmit: (() => void) | undefined = undefined;
      readonly submitPromise = new Promise<void>((resolve) => {
        this.resolveSubmit = resolve;
      });
      readonly handleSubmit: SubmitEventHandler<typeof Schema> = (output) => {
        this.submitted = output;
        return this.submitPromise;
      };
    }

    AsyncSubmitHost = AsyncSubmitHostComponent as Type<{
      form: FormStore<typeof Schema>;
      submitted: v.InferOutput<typeof Schema> | undefined;
      resolveSubmit: (() => void) | undefined;
    }>;

    @Component({
      selector: 'formisch-form-reject-host',
      standalone: true,
      imports: [FormischForm],
      template: `<form
        [formischForm]="form"
        [formischSubmit]="handleSubmit"
      ></form>`,
    })
    class RejectSubmitHostComponent {
      readonly form = injectForm({
        schema: Schema,
        initialInput: { email: 'jane@example.com' },
      });
      readonly handleSubmit: SubmitEventHandler<typeof Schema> = () =>
        Promise.reject(new Error('Submit failed'));
    }

    RejectSubmitHost = RejectSubmitHostComponent as Type<{
      form: FormStore<typeof Schema>;
    }>;

    @Component({
      selector: 'formisch-form-swap-host',
      standalone: true,
      imports: [FormischForm],
      template: `<form
        [formischForm]="useFirstForm() ? firstForm : secondForm"
        [formischSubmit]="handleSubmit"
      ></form>`,
    })
    class SwapHostComponent {
      readonly firstForm = injectForm({ schema: Schema });
      readonly secondForm = injectForm({ schema: Schema });
      readonly useFirstForm = signal(true);
      readonly handleSubmit: SubmitEventHandler<typeof Schema> = () =>
        undefined;
    }

    SwapHost = SwapHostComponent as Type<{
      firstForm: FormStore<typeof Schema>;
      secondForm: FormStore<typeof Schema>;
      useFirstForm: WritableSignal<boolean>;
    }>;
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHost, AsyncSubmitHost, RejectSubmitHost, SwapHost],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('sets novalidate on the form element', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    const form = (fixture.nativeElement as HTMLElement).querySelector('form');
    expect(form?.hasAttribute('novalidate')).toBe(true);
  });

  it('registers the form element on the store', async () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const form = (fixture.nativeElement as HTMLElement).querySelector('form');
    expect(fixture.componentInstance.form[INTERNAL].element).toBe(form);
  });

  it('calls the submit handler with the validated output', async () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    const form = (fixture.nativeElement as HTMLElement).querySelector('form')!;
    form.dispatchEvent(new SubmitEvent('submit', { cancelable: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.submitted).toEqual({
      email: 'jane@example.com',
    });
  });

  it('keeps the form submitting while an async submit handler is pending', async () => {
    const fixture = TestBed.createComponent(AsyncSubmitHost);
    fixture.detectChanges();
    const form = (fixture.nativeElement as HTMLElement).querySelector('form')!;
    form.dispatchEvent(new SubmitEvent('submit', { cancelable: true }));

    // Wait for the deferred event handler to run, validate, and call the submit
    // handler (which sets submitted) while still awaiting the async result.
    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(fixture.componentInstance.submitted).toEqual({
        email: 'jane@example.com',
      });
      expect(fixture.componentInstance.form.isSubmitting()).toBe(true);
    });

    // Resolve the pending submit — whenStable() waits because the chain is
    // registered as a PendingTask.
    fixture.componentInstance.resolveSubmit?.();
    await fixture.whenStable();

    // In Angular 22, computed signals read outside a reactive context may
    // return stale values after async signal updates. Read the raw signal
    // directly to avoid the stale-tracking issue.
    const { INTERNAL } = await import('@formisch/core/angular');
    expect(fixture.componentInstance.form[INTERNAL].isSubmitting.value).toBe(
      false
    );
  });

  it('stores errors from a rejected submit handler', async () => {
    const fixture = TestBed.createComponent(RejectSubmitHost);
    fixture.detectChanges();
    const form = (fixture.nativeElement as HTMLElement).querySelector('form')!;
    form.dispatchEvent(new SubmitEvent('submit', { cancelable: true }));
    await fixture.whenStable();

    expect(fixture.componentInstance.form.errors()).toEqual(['Submit failed']);
    expect(fixture.componentInstance.form.isSubmitting()).toBe(false);
  });

  it('re-registers the form element when the bound form changes', async () => {
    const fixture = TestBed.createComponent(SwapHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const form = (fixture.nativeElement as HTMLElement).querySelector('form');
    expect(fixture.componentInstance.firstForm[INTERNAL].element).toBe(form);
    expect(
      fixture.componentInstance.secondForm[INTERNAL].element
    ).toBeUndefined();

    fixture.componentInstance.useFirstForm.set(false);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(
      fixture.componentInstance.firstForm[INTERNAL].element
    ).toBeUndefined();
    expect(fixture.componentInstance.secondForm[INTERNAL].element).toBe(form);
  });

  it('clears the registered form element on destroy', async () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const internalFormStore = fixture.componentInstance.form[INTERNAL];
    expect(internalFormStore.element).toBeDefined();
    fixture.destroy();
    expect(internalFormStore.element).toBeUndefined();
  });
});
