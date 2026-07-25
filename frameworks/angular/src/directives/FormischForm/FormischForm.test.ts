import {
  Component,
  provideZonelessChangeDetection,
  signal,
  type WritableSignal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { INTERNAL, type SubmitEventHandler } from '@formisch/core/angular';
import * as v from 'valibot';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { injectForm } from '../../functions/index.ts';
import { FormischForm } from './FormischForm.ts';

const Schema = v.object({
  email: v.pipe(v.string(), v.nonEmpty(), v.email()),
});

@Component({
  selector: 'formisch-form-test-host',
  standalone: true,
  imports: [FormischForm],
  template: `<form
    [formischForm]="form"
    [formischSubmit]="handleSubmit"
    #directive="formischForm"
  >
    <button type="submit" data-testid="submit">Submit</button>
  </form>`,
})
class TestHost {
  readonly form = injectForm({
    schema: Schema,
    initialInput: { email: 'jane@example.com' },
  });
  submitted: v.InferOutput<typeof Schema> | undefined = undefined;
  readonly handleSubmit: SubmitEventHandler<typeof Schema> = (output) => {
    this.submitted = output;
  };
}

@Component({
  selector: 'formisch-form-async-host',
  standalone: true,
  imports: [FormischForm],
  template: `<form
    [formischForm]="form"
    [formischSubmit]="handleSubmit"
  ></form>`,
})
class AsyncSubmitHost {
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

@Component({
  selector: 'formisch-form-reject-host',
  standalone: true,
  imports: [FormischForm],
  template: `<form
    [formischForm]="form"
    [formischSubmit]="handleSubmit"
  ></form>`,
})
class RejectSubmitHost {
  readonly form = injectForm({
    schema: Schema,
    initialInput: { email: 'jane@example.com' },
  });
  readonly handleSubmit: SubmitEventHandler<typeof Schema> = () =>
    Promise.reject(new Error('Submit failed'));
}

@Component({
  selector: 'formisch-form-invalid-host',
  standalone: true,
  imports: [FormischForm],
  template: `<form
    [formischForm]="form"
    [formischSubmit]="handleSubmit"
  ></form>`,
})
class InvalidSubmitHost {
  readonly form = injectForm({ schema: Schema });
  readonly handleSubmit: SubmitEventHandler<typeof Schema> = vi.fn();
}

@Component({
  selector: 'formisch-form-swap-host',
  standalone: true,
  imports: [FormischForm],
  template: `<form
    [formischForm]="useFirstForm() ? firstForm : secondForm"
    [formischSubmit]="handleSubmit"
  ></form>`,
})
class SwapHost {
  readonly firstForm = injectForm({ schema: Schema });
  readonly secondForm = injectForm({ schema: Schema });
  readonly useFirstForm: WritableSignal<boolean> = signal(true);
  readonly handleSubmit: SubmitEventHandler<typeof Schema> = () => undefined;
}

describe('FormischForm', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TestHost,
        AsyncSubmitHost,
        RejectSubmitHost,
        InvalidSubmitHost,
        SwapHost,
      ],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('sets novalidate on the form element', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    const form = (fixture.nativeElement as HTMLElement).querySelector('form');
    expect(form?.hasAttribute('novalidate')).toBe(true);
  });

  it('is exportable as formischForm in template references', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    const directive = fixture.debugElement.children[0].references[
      'directive'
    ] as { formischForm(): unknown };
    expect(directive.formischForm()).toBe(fixture.componentInstance.form);
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

  it('prevents the native form submission', async () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    const form = (fixture.nativeElement as HTMLElement).querySelector('form')!;
    const event = new SubmitEvent('submit', { cancelable: true });
    form.dispatchEvent(event);
    await fixture.whenStable();
    expect(event.defaultPrevented).toBe(true);
  });

  it('does not call the submit handler when validation fails', async () => {
    const fixture = TestBed.createComponent(InvalidSubmitHost);
    fixture.detectChanges();
    const form = (fixture.nativeElement as HTMLElement).querySelector('form')!;
    form.dispatchEvent(new SubmitEvent('submit', { cancelable: true }));
    await fixture.whenStable();

    expect(fixture.componentInstance.handleSubmit).not.toHaveBeenCalled();
    expect(fixture.componentInstance.form.isSubmitted()).toBe(true);
    expect(fixture.componentInstance.form.isValid()).toBe(false);
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
