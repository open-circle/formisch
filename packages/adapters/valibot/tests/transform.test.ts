import * as v from 'valibot';
import { describe, expect, test } from 'vitest';
import { toFormisch, transform } from '../src/index.ts';

describe('transform (valibot)', () => {
  describe('leaf types', () => {
    test('should transform string schema', () => {
      const ir = transform(v.string());
      expect(ir.type).toBe('string');
      expect(ir.optional).toBe(false);
    });

    test('should transform number schema', () => {
      const ir = transform(v.number());
      expect(ir.type).toBe('number');
      expect(ir.optional).toBe(false);
    });

    test('should transform boolean schema', () => {
      const ir = transform(v.boolean());
      expect(ir.type).toBe('boolean');
    });

    test('should transform date schema', () => {
      const ir = transform(v.date());
      expect(ir.type).toBe('date');
    });

    test('should transform bigint schema', () => {
      const ir = transform(v.bigint());
      expect(ir.type).toBe('bigint');
    });

    test('should transform enum as string', () => {
      const ir = transform(v.enum({ a: 'a', b: 'b' }));
      expect(ir.type).toBe('string');
    });

    test('should transform literal as string', () => {
      const ir = transform(v.literal('x'));
      expect(ir.type).toBe('string');
    });
  });

  describe('optional/nullable', () => {
    test('should mark optional schema', () => {
      const ir = transform(v.optional(v.string()));
      expect(ir.type).toBe('string');
      expect(ir.optional).toBe(true);
    });

    test('should mark nullable schema', () => {
      const ir = transform(v.nullable(v.string()));
      expect(ir.type).toBe('string');
      expect(ir.optional).toBe(true);
    });

    test('should mark nullish schema', () => {
      const ir = transform(v.nullish(v.string()));
      expect(ir.type).toBe('string');
      expect(ir.optional).toBe(true);
    });

    test('should unwrap nonOptional', () => {
      const ir = transform(v.nonOptional(v.string()));
      expect(ir.type).toBe('string');
      expect(ir.optional).toBe(false);
    });

    test('should unwrap piped schema', () => {
      const ir = transform(v.pipe(v.string(), v.minLength(1)));
      expect(ir.type).toBe('string');
    });
  });

  describe('object schemas', () => {
    test('should transform object with properties', () => {
      const ir = transform(v.object({ a: v.string(), b: v.number() }));
      expect(ir.type).toBe('object');
      expect(ir.properties).toBeInstanceOf(Map);
      expect(ir.properties!.get('a')!.type).toBe('string');
      expect(ir.properties!.get('b')!.type).toBe('number');
    });

    test('should transform nested objects', () => {
      const ir = transform(
        v.object({ user: v.object({ name: v.string() }) })
      );
      expect(ir.type).toBe('object');
      const userIR = ir.properties!.get('user')!;
      expect(userIR.type).toBe('object');
      expect(userIR.properties!.get('name')!.type).toBe('string');
    });

    test('should mark nested optional properties', () => {
      const ir = transform(
        v.object({ name: v.string(), email: v.optional(v.string()) })
      );
      expect(ir.properties!.get('name')!.optional).toBe(false);
      expect(ir.properties!.get('email')!.optional).toBe(true);
    });
  });

  describe('array schemas', () => {
    test('should transform array with item', () => {
      const ir = transform(v.array(v.string()));
      expect(ir.type).toBe('array');
      expect(ir.item!.type).toBe('string');
    });

    test('should transform array of objects', () => {
      const ir = transform(v.array(v.object({ name: v.string() })));
      expect(ir.type).toBe('array');
      expect(ir.item!.type).toBe('object');
      expect(ir.item!.properties!.get('name')!.type).toBe('string');
    });
  });

  describe('lazy schemas', () => {
    test('should unwrap lazy schema', () => {
      const ir = transform(v.lazy(() => v.string()));
      expect(ir.type).toBe('string');
    });
  });

  describe('getDefault', () => {
    test('should return default for string', () => {
      const ir = transform(v.string());
      expect(ir.getDefault()).toBeUndefined();
    });

    test('should return default value when configured', () => {
      const ir = transform(v.optional(v.string(), 'hello'));
      expect(ir.getDefault()).toBe('hello');
    });
  });

  describe('toFormisch wrapper', () => {
    test('should produce a FormSchema with ~formisch marker', () => {
      const schema = toFormisch(v.object({ name: v.string() }));
      expect(schema['~formisch']).toBeDefined();
      expect(schema['~formisch'].version).toBe(1);
      expect(schema['~formisch'].root.type).toBe('object');
    });

    test('should preserve ~standard passthrough', () => {
      const schema = toFormisch(v.object({ name: v.string() }));
      expect(schema['~standard']).toBeDefined();
      expect(schema['~standard'].version).toBe(1);
    });
  });
});
