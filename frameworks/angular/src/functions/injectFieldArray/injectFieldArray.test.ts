import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import * as v from 'valibot';
import { beforeEach, describe, expect, it } from 'vitest';
import { injectForm } from '../injectForm/index.ts';
import { injectFieldArray } from './injectFieldArray.ts';

const Schema = v.object({
  todos: v.array(v.object({ title: v.string() })),
});

describe('injectFieldArray', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideExperimentalZonelessChangeDetection()],
    });
  });

  function setup() {
    return TestBed.runInInjectionContext(() => {
      const form = injectForm({ schema: Schema });
      const fieldArray = injectFieldArray(form, { path: ['todos'] });
      return { form, fieldArray };
    });
  }

  it('returns the correct path', () => {
    const { fieldArray } = setup();
    expect(fieldArray.path).toEqual(['todos']);
  });

  it('initializes items as an empty signal array', () => {
    const { fieldArray } = setup();
    expect(fieldArray.items()).toEqual([]);
  });

  it('initializes errors to null', () => {
    const { fieldArray } = setup();
    expect(fieldArray.errors()).toBeNull();
  });

  it('initializes isTouched to false', () => {
    const { fieldArray } = setup();
    expect(fieldArray.isTouched()).toBe(false);
  });

  it('initializes isDirty to false', () => {
    const { fieldArray } = setup();
    expect(fieldArray.isDirty()).toBe(false);
  });

  it('initializes isValid to true', () => {
    const { fieldArray } = setup();
    expect(fieldArray.isValid()).toBe(true);
  });
});
