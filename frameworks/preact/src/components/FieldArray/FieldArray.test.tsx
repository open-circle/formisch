import { insert } from '@formisch/methods/preact';
import { fireEvent, render, screen, waitFor } from '@testing-library/preact';
import type { JSX } from 'preact';
import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import { useForm } from '../../hooks/index.ts';
import type { FieldArrayStore } from '../../types/index.ts';
import { FieldArray } from './FieldArray.tsx';

const schema = v.object({ items: v.array(v.string()) });
type Schema = typeof schema;

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

    render(<Test />);

    expect(screen.getByTestId('content')).toHaveTextContent('hello');
  });

  test('should invoke children with the field array store', () => {
    const renderProp = vi.fn<
      (field: FieldArrayStore<Schema, ['items']>) => JSX.Element
    >(() => <span />);

    function Test(): JSX.Element {
      const form = useForm({ schema, initialInput: { items: ['a', 'b'] } });
      return (
        <FieldArray of={form} path={['items']}>
          {renderProp}
        </FieldArray>
      );
    }

    render(<Test />);

    expect(renderProp).toHaveBeenCalled();
    const field = renderProp.mock.lastCall![0];
    expect(field.path.value).toEqual(['items']);
    expect(field.items.value).toHaveLength(2);
    expect(field.isValid.value).toBe(true);
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
            {(field) => (
              <span data-testid="count">{field.items.value.length}</span>
            )}
          </FieldArray>
        </div>
      );
    }

    render(<Test />);

    const count = screen.getByTestId('count');

    expect(count).toHaveTextContent('2');

    fireEvent.click(screen.getByText('Add'));

    await waitFor(() => {
      expect(count).toHaveTextContent('3');
    });
  });
});
