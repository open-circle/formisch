import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { tick } from 'svelte';
import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import FormBasicHost from './FormBasicHost.test.svelte';
import FormSubmitHost from './FormSubmitHost.test.svelte';

const schema = v.object({
  email: v.pipe(v.string(), v.nonEmpty('Email is required')),
});

describe('Form', () => {
  test('should render a form element with noValidate, children, and forwarded attributes', () => {
    render(FormBasicHost, { props: { schema, onsubmit: vi.fn() } });

    const formElement = screen.getByRole('form', { name: 'Test' });
    expect(formElement.tagName).toBe('FORM');
    expect(formElement).toHaveAttribute('novalidate');
    expect(formElement).toHaveClass('my-form');
    expect(formElement).toHaveAttribute('id', 'signup');
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  test('should call onsubmit with the validated output when submitted', async () => {
    const onsubmit = vi.fn();

    render(FormSubmitHost, {
      props: {
        schema,
        initialInput: { email: 'user@example.com' },
        onsubmit,
      },
    });

    await fireEvent.submit(screen.getByRole('form', { name: 'Test' }));

    await waitFor(() => {
      expect(onsubmit).toHaveBeenCalledWith(
        { email: 'user@example.com' },
        expect.any(Object)
      );
    });
  });

  test('should not call onsubmit when validation fails', async () => {
    const onsubmit = vi.fn();

    render(FormSubmitHost, {
      props: { schema, initialInput: { email: '' }, onsubmit },
    });

    const valid = screen.getByTestId('valid');
    expect(valid).toHaveTextContent('true');

    await fireEvent.submit(screen.getByRole('form', { name: 'Test' }));
    await tick();

    await waitFor(() => {
      expect(valid).toHaveTextContent('false');
    });

    expect(onsubmit).not.toHaveBeenCalled();
  });
});
