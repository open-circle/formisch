import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactElement } from 'react';
import * as v from 'valibot';
import { describe, expect, test } from 'vitest';
import { useForm } from '../../hooks/index.ts';
import { Field } from './Field.tsx';

describe('Field', () => {
  describe('rendering', () => {
    test('should render children with field store', () => {
      function TestField(): ReactElement {
        const form = useForm({
          schema: v.object({ name: v.string() }),
        });

        return (
          <Field of={form} path={['name']}>
            {(field) => (
              <input
                data-testid="input"
                {...field.props}
                value={field.input ?? ''}
              />
            )}
          </Field>
        );
      }

      render(<TestField />);

      expect(screen.getByTestId('input')).toBeInTheDocument();
    });

    test('should provide field input value', () => {
      function TestFieldWithValue(): ReactElement {
        const form = useForm({
          schema: v.object({ name: v.string() }),
          initialInput: { name: 'John' },
        });

        return (
          <Field of={form} path={['name']}>
            {(field) => (
              <input
                data-testid="input"
                {...field.props}
                value={field.input ?? ''}
              />
            )}
          </Field>
        );
      }

      render(<TestFieldWithValue />);

      const input = screen.getByTestId('input') as HTMLInputElement;
      expect(input.value).toBe('John');
    });
  });

  describe('field state', () => {
    test('should provide field state to children', () => {
      function StateField(): ReactElement {
        const form = useForm({
          schema: v.object({ email: v.string() }),
        });

        return (
          <Field of={form} path={['email']}>
            {(field) => (
              <div>
                <input data-testid="input" {...field.props} />
                <span data-testid="touched">{String(field.isTouched)}</span>
                <span data-testid="dirty">{String(field.isDirty)}</span>
                <span data-testid="valid">{String(field.isValid)}</span>
              </div>
            )}
          </Field>
        );
      }

      render(<StateField />);

      expect(screen.getByTestId('touched')).toHaveTextContent('false');
      expect(screen.getByTestId('dirty')).toHaveTextContent('false');
      expect(screen.getByTestId('valid')).toHaveTextContent('true');
    });

    test('should update isTouched on focus', async () => {
      function TouchField(): ReactElement {
        const form = useForm({
          schema: v.object({ name: v.string() }),
        });

        return (
          <Field of={form} path={['name']}>
            {(field) => (
              <div>
                <input data-testid="input" {...field.props} />
                <span data-testid="touched">{String(field.isTouched)}</span>
              </div>
            )}
          </Field>
        );
      }

      render(<TouchField />);

      expect(screen.getByTestId('touched')).toHaveTextContent('false');

      fireEvent.focus(screen.getByTestId('input'));

      await waitFor(() => {
        expect(screen.getByTestId('touched')).toHaveTextContent('true');
      });
    });
  });

  describe('error handling', () => {
    test('should display errors from validation', async () => {
      function ErrorField(): ReactElement {
        const form = useForm({
          schema: v.object({
            email: v.pipe(v.string(), v.email('Invalid email')),
          }),
          validate: 'initial',
          initialInput: { email: 'invalid' },
        });

        return (
          <Field of={form} path={['email']}>
            {(field) => (
              <div>
                <input data-testid="input" {...field.props} />
                {field.errors && (
                  <span data-testid="error">{field.errors[0]}</span>
                )}
              </div>
            )}
          </Field>
        );
      }

      render(<ErrorField />);

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Invalid email');
      });
    });
  });

  describe('nested paths', () => {
    test('should handle nested object paths', () => {
      function NestedField(): ReactElement {
        const form = useForm({
          schema: v.object({
            user: v.object({
              profile: v.object({
                name: v.string(),
              }),
            }),
          }),
          initialInput: {
            user: { profile: { name: 'John' } },
          },
        });

        return (
          <Field of={form} path={['user', 'profile', 'name']}>
            {(field) => (
              <input
                data-testid="input"
                {...field.props}
                value={field.input ?? ''}
              />
            )}
          </Field>
        );
      }

      render(<NestedField />);

      const input = screen.getByTestId('input') as HTMLInputElement;
      expect(input.value).toBe('John');
    });

    test('should handle array index paths', () => {
      function ArrayField(): ReactElement {
        const form = useForm({
          schema: v.object({
            items: v.array(v.string()),
          }),
          initialInput: { items: ['first', 'second'] },
        });

        return (
          <div>
            <Field of={form} path={['items', 0]}>
              {(field) => (
                <input
                  data-testid="input-0"
                  {...field.props}
                  value={field.input ?? ''}
                />
              )}
            </Field>
            <Field of={form} path={['items', 1]}>
              {(field) => (
                <input
                  data-testid="input-1"
                  {...field.props}
                  value={field.input ?? ''}
                />
              )}
            </Field>
          </div>
        );
      }

      render(<ArrayField />);

      expect((screen.getByTestId('input-0') as HTMLInputElement).value).toBe(
        'first'
      );
      expect((screen.getByTestId('input-1') as HTMLInputElement).value).toBe(
        'second'
      );
    });
  });

  describe('props integration', () => {
    test('should provide props with correct name', () => {
      function PropsField(): ReactElement {
        const form = useForm({
          schema: v.object({ username: v.string() }),
        });

        return (
          <Field of={form} path={['username']}>
            {(field) => <input data-testid="input" {...field.props} />}
          </Field>
        );
      }

      render(<PropsField />);

      const input = screen.getByTestId('input');
      // The name is the stringified path
      expect(input).toHaveAttribute('name', '["username"]');
    });
  });
});
