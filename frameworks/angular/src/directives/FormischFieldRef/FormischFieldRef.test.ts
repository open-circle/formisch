import {
  Component,
  provideZonelessChangeDetection,
  type Type,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { getFieldStore, INTERNAL } from '@formisch/core/angular';
import * as v from 'valibot';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { injectForm } from '../../functions/index.ts';
import type { FormStore } from '../../types/index.ts';
import { loadDistComponent } from '../../vitest/loadDistComponent.ts';

const Schema = v.object({ email: v.pipe(v.string(), v.email()) });

let TestHost: Type<{ form: FormStore<typeof Schema> }>;

describe('FormischFieldRef', () => {
  beforeAll(async () => {
    const FormischField = await loadDistComponent('FormischField');
    const FormischFieldRef = await loadDistComponent('FormischFieldRef');

    @Component({
      standalone: true,
      imports: [FormischField, FormischFieldRef],
      template: `
        <formisch-field [of]="form" [path]="['email']">
          <ng-template let-field>
            <input data-testid="input" [formischFieldRef]="field.props.ref" />
          </ng-template>
        </formisch-field>
      `,
    })
    class TestHostComponent {
      form = injectForm({ schema: Schema });
    }

    TestHost = TestHostComponent as Type<{ form: FormStore<typeof Schema> }>;
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('registers the host element with the field on render', async () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const input = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-testid="input"]'
    );
    const internalFieldStore = getFieldStore(
      fixture.componentInstance.form[INTERNAL],
      ['email']
    );
    expect(internalFieldStore.elements).toContain(input);
  });

  it('unregisters the host element when destroyed', async () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const input = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-testid="input"]'
    );
    const internalFieldStore = getFieldStore(
      fixture.componentInstance.form[INTERNAL],
      ['email']
    );
    expect(internalFieldStore.elements).toContain(input);
    fixture.destroy();
    expect(internalFieldStore.elements).not.toContain(input);
  });
});
