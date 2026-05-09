import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { flushSync, tick } from 'svelte';
import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import FieldHost from '../../vitest/FieldHost.svelte';
import { renderHook } from '../../vitest/renderHook.ts';
import UnmountHost from '../../vitest/UnmountHost.svelte';
import { createForm } from '../createForm/createForm.svelte.ts';
import { useField } from './useField.svelte.ts';

describe('useField', () => {
  describe('initialization', () => {
    test('should return field store with default state and props', () => {
      const { result } = renderHook(() => {
        const form = createForm({ schema: v.object({ name: v.string() }) });
        return useField(form, { path: ['name'] });
      });

      const field = result.current;
      expect(field.path).toEqual(['name']);
      expect(field.input).toBe(undefined);
      expect(field.errors).toBe(null);
      expect(field.isTouched).toBe(false);
      expect(field.isDirty).toBe(false);
      expect(field.isValid).toBe(true);
      expect(field.props.name).toBe('["name"]');
      expect(field.props.autofocus).toBe(false);
    });

    test('should reflect initialInput from form', () => {
      const { result } = renderHook(() => {
        const form = createForm({
          schema: v.object({ name: v.string() }),
          initialInput: { name: 'John' },
        });
        return useField(form, { path: ['name'] });
      });

      expect(result.current.input).toBe('John');
    });
  });

  describe('input updates', () => {
    test('should update input and isDirty via DOM input event', async () => {
      render(FieldHost, {
        props: {
          config: {
            schema: v.object({ name: v.string() }),
            initialInput: { name: 'initial' },
          },
          path: ['name'],
        },
      });

      const input = screen.getByTestId('input') as HTMLInputElement;
      const dirty = screen.getByTestId('dirty');
      expect(input.value).toBe('initial');
      expect(dirty).toHaveTextContent('false');

      await fireEvent.input(input, { target: { value: 'changed' } });
      flushSync();

      expect(input.value).toBe('changed');
      expect(dirty).toHaveTextContent('true');
    });

    test('should update input and trigger validation via imperative onInput', async () => {
      const { result } = renderHook(() => {
        const form = createForm({
          schema: v.object({
            email: v.pipe(v.string(), v.email('Invalid email')),
          }),
          validate: 'input',
          initialInput: { email: '' },
        });
        return useField(form, { path: ['email'] });
      });

      result.current.onInput('not-an-email');

      expect(result.current.input).toBe('not-an-email');

      await waitFor(() => {
        expect(result.current.errors).toEqual(['Invalid email']);
        expect(result.current.isValid).toBe(false);
      });
    });
  });

  describe('validation modes', () => {
    test('should run validate:"touch" on focus and flip isTouched', async () => {
      render(FieldHost, {
        props: {
          config: {
            schema: v.object({
              email: v.pipe(v.string(), v.nonEmpty('Required')),
            }),
            validate: 'touch',
            initialInput: { email: '' },
          },
          path: ['email'],
        },
      });

      const touched = screen.getByTestId('touched');
      const valid = screen.getByTestId('valid');
      expect(touched).toHaveTextContent('false');
      expect(valid).toHaveTextContent('true');

      await fireEvent.focus(screen.getByTestId('input'));

      await waitFor(() => {
        expect(touched).toHaveTextContent('true');
        expect(valid).toHaveTextContent('false');
      });
    });

    test('should run validate:"input" on input and surface errors', async () => {
      render(FieldHost, {
        props: {
          config: {
            schema: v.object({
              email: v.pipe(v.string(), v.email('Invalid email')),
            }),
            validate: 'input',
            initialInput: { email: '' },
          },
          path: ['email'],
        },
      });

      const valid = screen.getByTestId('valid');
      expect(valid).toHaveTextContent('true');

      await fireEvent.input(screen.getByTestId('input'), {
        target: { value: 'bad' },
      });

      await waitFor(() => {
        expect(valid).toHaveTextContent('false');
        expect(screen.getByTestId('error')).toHaveTextContent('Invalid email');
      });
    });

    // Svelte (and Preact, Solid, Vue) fire validation through a separate
    // `onchange` handler in `field.props`; React folds it into the same
    // handler that updates the input value.
    test('should run validate:"change" on change event', async () => {
      render(FieldHost, {
        props: {
          config: {
            schema: v.object({
              email: v.pipe(v.string(), v.email('Invalid email')),
            }),
            validate: 'change',
            initialInput: { email: 'invalid' },
          },
          path: ['email'],
        },
      });

      const valid = screen.getByTestId('valid');
      expect(valid).toHaveTextContent('true');

      await fireEvent.change(screen.getByTestId('input'));

      await waitFor(() => {
        expect(valid).toHaveTextContent('false');
      });
    });

    test('should run validate:"blur" on blur and surface errors', async () => {
      render(FieldHost, {
        props: {
          config: {
            schema: v.object({
              email: v.pipe(v.string(), v.email('Invalid email')),
            }),
            validate: 'blur',
            initialInput: { email: 'invalid' },
          },
          path: ['email'],
        },
      });

      const valid = screen.getByTestId('valid');
      expect(valid).toHaveTextContent('true');

      await fireEvent.blur(screen.getByTestId('input'));

      await waitFor(() => {
        expect(valid).toHaveTextContent('false');
      });
    });
  });

  // Note: React's `store stability` test (memoization across re-renders) is
  // omitted — Svelte runes run once per component, so reference identity is
  // structural, not a runtime contract worth asserting.

  describe('element registration', () => {
    test('should focus the registered element when validation fails on submit', async () => {
      render(FieldHost, {
        props: {
          config: {
            schema: v.object({
              email: v.pipe(v.string(), v.nonEmpty('Required')),
            }),
            initialInput: { email: '' },
          },
          path: ['email'],
          onsubmit: vi.fn(),
        },
      });

      const input = screen.getByTestId('input');
      expect(document.activeElement).not.toBe(input);

      await fireEvent.submit(screen.getByRole('form', { name: 'Test' }));
      await tick();
      flushSync();

      await waitFor(() => {
        expect(document.activeElement).toBe(input);
      });
    });

    test('should unmount cleanly when the registered element is removed', () => {
      const { unmount } = render(UnmountHost, {
        props: {
          config: { schema: v.object({ name: v.string() }) },
          path: ['name'],
        },
      });
      expect(screen.getByTestId('input')).toBeInTheDocument();

      unmount();

      expect(screen.queryByTestId('input')).toBeNull();
    });
  });
});
