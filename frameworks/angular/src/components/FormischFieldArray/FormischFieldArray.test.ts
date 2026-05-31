import {
  Component,
  provideExperimentalZonelessChangeDetection,
  type Type,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import * as v from 'valibot';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { injectForm } from '../../functions/index.ts';
import { loadDistComponent } from '../../vitest/loadDistComponent.ts';

const Schema = v.object({
  todos: v.array(v.object({ title: v.string() })),
});

let TestHost: Type<unknown>;

describe('FormischFieldArray', () => {
  beforeAll(async () => {
    const FormischFieldArray = await loadDistComponent('FormischFieldArray');

    @Component({
      standalone: true,
      imports: [FormischFieldArray],
      template: `
        <formisch-field-array [of]="form" [path]="['todos']">
          <ng-template let-fieldArray>
            <span data-testid="count">{{ fieldArray.items().length }}</span>
          </ng-template>
        </formisch-field-array>
      `,
    })
    class TestHostComponent {
      form = injectForm({ schema: Schema });
    }

    TestHost = TestHostComponent;
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [provideExperimentalZonelessChangeDetection()],
    });
  });

  it('renders the template with the field array store', async () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const span = host.querySelector('[data-testid="count"]');
    expect(span).not.toBeNull();
  });

  it('passes items signal with initial empty array', async () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const span = host.querySelector('[data-testid="count"]');
    if (!span) {
      throw new Error('Expected count element to render.');
    }
    expect(span.textContent).toBe('0');
  });
});
