import { renderHook } from '@testing-library/preact';
import { describe, expect, test } from 'vitest';
import { usePathSignal } from './usePathSignal.ts';

describe('usePathSignal', () => {
  test('should return a signal containing the initial path', () => {
    const { result } = renderHook(() => usePathSignal(['user', 'name']));

    expect(result.current.value).toEqual(['user', 'name']);
  });

  test('should keep the same signal reference when re-rendered with an equal path', () => {
    const { result, rerender } = renderHook(({ path }) => usePathSignal(path), {
      initialProps: { path: ['items', 0] as ['items', 0] },
    });

    const first = result.current;
    rerender({ path: ['items', 0] as ['items', 0] });
    expect(result.current).toBe(first);
    expect(result.current.value).toEqual(['items', 0]);
  });

  test('should update the signal value when re-rendered with a different path', () => {
    const { result, rerender } = renderHook(({ path }) => usePathSignal(path), {
      initialProps: { path: ['a'] as ['a' | 'b'] },
    });

    const first = result.current;
    expect(first.value).toEqual(['a']);

    rerender({ path: ['b'] });
    expect(result.current).toBe(first);
    expect(result.current.value).toEqual(['b']);
  });

  test('should update the signal value when re-rendered with a different-length path', () => {
    const { result, rerender } = renderHook(({ path }) => usePathSignal(path), {
      initialProps: { path: ['a'] as ['a'] | ['a', 'b'] },
    });

    expect(result.current.value).toEqual(['a']);

    rerender({ path: ['a', 'b'] });
    expect(result.current.value).toEqual(['a', 'b']);
  });
});
