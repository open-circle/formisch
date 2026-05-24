<script setup lang="ts" generic="TSchema extends FormSchema = FormSchema">
import {
  type FormSchema,
  INTERNAL,
  type SubmitEventHandler,
} from '@formisch/core/vue';
import { handleSubmit } from '@formisch/methods/vue';
import { computed } from 'vue';
import type { FormStore } from '../../types/index.ts';

/**
 * Form component props interface.
 */
export interface FormProps<TSchema extends FormSchema = FormSchema> {
  /**
   * The form store instance.
   */
  of: FormStore<TSchema>;
  /**
   * The submit handler called when the form is submitted and validation succeeds.
   */
  onSubmit: SubmitEventHandler<TSchema>;
}

const props = defineProps<FormProps<TSchema>>();

const handler = computed(() => handleSubmit(props.of, props.onSubmit));
</script>

<template>
  <form
    novalidate
    :ref="
      (element) => {
        if (element) {
          // eslint-disable-next-line vue/no-mutating-props
          of[INTERNAL].element = element as HTMLFormElement;
        }
      }
    "
    @submit="handler"
  >
    <slot></slot>
  </form>
</template>
