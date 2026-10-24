import { describe, expect, test } from 'vitest';
import { unwrap } from './unwrap.ts';

describe('unwrap', () => {
  test('should return the value as-is when not a function', () => {
    expect(unwrap(42)).toBe(42);
    expect(unwrap('hello')).toBe('hello');
    expect(unwrap(null)).toBe(null);
    expect(unwrap(undefined)).toBe(undefined);
    const obj = { a: 1 };
    expect(unwrap(obj)).toBe(obj);
  });

  test('should call the function and return its result when a getter', () => {
    expect(unwrap(() => 42)).toBe(42);
    const obj = { a: 1 };
    expect(unwrap(() => obj)).toBe(obj);
  });
});
