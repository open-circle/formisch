import { Component, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import * as v from 'valibot';
import { describe, beforeEach, expect, it } from 'vitest';
import { injectForm } from '../../functions/index.ts';
import { FormischFieldArray } from './FormischFieldArray.ts';

const Schema = v.object({
  todos: v.array(v.object({ title: v.string() })),
});

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
class TestHost {
  form = injectForm({ schema: Schema });
}

describe('FormischFieldArray', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [provideExperimentalZonelessChangeDetection()],
    });
  });

  it('renders the template with the field array store', async () => {
    const fixture = TestBed.createComponent(TestHost);
    await fixture.whenStable();
    const span = fixture.nativeElement.querySelector('[data-testid="count"]');
    expect(span).not.toBeNull();
  });

  it('passes items signal with initial empty array', async () => {
    const fixture = TestBed.createComponent(TestHost);
    await fixture.whenStable();
    const span = fixture.nativeElement.querySelector('[data-testid="count"]');
    expect(span.textContent.trim()).toBe('0');
  });
});
