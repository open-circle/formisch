import { createId, createSignal } from '../../framework/index.ts';
import type {
  EmptyInput,
  FieldElement,
  FormischFieldIR,
  InternalFieldStore,
  InternalFormStore,
  Path,
} from '../../types/index.ts';

export function initializeFieldStore(
  internalFormStore: InternalFormStore,
  internalFieldStore: Partial<InternalFieldStore>,
  ir: FormischFieldIR,
  initialInput: unknown,
  path: Path,
  nullish = false
): void {
  internalFieldStore.ir = ir;
  internalFieldStore.name = JSON.stringify(path);
  internalFieldStore.path = path;
  internalFieldStore.isNullish = nullish;

  const initialElements: FieldElement[] = [];
  internalFieldStore.initialElements = initialElements;
  internalFieldStore.elements = initialElements;

  internalFieldStore.errors = createSignal(null);
  internalFieldStore.isTouched = createSignal(false);
  internalFieldStore.isEdited = createSignal(false);
  internalFieldStore.isDirty = createSignal(false);

  switch (ir.type) {
    case 'array': {
      if (internalFieldStore.kind && internalFieldStore.kind !== 'array') {
        throw new Error(
          `Store initialized as "${internalFieldStore.kind}" cannot be reinitialized as "array"`
        );
      }
      internalFieldStore.kind = 'array';
      if (internalFieldStore.kind === 'array') {
        internalFieldStore.children ??= [];
        if (initialInput) {
          for (
            let index = 0;
            // @ts-expect-error
            index < initialInput.length;
            index++
          ) {
            // @ts-expect-error
            internalFieldStore.children[index] = {};
            initializeFieldStore(
              internalFormStore,
              internalFieldStore.children[index],
              ir.item!,
              // @ts-expect-error
              initialInput[index],
              [...path, index]
            );
          }
        }
        const arrayInput = nullish && initialInput == null ? initialInput : true;
        internalFieldStore.initialInput = createSignal(arrayInput);
        internalFieldStore.startInput = createSignal(arrayInput);
        internalFieldStore.input = createSignal(arrayInput);
        const initialItems = internalFieldStore.children.map(createId);
        internalFieldStore.initialItems = createSignal(initialItems);
        internalFieldStore.startItems = createSignal(initialItems);
        internalFieldStore.items = createSignal(initialItems);
      }
      break;
    }
    case 'object': {
      if (internalFieldStore.kind && internalFieldStore.kind !== 'object') {
        throw new Error(
          `Store initialized as "${internalFieldStore.kind}" cannot be reinitialized as "object"`
        );
      }
      internalFieldStore.kind = 'object';
      if (internalFieldStore.kind === 'object') {
        internalFieldStore.children ??= {};
        if (ir.properties) {
          for (const [key, childIR] of ir.properties) {
            // @ts-expect-error
            internalFieldStore.children[key] ??= {};
            initializeFieldStore(
              internalFormStore,
              internalFieldStore.children[key],
              childIR,
              // @ts-expect-error
              initialInput?.[key],
              [...path, key],
              childIR.optional
            );
          }
        }
        const objectInput = nullish && initialInput == null ? initialInput : true;
        internalFieldStore.initialInput = createSignal(objectInput);
        internalFieldStore.startInput = createSignal(objectInput);
        internalFieldStore.input = createSignal(objectInput);
      }
      break;
    }
    default: {
      if (internalFieldStore.kind && internalFieldStore.kind !== 'value') {
        throw new Error(
          `Store initialized as "${internalFieldStore.kind}" cannot be reinitialized as "value"`
        );
      }
      internalFieldStore.kind = 'value';
      if (internalFieldStore.kind === 'value') {
        const valueInput =
          initialInput === undefined && !nullish
            ? internalFormStore.emptyInput[ir.type as keyof EmptyInput]
            : initialInput;
        internalFieldStore.initialInput = createSignal(valueInput);
        internalFieldStore.startInput = createSignal(valueInput);
        internalFieldStore.input = createSignal(valueInput);
      }
      break;
    }
  }
}
