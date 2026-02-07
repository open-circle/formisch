<script
  setup
  lang="ts"
  generic="TSchema extends Schema, TFieldPath extends RequiredPath"
>
import type { RequiredPath, Schema, ValidPath } from '@formisch/core/vue';
import type * as v from 'valibot';
import { useField } from '../../composables/index.ts';
import type { FieldStore, FormStore } from '../../types/index.ts';

/**
 * Field component props interface.
 */
export interface FieldProps<
  TSchema extends Schema = Schema,
  TFieldPath extends RequiredPath = RequiredPath,
> {
  /**
   * The form store to which the field belongs.
   */
  readonly of: FormStore<TSchema>;
  /**
   * The path to the field within the form schema.
   */
  readonly path: ValidPath<v.InferInput<TSchema>, TFieldPath>;
}

defineOptions({ inheritAttrs: false });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
defineSlots<{ default(props: FieldStore<TSchema, TFieldPath>): any }>();
const props = defineProps<FieldProps<TSchema, TFieldPath>>();

const field = useField(
  () => props.of,
  () => ({ path: props.path })
);
</script>

<template>
  <slot v-bind="field"></slot>
</template>
