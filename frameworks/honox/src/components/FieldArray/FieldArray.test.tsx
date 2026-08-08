import { insert } from '@formisch/methods/honox';
import { fireEvent, screen, waitFor } from '@testing-library/dom';
import { flushSync } from 'hono/jsx/dom';
import type { JSX } from 'hono/jsx/jsx-runtime';
import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import { useForm } from '../../hooks/index.ts';
import type { FieldArrayStore } from '../../types/index.ts';
import { renderHono } from '../../vitest/render.tsx';
import { FieldArray } from './FieldArray.tsx';

const schema = v.object({ items: v.array(v.string()) });
type FormSchema = typeof schema;

describe('FieldArray', () => {
  test('should render JSX returned from children', () => {
    function Test(): JSX.Element {
      const form = useForm({ schema });
      return (
        <FieldArray of={form} path={['items']}>
          {() => <span data-testid="content">hello</span>}
        </FieldArray>
      );
    }

    renderHono(<Test />);

    expect(screen.getByTestId('content')).toHaveTextContent('hello');
  });

  test('should invoke children with the field array store', () => {
    const renderProp = vi.fn<
      (field: FieldArrayStore<FormSchema, ['items']>) => JSX.Element
    >(() => <span />);

    function Test(): JSX.Element {
      const form = useForm({ schema, initialInput: { items: ['a', 'b'] } });
      return (
        <FieldArray of={form} path={['items']}>
          {renderProp}
        </FieldArray>
      );
    }

    renderHono(<Test />);

    expect(renderProp).toHaveBeenCalled();
    const field = renderProp.mock.lastCall![0];
    expect(field.path).toEqual(['items']);
    expect(field.items).toHaveLength(2);
    expect(field.isValid).toBe(true);
  });

  test('should re-render when the field array store updates', async () => {
    function Test(): JSX.Element {
      const form = useForm({ schema, initialInput: { items: ['a', 'b'] } });
      return (
        <div>
          <button
            type="button"
            onClick={() => insert(form, { path: ['items'], initialInput: 'c' })}
          >
            Add
          </button>
          <FieldArray of={form} path={['items']}>
            {(field) => <span data-testid="count">{field.items.length}</span>}
          </FieldArray>
        </div>
      );
    }

    renderHono(<Test />);

    const count = screen.getByTestId('count');

    expect(count).toHaveTextContent('2');

    flushSync(() => {
      fireEvent.click(screen.getByText('Add'));
    });

    await waitFor(() => {
      expect(count).toHaveTextContent('3');
    });
  });
});
