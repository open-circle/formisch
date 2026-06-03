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

const Schema = v.object({ email: v.pipe(v.string(), v.email()) });

let TestHost: Type<unknown>;

describe('FormischField', () => {
  beforeAll(async () => {
    const FormischField = await loadDistComponent('FormischField');

    @Component({
      standalone: true,
      imports: [FormischField],
      template: `
        <formisch-field [of]="form" [path]="['email']">
          <ng-template let-field>
            <input [name]="field.name" data-testid="input" />
            <span data-testid="errors">{{ field.errors() }}</span>
          </ng-template>
        </formisch-field>
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

  it('renders the template with the field store', async () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const input = host.querySelector('[data-testid="input"]');
    expect(input).not.toBeNull();
  });

  it('passes the field name prop to the template context', async () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const input = host.querySelector('[data-testid="input"]');
    if (!input) {
      throw new Error('Expected input element to render.');
    }
    expect(input.getAttribute('name')).not.toBeNull();
  });
});
