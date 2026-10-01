import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const cwd = fileURLToPath(new URL('../', import.meta.url));
const common = `
  const { default: assert } = await import('node:assert/strict');
  const v = await import('valibot');
  const { createForm, useField, Form, setInput, validate } = await import('@formisch/solid');
  const { INTERNAL, getFieldStore } = await import('@formisch/solid/internals');
  const schema = v.object({ name: v.string() });
  let form;
  let field;
  const component = () => {
    form = createForm({ schema, initialInput: { name: 'initial' } });
    field = useField(form, { path: ['name'] });
    return Form({ of: form, onSubmit: () => {}, 'aria-label': 'Artifact', children: 'child' });
  };
`;

const globalConfigRegression = `
  const invalidSchema = v.object({ first: v.pipe(v.string(), v.nonEmpty()), second: v.pipe(v.string(), v.nonEmpty()) });
  let invalidForm;
  const invalidComponent = () => {
    invalidForm = createForm({ schema: invalidSchema });
    return null;
  };
  const disposeInvalid = mountInvalid(invalidComponent);
  v.setGlobalConfig({ abortEarly: true });
  try {
    const result = await validate(invalidForm);
    assert.equal(result.success, false);
    assert.equal(result.issues.length, 1, 'Formisch must use the consumer Valibot global config');
    assert.equal(getFieldStore(invalidForm[INTERNAL], ['first']).errors.value.length, 1);
    assert.equal(getFieldStore(invalidForm[INTERNAL], ['second']).errors.value, null);
  } finally {
    v.deleteGlobalConfig();
    disposeInvalid();
  }
  const resetResult = await validate(invalidForm);
  assert.equal(resetResult.issues.length, 2, 'Valibot global config must be reset');
`;

const cases = [
  {
    conditions: ['browser'],
    code: `
      import { JSDOM } from 'jsdom';
      const dom = new JSDOM('<!doctype html><html><body></body></html>');
      for (const key of ['window', 'document', 'Node', 'Element', 'HTMLElement', 'HTMLFormElement', 'HTMLInputElement', 'Text', 'Comment']) {
        globalThis[key] = dom.window[key];
      }
      const { render } = await import('@solidjs/web');
      ${common}
      const mountInvalid = (component) => render(component, document.createElement('div'));
      ${globalConfigRegression}
      const dispose = render(component, document.body);
      const formElement = document.querySelector('form');
      assert.ok(formElement, 'The public browser export must render a form');
      assert.equal(formElement.getAttribute('aria-label'), 'Artifact');
      assert.equal(document.querySelector('form').textContent, 'child');
      setInput(form, { path: ['name'], input: 'changed' });
      assert.equal(field.input, 'changed');
      assert.equal(getFieldStore(form[INTERNAL], ['name']).input.value, 'changed');
      assert.equal(form.isDirty, true);
      dispose();
      dom.window.close();
    `,
  },
  {
    conditions: [],
    code: `
      ${common}
      import { renderToString } from '@solidjs/web';
      const mountInvalid = (component) => {
        renderToString(component, { noScripts: true });
        return () => {};
      };
      ${globalConfigRegression}
      const html = renderToString(component, { noScripts: true });
      assert.match(html, /<form/);
      assert.match(html, /aria-label="Artifact"/);
      assert.match(html, /child/);
      assert.equal(field.input, 'initial');
      assert.ok(getFieldStore(form[INTERNAL], ['name']));
    `,
  },
];

// Exercise the public browser export with the same mixed conditions used by
// consumers. Solid rc.13 gives browser priority over deno, but worker wins.
cases.push({ conditions: ['deno', 'browser'], code: cases[0].code });

for (const { conditions, server } of [
  { conditions: ['browser'], server: false },
  { conditions: ['worker', 'browser'], server: true },
  { conditions: ['deno', 'browser'], server: false },
  { conditions: [], server: true },
]) {
  cases.push({
    conditions,
    code: `
      import assert from 'node:assert/strict';
      const resolutions = {
        formisch: import.meta.resolve('@formisch/solid'),
        web: import.meta.resolve('@solidjs/web'),
        solid: import.meta.resolve('solid-js'),
      };
      const webServer = resolutions.web.endsWith('/dist/server.js');
      const solidServer = resolutions.solid.endsWith('/dist/server.js');
      assert.equal(webServer, ${server}, '@solidjs/web must resolve the expected runtime');
      assert.equal(solidServer, webServer, 'solid-js and @solidjs/web must resolve the same runtime');
      assert.equal(
        resolutions.formisch,
        new URL(webServer ? './dist/index.ssr.js' : './dist/index.js', import.meta.url).href,
        'Formisch must select the same runtime as solid-js and @solidjs/web: ' + JSON.stringify(resolutions)
      );
    `,
  });
}

const failures = [];
for (const { conditions, code } of cases) {
  const result = spawnSync(
    process.execPath,
    [
      ...conditions.map((condition) => `--conditions=${condition}`),
      '--input-type=module',
      '--eval',
      code,
    ],
    { cwd, encoding: 'utf8' }
  );
  if (result.status !== 0) {
    failures.push(
      `${conditions.join(',') || 'SSR'} artifact failed:\n${result.stderr}\n${result.stdout}`
    );
  }
}
const clientSource = readFileSync(
  new URL('../dist/index.js', import.meta.url),
  'utf8'
);
if (!/import\s[^;]+from\s['"]valibot['"]/.test(clientSource)) {
  failures.push('The browser artifact must keep Valibot external');
}
if (!/import\s[^;]+from\s['"]\.\/internals\.js['"]/.test(clientSource)) {
  failures.push('The browser artifact must share the public core module');
}
assert.equal(failures.length, 0, failures.join('\n'));
console.log('Browser and SSR package artifacts passed.');
