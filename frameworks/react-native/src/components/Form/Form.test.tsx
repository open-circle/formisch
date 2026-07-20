import { handleSubmit } from '@formisch/methods/react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactElement } from 'react';
import { Pressable, Text } from 'react-native';
import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import { useForm } from '../../hooks/index.ts';
import { Form } from './Form.tsx';

const schema = v.object({
  email: v.pipe(v.string(), v.nonEmpty('Email is required')),
});

describe('Form', () => {
  test('should render a native view with children and forwarded props', () => {
    function Test(): ReactElement {
      const form = useForm({ schema });
      return (
        <Form of={form} testID="form">
          <Text testID="child">child</Text>
        </Form>
      );
    }

    render(<Test />);

    expect(screen.getByTestId('form')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  test('should call the submit handler with the validated output when submitted', async () => {
    const onSubmit = vi.fn();

    function Test(): ReactElement {
      const form = useForm({
        schema,
        initialInput: { email: 'user@example.com' },
      });
      return (
        <Form of={form}>
          <Pressable onPress={handleSubmit(form, onSubmit)}>
            <Text>Submit</Text>
          </Pressable>
        </Form>
      );
    }

    render(<Test />);

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        { email: 'user@example.com' },
        expect.any(Object)
      );
    });
  });

  test('should not call the submit handler when validation fails', async () => {
    const onSubmit = vi.fn();

    function Test(): ReactElement {
      const form = useForm({ schema, initialInput: { email: '' } });
      return (
        <Form of={form}>
          <Text testID="valid">{String(form.isValid)}</Text>
          <Pressable onPress={handleSubmit(form, onSubmit)}>
            <Text>Submit</Text>
          </Pressable>
        </Form>
      );
    }

    render(<Test />);

    const valid = screen.getByTestId('valid');

    expect(valid).toHaveTextContent('true');

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(valid).toHaveTextContent('false');
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
