import { fireEvent, render, screen, waitFor } from '@solidjs/testing-library';
import type { JSX } from 'solid-js';
import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import { createForm } from '../../primitives/index.ts';
import type { FieldStore } from '../../types/index.ts';
import { Field } from './Field.tsx';

const schema = v.object({ name: v.string() });
type FormSchema = typeof schema;

describe('Field', () => {
  test('should render JSX returned from children', () => {
    function Test(): JSX.Element {
      const form = createForm({ schema });
      return (
        <Field of={form} path={['name']}>
          {() => <span data-testid="content">hello</span>}
        </Field>
      );
    }

    render(() => <Test />);

    expect(screen.getByTestId('content')).toHaveTextContent('hello');
  });

  test('should invoke children with the field store', () => {
    const renderProp = vi.fn<
      (field: FieldStore<FormSchema, ['name']>) => JSX.Element
    >(() => <span />);

    function Test(): JSX.Element {
      const form = createForm({ schema, initialInput: { name: 'John' } });
      return (
        <Field of={form} path={['name']}>
          {renderProp}
        </Field>
      );
    }

    render(() => <Test />);

    expect(renderProp).toHaveBeenCalled();
    const field = renderProp.mock.lastCall![0];
    expect(field.path).toEqual(['name']);
    expect(field.input).toBe('John');
    expect(field.props.name).toBe('["name"]');
    expect(typeof field.props.onInput).toBe('function');
  });

  test('should re-render when the field store updates', async () => {
    function Test(): JSX.Element {
      const form = createForm({ schema, initialInput: { name: 'initial' } });
      return (
        <Field of={form} path={['name']}>
          {(field) => (
            <>
              <input
                data-testid="input"
                {...field.props}
                value={field.input ?? ''}
              />
              <span data-testid="dirty">{String(field.isDirty)}</span>
            </>
          )}
        </Field>
      );
    }

    render(() => <Test />);

    const input = screen.getByTestId('input') as HTMLInputElement;
    const dirty = screen.getByTestId('dirty');

    expect(input.value).toBe('initial');
    expect(dirty).toHaveTextContent('false');

    fireEvent.input(input, { target: { value: 'changed' } });

    await waitFor(() => {
      expect(input.value).toBe('changed');
      expect(dirty).toHaveTextContent('true');
    });
  });
});
