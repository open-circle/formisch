import { insert, remove } from '@formisch/methods/vanilla';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactElement } from 'react';
import * as v from 'valibot';
import { describe, expect, test } from 'vitest';
import { useForm } from '../../hooks/index.ts';
import { FieldArray } from './FieldArray.tsx';

describe('FieldArray', () => {
  describe('rendering', () => {
    test('should render children with field array store', () => {
      function TestFieldArray(): ReactElement {
        const form = useForm({
          schema: v.object({ items: v.array(v.string()) }),
        });

        return (
          <FieldArray of={form} path={['items']}>
            {(field) => (
              <div data-testid="container">
                <span data-testid="count">{field.items.length}</span>
              </div>
            )}
          </FieldArray>
        );
      }

      render(<TestFieldArray />);

      expect(screen.getByTestId('container')).toBeInTheDocument();
      expect(screen.getByTestId('count')).toHaveTextContent('0');
    });

    test('should display items when initial input is provided', () => {
      function TestFieldArrayWithItems(): ReactElement {
        const form = useForm({
          schema: v.object({ tags: v.array(v.string()) }),
          initialInput: { tags: ['react', 'typescript', 'vite'] },
        });

        return (
          <FieldArray of={form} path={['tags']}>
            {(field) => (
              <div>
                <span data-testid="count">{field.items.length}</span>
                <ul>
                  {field.items.map((id) => (
                    <li key={id} data-testid={`item-${id}`}>
                      {id}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </FieldArray>
        );
      }

      render(<TestFieldArrayWithItems />);

      expect(screen.getByTestId('count')).toHaveTextContent('3');
    });
  });

  describe('field array state', () => {
    test('should provide field array state to children', () => {
      function StateFieldArray(): ReactElement {
        const form = useForm({
          schema: v.object({ items: v.array(v.string()) }),
        });

        return (
          <FieldArray of={form} path={['items']}>
            {(field) => (
              <div>
                <span data-testid="touched">{String(field.isTouched)}</span>
                <span data-testid="dirty">{String(field.isDirty)}</span>
                <span data-testid="valid">{String(field.isValid)}</span>
              </div>
            )}
          </FieldArray>
        );
      }

      render(<StateFieldArray />);

      expect(screen.getByTestId('touched')).toHaveTextContent('false');
      expect(screen.getByTestId('dirty')).toHaveTextContent('false');
      expect(screen.getByTestId('valid')).toHaveTextContent('true');
    });
  });

  describe('error handling', () => {
    test('should display errors from validation', async () => {
      function ErrorFieldArray(): ReactElement {
        const form = useForm({
          schema: v.object({
            items: v.pipe(
              v.array(v.string()),
              v.minLength(2, 'Need at least 2 items')
            ),
          }),
          validate: 'initial',
          initialInput: { items: ['one'] },
        });

        return (
          <FieldArray of={form} path={['items']}>
            {(field) => (
              <div>
                <span data-testid="valid">{String(field.isValid)}</span>
                {field.errors && (
                  <span data-testid="error">{field.errors[0]}</span>
                )}
              </div>
            )}
          </FieldArray>
        );
      }

      render(<ErrorFieldArray />);

      await waitFor(() => {
        expect(screen.getByTestId('valid')).toHaveTextContent('false');
        expect(screen.getByTestId('error')).toHaveTextContent(
          'Need at least 2 items'
        );
      });
    });
  });

  describe('nested arrays', () => {
    test('should handle nested array paths', () => {
      function NestedArrayField(): ReactElement {
        const form = useForm({
          schema: v.object({
            groups: v.array(
              v.object({
                items: v.array(v.string()),
              })
            ),
          }),
          initialInput: {
            groups: [{ items: ['a', 'b'] }, { items: ['c'] }],
          },
        });

        return (
          <div>
            <FieldArray of={form} path={['groups']}>
              {(field) => (
                <span data-testid="groups-count">{field.items.length}</span>
              )}
            </FieldArray>
            <FieldArray of={form} path={['groups', 0, 'items']}>
              {(field) => (
                <span data-testid="items-0-count">{field.items.length}</span>
              )}
            </FieldArray>
            <FieldArray of={form} path={['groups', 1, 'items']}>
              {(field) => (
                <span data-testid="items-1-count">{field.items.length}</span>
              )}
            </FieldArray>
          </div>
        );
      }

      render(<NestedArrayField />);

      expect(screen.getByTestId('groups-count')).toHaveTextContent('2');
      expect(screen.getByTestId('items-0-count')).toHaveTextContent('2');
      expect(screen.getByTestId('items-1-count')).toHaveTextContent('1');
    });
  });

  describe('array of objects', () => {
    test('should handle array of objects', () => {
      function ObjectArrayField(): ReactElement {
        const form = useForm({
          schema: v.object({
            users: v.array(
              v.object({
                name: v.string(),
                email: v.string(),
              })
            ),
          }),
          initialInput: {
            users: [
              { name: 'John', email: 'john@example.com' },
              { name: 'Jane', email: 'jane@example.com' },
            ],
          },
        });

        return (
          <FieldArray of={form} path={['users']}>
            {(field) => (
              <div>
                <span data-testid="count">{field.items.length}</span>
                <ul>
                  {field.items.map((id, index) => (
                    <li key={id} data-testid={`user-${index}`}>
                      User {index}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </FieldArray>
        );
      }

      render(<ObjectArrayField />);

      expect(screen.getByTestId('count')).toHaveTextContent('2');
      expect(screen.getByTestId('user-0')).toBeInTheDocument();
      expect(screen.getByTestId('user-1')).toBeInTheDocument();
    });
  });

  describe('path property', () => {
    test('should provide correct path in field store', () => {
      function PathFieldArray(): ReactElement {
        const form = useForm({
          schema: v.object({ items: v.array(v.string()) }),
        });

        return (
          <FieldArray of={form} path={['items']}>
            {(field) => (
              <span data-testid="path">{JSON.stringify(field.path)}</span>
            )}
          </FieldArray>
        );
      }

      render(<PathFieldArray />);

      expect(screen.getByTestId('path')).toHaveTextContent('["items"]');
    });
  });

  describe('array operations reactivity', () => {
    test('should re-render when items are inserted', async () => {
      function InsertFieldArray(): ReactElement {
        const form = useForm({
          schema: v.object({ items: v.array(v.string()) }),
          initialInput: { items: ['a', 'b'] },
        });

        return (
          <div>
            <button
              onClick={() =>
                insert(form, { path: ['items'], initialInput: 'c' })
              }
            >
              Add
            </button>
            <FieldArray of={form} path={['items']}>
              {(field) => <span data-testid="count">{field.items.length}</span>}
            </FieldArray>
          </div>
        );
      }

      render(<InsertFieldArray />);

      expect(screen.getByTestId('count')).toHaveTextContent('2');

      fireEvent.click(screen.getByText('Add'));

      await waitFor(() => {
        expect(screen.getByTestId('count')).toHaveTextContent('3');
      });
    });

    test('should re-render when items are removed', async () => {
      function RemoveFieldArray(): ReactElement {
        const form = useForm({
          schema: v.object({ items: v.array(v.string()) }),
          initialInput: { items: ['a', 'b', 'c'] },
        });

        return (
          <div>
            <button onClick={() => remove(form, { path: ['items'], at: 0 })}>
              Remove
            </button>
            <FieldArray of={form} path={['items']}>
              {(field) => <span data-testid="count">{field.items.length}</span>}
            </FieldArray>
          </div>
        );
      }

      render(<RemoveFieldArray />);

      expect(screen.getByTestId('count')).toHaveTextContent('3');

      fireEvent.click(screen.getByText('Remove'));

      await waitFor(() => {
        expect(screen.getByTestId('count')).toHaveTextContent('2');
      });
    });
  });
});
