<script setup lang="ts" generic="TSchema extends Schema = Schema">
import { Schema, SubmitHandler } from '@formisch/core/vue';
import { handleSubmit } from '@formisch/methods/vue';
import { FormStore } from '../../types/index.ts';

/**
 * Form component props interface.
 */
export interface FormProps<TSchema extends Schema = Schema> {
  /**
   * The form store instance.
   */
  of: FormStore<TSchema>;
  /**
   * The submit handler called when the form is submitted and validation succeeds.
   */
  onSubmit: SubmitHandler<TSchema>;
}

const props = defineProps<FormProps<TSchema>>();

const handler = handleSubmit(props.of, props.onSubmit) as (
  event: Event
) => void;
</script>

<template>
  <form novalidate @submit="handler">
    <slot></slot>
  </form>
</template>
