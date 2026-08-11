import { describe, expect, test } from 'vitest';
import { z } from 'zod';
import { toFormisch, transform } from '../src/index.ts';

describe('transform (zod)', () => {
  describe('leaf types', () => {
    test('should transform string schema', () => {
      const ir = transform(z.string());
      expect(ir.type).toBe('string');
      expect(ir.optional).toBe(false);
    });

    test('should transform number schema', () => {
      const ir = transform(z.number());
      expect(ir.type).toBe('number');
    });

    test('should transform boolean schema', () => {
      const ir = transform(z.boolean());
      expect(ir.type).toBe('boolean');
    });

    test('should transform date schema', () => {
      const ir = transform(z.date());
      expect(ir.type).toBe('date');
    });

    test('should transform bigint schema', () => {
      const ir = transform(z.bigint());
      expect(ir.type).toBe('bigint');
    });

    test('should transform enum as string', () => {
      const ir = transform(z.enum(['a', 'b']));
      expect(ir.type).toBe('string');
    });

    test('should transform literal as string', () => {
      const ir = transform(z.literal('x'));
      expect(ir.type).toBe('string');
    });
  });

  describe('optional/nullable', () => {
    test('should mark optional schema', () => {
      const ir = transform(z.string().optional());
      expect(ir.type).toBe('string');
      expect(ir.optional).toBe(true);
    });

    test('should mark nullable schema', () => {
      const ir = transform(z.string().nullable());
      expect(ir.type).toBe('string');
      expect(ir.optional).toBe(true);
    });

    test('should not mark required schema', () => {
      const ir = transform(z.string());
      expect(ir.optional).toBe(false);
    });
  });

  describe('object schemas', () => {
    test('should transform object with properties', () => {
      const ir = transform(z.object({ a: z.string(), b: z.number() }));
      expect(ir.type).toBe('object');
      expect(ir.properties).toBeInstanceOf(Map);
      expect(ir.properties!.get('a')!.type).toBe('string');
      expect(ir.properties!.get('b')!.type).toBe('number');
    });

    test('should transform nested objects', () => {
      const ir = transform(
        z.object({ user: z.object({ name: z.string() }) })
      );
      expect(ir.type).toBe('object');
      const userIR = ir.properties!.get('user')!;
      expect(userIR.type).toBe('object');
      expect(userIR.properties!.get('name')!.type).toBe('string');
    });

    test('should mark nested optional properties', () => {
      const ir = transform(
        z.object({ name: z.string(), email: z.string().optional() })
      );
      expect(ir.properties!.get('name')!.optional).toBe(false);
      expect(ir.properties!.get('email')!.optional).toBe(true);
    });
  });

  describe('array schemas', () => {
    test('should transform array with item', () => {
      const ir = transform(z.array(z.string()));
      expect(ir.type).toBe('array');
      expect(ir.item!.type).toBe('string');
    });

    test('should transform array of objects', () => {
      const ir = transform(z.array(z.object({ name: z.string() })));
      expect(ir.type).toBe('array');
      expect(ir.item!.type).toBe('object');
      expect(ir.item!.properties!.get('name')!.type).toBe('string');
    });
  });

  describe('getDefault', () => {
    test('should return undefined for schema without default', () => {
      const ir = transform(z.string());
      expect(ir.getDefault()).toBeUndefined();
    });

    test('should return default value', () => {
      const ir = transform(z.string().default('hello'));
      expect(ir.getDefault()).toBe('hello');
    });
  });

  describe('toFormisch wrapper', () => {
    test('should produce a FormSchema with ~formisch marker', () => {
      const schema = toFormisch(z.object({ name: z.string() }));
      expect(schema['~formisch']).toBeDefined();
      expect(schema['~formisch'].version).toBe(1);
      expect(schema['~formisch'].root.type).toBe('object');
    });

    test('should preserve ~standard passthrough', () => {
      const schema = toFormisch(z.object({ name: z.string() }));
      expect(schema['~standard']).toBeDefined();
      expect(schema['~standard'].version).toBe(1);
    });
  });
});
