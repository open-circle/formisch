import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { flushSync } from 'svelte';
import * as v from 'valibot';
import { describe, expect, test, vi } from 'vitest';
import type { FieldArrayStore } from '../../types/index.ts';
import FieldArrayChildrenHost from './FieldArrayChildrenHost.test.svelte';
import FieldArrayStoreHost from './FieldArrayStoreHost.test.svelte';
import FieldArrayUpdateHost from './FieldArrayUpdateHost.test.svelte';

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- referenced only via `typeof schema`
const schema = v.object({ items: v.array(v.string()) });
type FormSchema = typeof schema;

describe('FieldArray', () => {
  test('should render markup returned from children snippet', () => {
    render(FieldArrayChildrenHost);

    expect(screen.getByTestId('content')).toHaveTextContent('hello');
  });

  test('should invoke children snippet with the field array store', () => {
    const onField =
      vi.fn<(field: FieldArrayStore<FormSchema, ['items']>) => void>();

    render(FieldArrayStoreHost, { props: { onField } });

    expect(onField).toHaveBeenCalled();
    const field = onField.mock.lastCall![0];
    expect(field.path).toEqual(['items']);
    expect(field.items).toHaveLength(2);
    expect(field.isValid).toBe(true);
  });

  test('should re-render when the field array store updates', async () => {
    render(FieldArrayUpdateHost);

    const count = screen.getByTestId('count');
    expect(count).toHaveTextContent('2');

    await fireEvent.click(screen.getByText('Add'));
    flushSync();

    await waitFor(() => {
      expect(count).toHaveTextContent('3');
    });
  });
});
