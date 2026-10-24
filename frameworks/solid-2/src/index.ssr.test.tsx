import { renderToString } from '@solidjs/web';
import { For } from 'solid-js';
import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import { Field, FieldArray, Form } from './components/index.ts';
import { createForm } from './primitives/index.ts';

// The Solid 2 entry point ships uncompiled JSX that consumers may compile for
// server-side rendering, so the adapter must also run on the server
describe('server-side rendering', () => {
  test('should render form, field and field array to string', () => {
    const schema = v.object({
      email: v.pipe(v.string(), v.email('Invalid email')),
      todos: v.array(v.object({ label: v.string() })),
    });

    const html = renderToString(() => {
      const form = createForm({
        schema,
        initialInput: {
          email: 'jane@example.com',
          todos: [{ label: 'First' }, { label: 'Second' }],
        },
      });
      return (
        <Form of={form} onSubmit={vi.fn()}>
          <Field of={form} path={['email']}>
            {(field) => <input {...field.props} value={field.input} />}
          </Field>
          <FieldArray of={form} path={['todos']}>
            {(fieldArray) => (
              <For each={fieldArray.items}>
                {(item, index) => (
                  <Field of={form} path={['todos', index(), 'label']}>
                    {(field) => (
                      <input
                        {...field.props}
                        data-item={item}
                        value={field.input}
                      />
                    )}
                  </Field>
                )}
              </For>
            )}
          </FieldArray>
        </Form>
      );
    });

    expect(html).toContain('<form');
    expect(html).toContain('novalidate');
    expect(html).toContain('value="jane@example.com"');
    expect(html).toContain('value="First"');
    expect(html).toContain('value="Second"');
    // Array item IDs are created on the server as well
    expect(html.match(/data-item="[^"]+"/g)).toHaveLength(2);
  });
});
