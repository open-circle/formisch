import { Component, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import * as v from 'valibot';
import { describe, beforeEach, expect, it } from 'vitest';
import { injectForm } from '../../functions/index.ts';
import { FormischField } from './FormischField.ts';

const Schema = v.object({ email: v.pipe(v.string(), v.email()) });

@Component({
  standalone: true,
  imports: [FormischField],
  template: `
    <formisch-field [of]="form" [path]="['email']">
      <ng-template let-field>
        <input [name]="field.props.name" data-testid="input" />
        <span data-testid="errors">{{ field.errors() }}</span>
      </ng-template>
    </formisch-field>
  `,
})
class TestHost {
  form = injectForm({ schema: Schema });
}

describe('FormischField', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [provideExperimentalZonelessChangeDetection()],
    });
  });

  it('renders the template with the field store', async () => {
    const fixture = TestBed.createComponent(TestHost);
    await fixture.whenStable();
    const input = (fixture.nativeElement as HTMLElement).querySelector('[data-testid="input"]');
    expect(input).not.toBeNull();
  });

  it('passes the field name prop to the template context', async () => {
    const fixture = TestBed.createComponent(TestHost);
    await fixture.whenStable();
    const input = (fixture.nativeElement as HTMLElement).querySelector('[data-testid="input"]');
    expect(input.getAttribute('name')).not.toBeNull();
  });
});
