import {
  Component,
  provideZonelessChangeDetection,
  type Type,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import * as v from 'valibot';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { injectForm } from '../../functions/index.ts';
import { loadDistComponent } from '../../vitest/loadDistComponent.ts';

const Schema = v.object({ email: v.pipe(v.string(), v.email()) });

let TestHost: Type<unknown>;
let formStore: ReturnType<typeof injectForm<typeof Schema>>;

describe('FormischForm', () => {
  beforeAll(async () => {
    const FormischForm = await loadDistComponent('FormischForm');

    @Component({
      standalone: true,
      imports: [FormischForm],
      template: `
        <formisch-form [of]="form" [submitFn]="handleSubmit">
          <button type="submit">Submit</button>
        </formisch-form>
      `,
    })
    class TestHostComponent {
      form = (formStore = injectForm({ schema: Schema }));
      handleSubmit = vi.fn();
    }

    TestHost = TestHostComponent;
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('renders a native form element', async () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const form = host.querySelector('form');
    expect(form).not.toBeNull();
  });

  it('sets novalidate on the form element', async () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const form = host.querySelector('form');
    if (!form) {
      throw new Error('Expected form element to render.');
    }
    expect(form.hasAttribute('novalidate')).toBe(true);
  });

  it('registers the form element on the internal store', async () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const { INTERNAL } = await import('@formisch/core/angular');
    const internalStore = formStore[INTERNAL];
    expect(internalStore.element).toBeInstanceOf(HTMLFormElement);
  });
});
