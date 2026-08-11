import type { FormischFieldIR, FormSchema } from '../../types/index.ts';

const NUMBER_REGEX = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/u;
const ISO_DATE_TIME_REGEX =
  /^\d{4}-(?:0[1-9]|1[0-2])-(?:[12]\d|0[1-9]|3[01])T(?:0\d|1\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?$/u;
const MAX_ARRAY_LENGTH = 5000;

function getChildIR(
  ir: FormischFieldIR | undefined,
  key: string | number
): FormischFieldIR | undefined {
  if (!ir) return undefined;
  if (ir.type === 'object' && ir.properties) return ir.properties.get(String(key));
  if (ir.type === 'array') return ir.item;
  return undefined;
}

function decodeDate(value: string): Date | null | undefined {
  if (!value || value === 'null') return null;
  if (value === 'undefined') return undefined;
  if (ISO_DATE_TIME_REGEX.test(value)) return new Date(`${value}Z`);
  return new Date(value);
}

function decodeBoolean(value: string): boolean | null | undefined {
  if (!value || value === 'null') return null;
  if (value === 'undefined') return undefined;
  return !(value === 'false' || value === 'off' || value === '0');
}

function decodeNumber(value: string): number | null | undefined {
  if (!value || value === 'null') return null;
  if (value === 'undefined') return undefined;
  if (NUMBER_REGEX.test(value)) return Number(value);
  return NaN;
}

function decodeBigint(value: string): bigint | string | null | undefined {
  if (!value || value === 'null') return null;
  if (value === 'undefined') return undefined;
  try { return BigInt(value); } catch { return value; }
}

function decodeValue(
  value: FormDataEntryValue,
  ir: FormischFieldIR | undefined
): unknown {
  if (typeof value !== 'string' || !ir) return value;
  switch (ir.type) {
    case 'number': return decodeNumber(value);
    case 'boolean': return decodeBoolean(value);
    case 'date': return decodeDate(value);
    case 'bigint': return decodeBigint(value);
    default: return value;
  }
}

function fillDefaults(
  ir: FormischFieldIR,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parent: any,
  key: string | number
): void {
  if (ir.type === 'boolean') {
    if (parent[key] === undefined) parent[key] = false;
  } else if (ir.type === 'array') {
    if (Array.isArray(parent[key])) {
      for (let index = 0; index < parent[key].length; index++) {
        fillDefaults(ir.item!, parent[key], index);
      }
    } else {
      parent[key] = [];
    }
  } else if (ir.type === 'object') {
    if (parent[key] && typeof parent[key] === 'object') {
      if (ir.properties) {
        for (const [entryKey, entryIR] of ir.properties) {
          fillDefaults(entryIR, parent[key], entryKey);
        }
      }
    }
  }
}

// @__NO_SIDE_EFFECTS__
export function decodeFormData<TSchema extends FormSchema>(
  schema: TSchema,
  formData: FormData
): unknown {
  const rootIR = schema['~formisch'].root;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const values: any = {};

  formData.forEach((value, key) => {
    let path: unknown = null;
    try { path = JSON.parse(key); } catch { /* ignore */ }

    if (
      Array.isArray(path) &&
      path.length > 0 &&
      (typeof value === 'string' || value.size > 0 || value.name !== '')
    ) {
      let parentValue = values;
      let parentIR: FormischFieldIR | undefined = rootIR;

      for (let index = 0; index < path.length; index++) {
        const segment = path[index];

        if (
          (typeof segment !== 'string' && typeof segment !== 'number') ||
          segment === '' ||
          segment === '__proto__' ||
          segment === 'prototype' ||
          segment === 'constructor'
        ) {
          break;
        }

        if (Array.isArray(parentValue)) {
          if (typeof segment === 'string') break;
          if (segment >= MAX_ARRAY_LENGTH) {
            throw new Error(`Array exceeds the maximum length of ${MAX_ARRAY_LENGTH}`);
          }
        }

        const childIR = getChildIR(parentIR, segment);

        if (index === path.length - 1) {
          if (childIR && childIR.type === 'array') {
            parentValue[segment] ??= [];
            parentValue[segment].push(decodeValue(value, childIR.item));
          } else {
            parentValue[segment] = decodeValue(value, childIR);
          }
        } else {
          if (parentValue[segment] == null) {
            parentValue[segment] = childIR?.type === 'array' ? [] : {};
          } else if (typeof parentValue[segment] !== 'object') {
            break;
          }
          parentValue = parentValue[segment];
          parentIR = childIR;
        }
      }
    }
  });

  fillDefaults(rootIR, { values }, 'values');
  return values;
}
