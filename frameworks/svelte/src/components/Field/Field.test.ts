import { fireEvent, render, screen } from '@testing-library/svelte';
import { flushSync } from 'svelte';
import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import type { FieldStore } from '../../types/index.ts';
import FieldChildrenHost from './FieldChildrenHost.test.svelte';
import FieldStoreHost from './FieldStoreHost.test.svelte';
import FieldUpdateHost from './FieldUpdateHost.test.svelte';

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- referenced only via `typeof schema`
const schema = v.object({ name: v.string() });
type FormSchema = typeof schema;

describe('Field', () => {
  test('should render markup returned from children snippet', () => {
    render(FieldChildrenHost);

    expect(screen.getByTestId('content')).toHaveTextContent('hello');
  });

  test('should invoke children snippet with the field store', () => {
    const onField = vi.fn<(field: FieldStore<FormSchema, ['name']>) => void>();

    render(FieldStoreHost, { props: { onField } });

    expect(onField).toHaveBeenCalled();
    const field = onField.mock.lastCall![0];
    expect(field.path).toEqual(['name']);
    expect(field.input).toBe('John');
    expect(field.props.name).toBe('["name"]');
  });

  test('should re-render when the field store updates', async () => {
    render(FieldUpdateHost);

    const input = screen.getByTestId('input') as HTMLInputElement;
    const dirty = screen.getByTestId('dirty');

    expect(input.value).toBe('initial');
    expect(dirty).toHaveTextContent('false');

    await fireEvent.input(input, { target: { value: 'changed' } });
    flushSync();

    expect(input.value).toBe('changed');
    expect(dirty).toHaveTextContent('true');
  });
});
