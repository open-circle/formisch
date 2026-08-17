import { describe, expect, test } from 'vitest';
import * as v from 'valibot';
import { z } from 'zod';
import { toFormisch as toFormischValibot } from '@formisch/valibot';
import { toFormisch as toFormischZod } from '@formisch/zod';
import type { FormischFieldIR } from '../types/schema/ir.ts';
import { decodeFormData } from './decodeFormData/decodeFormData.ts';

/**
 * Strips the getDefault function from an IR tree for comparison, since it
 * is a closure that cannot be deep-equalled.
 */
function stripGetDefault(ir: FormischFieldIR): Record<string, unknown> {
  const result: Record<string, unknown> = {
    type: ir.type,
    optional: ir.optional,
  };
  if (ir.properties) {
    const props: Record<string, unknown> = {};
    for (const [key, child] of ir.properties) {
      props[key] = stripGetDefault(child);
    }
    result.properties = props;
  }
  if (ir.item) {
    result.item = stripGetDefault(ir.item);
  }
  return result;
}

describe('parity: valibot vs zod produce identical IR', () => {
  test('simple object with string and number', () => {
    const valibotIR = stripGetDefault(
      toFormischValibot(v.object({ name: v.string(), age: v.number() }))[
        '~formisch'
      ].root
    );
    const zodIR = stripGetDefault(
      toFormischZod(z.object({ name: z.string(), age: z.number() }))[
        '~formisch'
      ].root
    );

    expect(valibotIR).toStrictEqual(zodIR);
  });

  test('object with optional fields', () => {
    const valibotIR = stripGetDefault(
      toFormischValibot(
        v.object({
          name: v.string(),
          email: v.optional(v.string()),
          age: v.optional(v.number()),
        })
      )['~formisch'].root
    );
    const zodIR = stripGetDefault(
      toFormischZod(
        z.object({
          name: z.string(),
          email: z.string().optional(),
          age: z.number().optional(),
        })
      )['~formisch'].root
    );

    expect(valibotIR).toStrictEqual(zodIR);
  });

  test('nested objects', () => {
    const valibotIR = stripGetDefault(
      toFormischValibot(
        v.object({
          user: v.object({
            name: v.string(),
            age: v.number(),
          }),
        })
      )['~formisch'].root
    );
    const zodIR = stripGetDefault(
      toFormischZod(
        z.object({
          user: z.object({
            name: z.string(),
            age: z.number(),
          }),
        })
      )['~formisch'].root
    );

    expect(valibotIR).toStrictEqual(zodIR);
  });

  test('arrays', () => {
    const valibotIR = stripGetDefault(
      toFormischValibot(
        v.object({ tags: v.array(v.string()) })
      )['~formisch'].root
    );
    const zodIR = stripGetDefault(
      toFormischZod(z.object({ tags: z.array(z.string()) }))['~formisch'].root
    );

    expect(valibotIR).toStrictEqual(zodIR);
  });

  test('array of objects', () => {
    const valibotIR = stripGetDefault(
      toFormischValibot(
        v.object({
          items: v.array(
            v.object({ label: v.string(), done: v.boolean() })
          ),
        })
      )['~formisch'].root
    );
    const zodIR = stripGetDefault(
      toFormischZod(
        z.object({
          items: z.array(
            z.object({ label: z.string(), done: z.boolean() })
          ),
        })
      )['~formisch'].root
    );

    expect(valibotIR).toStrictEqual(zodIR);
  });
});

describe('coercion: decodeFormData is library-agnostic', () => {
  test('number field "42" decodes to 42 via valibot adapter', () => {
    const schema = toFormischValibot(v.object({ age: v.number() }));
    const formData = new FormData();
    formData.append('["age"]', '42');
    expect(decodeFormData(schema, formData)).toStrictEqual({ age: 42 });
  });

  test('number field "42" decodes to 42 via zod adapter', () => {
    const schema = toFormischZod(z.object({ age: z.number() }));
    const formData = new FormData();
    formData.append('["age"]', '42');
    expect(decodeFormData(schema, formData)).toStrictEqual({ age: 42 });
  });

  test('boolean defaults work with both adapters', () => {
    const vSchema = toFormischValibot(
      v.object({ name: v.string(), active: v.boolean() })
    );
    const zSchema = toFormischZod(
      z.object({ name: z.string(), active: z.boolean() })
    );
    const formData = new FormData();
    formData.append('["name"]', 'test');
    expect(decodeFormData(vSchema, formData)).toStrictEqual({
      name: 'test',
      active: false,
    });
    expect(decodeFormData(zSchema, formData)).toStrictEqual({
      name: 'test',
      active: false,
    });
  });
});
