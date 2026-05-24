<script
  setup
  lang="ts"
  generic="TSchema extends FormSchema, TFieldArrayPath extends RequiredPath"
>
import type {
  FormSchema,
  RequiredPath,
  ValidArrayPath,
} from '@formisch/core/vue';
import type * as v from 'valibot';
import { useFieldArray } from '../../composables/index.ts';
import type { FieldArrayStore, FormStore } from '../../types/index.ts';

/**
 * Field array component props interface.
 */
export interface FieldArrayProps<
  TSchema extends FormSchema = FormSchema,
  TFieldArrayPath extends RequiredPath = RequiredPath,
> {
  /**
   * The form store to which the field array belongs.
   */
  readonly of: FormStore<TSchema>;
  /**
   * The path to the field array within the form schema.
   */
  readonly path: ValidArrayPath<v.InferInput<TSchema>, TFieldArrayPath>;
}

defineOptions({ inheritAttrs: false });
defineSlots<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default(props: FieldArrayStore<TSchema, TFieldArrayPath>): any;
}>();
const props = defineProps<FieldArrayProps<TSchema, TFieldArrayPath>>();

const field = useFieldArray(
  () => props.of,
  () => ({ path: props.path })
);
</script>

<template>
  <slot v-bind="field"></slot>
</template>
