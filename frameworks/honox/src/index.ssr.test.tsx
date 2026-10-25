import type * as core from '@formisch/core/honox';
import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import { Field, FieldArray, Form } from './components/index.ts';
import { useForm } from './hooks/index.ts';

const tracking = vi.hoisted(() => ({ isListenerSet: false }));

vi.mock('@formisch/core/honox', async (importOriginal) => {
  const original = await importOriginal<typeof core>();
  return {
    ...original,
    setListener(listener: core.Listener | undefined) {
      tracking.isListenerSet = !!listener;
      original.setListener(listener);
    },
  };
});

// HonoX renders every island on the server first, so the adapter must also run
// with the server renderer of hono/jsx
describe('server-side rendering', () => {
  test('should render form, field and field array to string', async () => {
    const schema = v.object({
      email: v.pipe(v.string(), v.email('Invalid email')),
      todos: v.array(v.object({ label: v.string() })),
    });

    function App() {
      const form = useForm({
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
              <>
                {fieldArray.items.map((item, index) => (
                  <Field key={item} of={form} path={['todos', index, 'label']}>
                    {(field) => (
                      <input
                        {...field.props}
                        data-item={item}
                        value={field.input}
                      />
                    )}
                  </Field>
                ))}
              </>
            )}
          </FieldArray>
        </Form>
      );
    }

    const html = await (<App />).toString();

    expect(html).toContain('<form');
    expect(html).toContain('novalidate');
    expect(html).toContain('value="jane@example.com"');
    expect(html).toContain('value="First"');
    expect(html).toContain('value="Second"');
    // Array item IDs are created on the server as well
    expect(html.match(/data-item="[^"]+"/g)).toHaveLength(2);
    // No listener is left behind to track signals read after rendering
    expect(tracking.isListenerSet).toBe(false);
  });
});
