import { performCompilation, readConfiguration } from '@angular/compiler-cli';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/**
 * Angular checks templates in a type check block that plain TypeScript never
 * produces, so `vitest --typecheck` cannot see template errors. This suite
 * therefore compiles fixture components with the Angular compiler and asserts
 * the diagnostics it reports.
 *
 * The fixtures are written to disk at run time instead of being committed,
 * because the invalid one is a file full of deliberate type errors that would
 * otherwise light up in the editor forever.
 *
 * Both directions are asserted on purpose: the valid fixture must compile in
 * silence and the invalid one must produce exactly the listed errors. A change
 * that widens a path type to `any` would keep the valid fixture green while
 * silently dropping every error from the invalid one.
 */

const PACKAGE_DIR = join(dirname(fileURLToPath(import.meta.url)), '../..');
// Inside the package so the fixtures can import the sources by relative path,
// and under `tmp` because that is already ignored by git
const FIXTURE_DIR = join(PACKAGE_DIR, 'tmp/template-types');

const PRELUDE = `
import { Component, input, type InputSignal } from '@angular/core';
import type { FormSchema, RequiredPath } from '@formisch/core/angular';
import * as v from 'valibot';
import { FormischControl } from '../../src/directives/FormischControl/index.ts';
import { FormischField } from '../../src/directives/FormischField/index.ts';
import { FormischFieldArray } from '../../src/directives/FormischFieldArray/index.ts';
import { FormischForm } from '../../src/directives/FormischForm/index.ts';
import { injectForm } from '../../src/functions/index.ts';
import type { FieldStore } from '../../src/types/index.ts';

const Schema = v.object({
  heading: v.string(),
  user: v.object({ name: v.string(), age: v.number() }),
  todos: v.array(v.object({ label: v.string(), done: v.boolean() })),
});
`;

/**
 * Every correct usage. Any diagnostic here is a regression in the directives'
 * generic signatures or context guards.
 */
const VALID_FIXTURE = `${PRELUDE}
@Component({
  selector: 'valid-text-input',
  standalone: true,
  imports: [FormischControl],
  template: \`<input [formischControl]="field()" />\`,
})
export class ValidTextInput<
  TSchema extends FormSchema = FormSchema,
  TFieldPath extends RequiredPath = RequiredPath,
> {
  readonly field: InputSignal<FieldStore<TSchema, TFieldPath>> =
    input.required<FieldStore<TSchema, TFieldPath>>();
}

@Component({
  selector: 'valid-host',
  standalone: true,
  imports: [FormischForm, FormischField, FormischFieldArray, FormischControl, ValidTextInput],
  template: \`
    <form [formischForm]="form" [formischSubmit]="handleSubmit">
      <input *formischField="['heading'] of form; let field" [formischControl]="field" />
      <input *formischField="['user', 'name'] of form; let field" [formischControl]="field" />
      <span *formischField="['user', 'name'] of form; let field">{{ takesString(field.input()) }}</span>
      <span *formischField="['user', 'age'] of form; let field">{{ takesNumber(field.input()) }}</span>
      <input *formischField="['todos', 0, 'label'] of form; let field" [formischControl]="field" />
      <ng-container *formischFieldArray="['todos'] of form; let fieldArray">
        {{ takesStringArray(fieldArray.items()) }}
        @for (item of fieldArray.items(); track item; let i = $index) {
          <input *formischField="['todos', i, 'label'] of form; let field" [formischControl]="field" />
          <span *formischField="['todos', i, 'done'] of form; let field">{{ takesBoolean(field.input()) }}</span>
        }
      </ng-container>
      <valid-text-input *formischField="['user', 'name'] of form; let field" [field]="field" />
      <span *formischField="['heading'] of form; let field">{{ takesBoolean(field.isDirty()) }}</span>
    </form>
  \`,
})
export class ValidHost {
  readonly form = injectForm({ schema: Schema });
  readonly handleSubmit = (output: v.InferOutput<typeof Schema>): void => {
    this.takesString(output.heading);
  };
  takesString(value: string | undefined): string | undefined { return value; }
  takesNumber(value: number | undefined): number | undefined { return value; }
  takesBoolean(value: boolean | undefined): boolean | undefined { return value; }
  takesStringArray(value: string[]): string[] { return value; }
}
`;

/**
 * The errors the invalid fixture must produce, in source order. Each entry
 * documents the template mistake it guards against and supplies the markup
 * that must be rejected.
 */
const EXPECTED_ERRORS: readonly {
  readonly case: string;
  readonly template: string;
  readonly code: number;
  readonly message: string;
}[] = [
  {
    case: 'rejects an unknown root key',
    template: `<input *formischField="['nope'] of form; let field" [formischControl]="field" />`,
    code: 2322,
    message: `Type '"nope"' is not assignable to type '"user" | "todos" | "heading"'.`,
  },
  {
    case: 'narrows the valid keys of a nested object',
    template: `<input *formischField="['user', 'nope'] of form; let field" [formischControl]="field" />`,
    code: 2322,
    message: `Type '"nope"' is not assignable to type '"name" | "age"'.`,
  },
  {
    case: 'requires a numeric index for an array',
    template: `<input *formischField="['todos', 'label'] of form; let field" [formischControl]="field" />`,
    code: 2322,
    message: `Type 'string' is not assignable to type 'number'.`,
  },
  {
    case: 'types the field context as the value at the path (string)',
    template: `<span *formischField="['user', 'name'] of form; let field">{{ takesNumber(field.input()) }}</span>`,
    code: 2345,
    message: `Argument of type 'string | undefined' is not assignable to parameter of type 'number | undefined'.`,
  },
  {
    case: 'types the field context as the value at the path (number)',
    template: `<span *formischField="['user', 'age'] of form; let field">{{ takesString(field.input()) }}</span>`,
    code: 2345,
    message: `Argument of type 'number | undefined' is not assignable to parameter of type 'string | undefined'.`,
  },
  {
    case: 'rejects a non-array path for a field array',
    template: `<ng-container *formischFieldArray="['heading'] of form; let fieldArray">{{ fieldArray.items() }}</ng-container>`,
    code: 2322,
    message: `Type '"heading"' is not assignable to type '"todos"'.`,
  },
  {
    case: 'exposes a field array store, not a field store, as the context',
    template: `<ng-container *formischFieldArray="['todos'] of form; let fieldArray">{{ fieldArray.input() }}</ng-container>`,
    code: 2339,
    message: `Property 'input' does not exist on type 'FieldArrayStore`,
  },
];

const INVALID_FIXTURE = `${PRELUDE}
@Component({
  selector: 'invalid-host',
  standalone: true,
  imports: [FormischField, FormischFieldArray, FormischControl],
  template: \`
    ${EXPECTED_ERRORS.map(({ template }) => template).join('\n    ')}
  \`,
})
export class InvalidHost {
  readonly form = injectForm({ schema: Schema });
  takesString(value: string | undefined): string | undefined { return value; }
  takesNumber(value: number | undefined): number | undefined { return value; }
}
`;

const TSCONFIG = JSON.stringify({
  extends: '../../tsconfig.json',
  compilerOptions: { noEmit: true, types: ['node'] },
  angularCompilerOptions: { strictTemplates: true },
  include: ['../../src/**/*.ts', './valid.ts', './invalid.ts'],
  exclude: [
    '../../src/**/*.test.ts',
    '../../src/**/*.test-d.ts',
    '../../src/vitest/**/*.ts',
  ],
});

interface TemplateDiagnostic {
  readonly fileName: string;
  readonly code: number;
  readonly message: string;
}

let diagnostics: TemplateDiagnostic[];

describe('template type inference', () => {
  beforeAll(() => {
    mkdirSync(FIXTURE_DIR, { recursive: true });
    writeFileSync(join(FIXTURE_DIR, 'valid.ts'), VALID_FIXTURE);
    writeFileSync(join(FIXTURE_DIR, 'invalid.ts'), INVALID_FIXTURE);
    writeFileSync(join(FIXTURE_DIR, 'tsconfig.json'), TSCONFIG);

    const config = readConfiguration(join(FIXTURE_DIR, 'tsconfig.json'));
    expect(config.errors).toEqual([]);

    diagnostics = performCompilation({
      rootNames: config.rootNames,
      options: config.options,
    }).diagnostics.map((diagnostic) => ({
      fileName: diagnostic.file?.fileName ?? '',
      code: diagnostic.code,
      message: ts.flattenDiagnosticMessageText(diagnostic.messageText, ' '),
    }));
  }, 60_000);

  afterAll(() => {
    rmSync(FIXTURE_DIR, { recursive: true, force: true });
  });

  it('reports no errors for correct template usage', () => {
    expect(
      diagnostics.filter((diagnostic) =>
        diagnostic.fileName.endsWith('/valid.ts')
      )
    ).toEqual([]);
  });

  it('reports no errors outside the fixtures', () => {
    // A diagnostic in the library sources would make the fixtures meaningless,
    // because a directive that fails to compile degrades to `any`
    expect(
      diagnostics.filter(
        (diagnostic) =>
          !diagnostic.fileName.endsWith('/valid.ts') &&
          !diagnostic.fileName.endsWith('/invalid.ts')
      )
    ).toEqual([]);
  });

  it('reports exactly the expected errors for incorrect template usage', () => {
    const errors = diagnostics.filter((diagnostic) =>
      diagnostic.fileName.endsWith('/invalid.ts')
    );
    expect(errors.map(({ code, message }) => ({ code, message }))).toEqual(
      EXPECTED_ERRORS.map(({ code, message }) => ({
        code,
        message: expect.stringContaining(message) as unknown as string,
      }))
    );
  });

  it.each(EXPECTED_ERRORS)('$case', ({ code, message }) => {
    expect(
      diagnostics.some(
        (diagnostic) =>
          diagnostic.fileName.endsWith('/invalid.ts') &&
          diagnostic.code === code &&
          diagnostic.message.includes(message)
      )
    ).toBe(true);
  });
});
