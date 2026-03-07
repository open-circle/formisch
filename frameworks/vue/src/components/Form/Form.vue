<script setup lang="ts" generic="TSchema extends Schema = Schema">
import {
  INTERNAL,
  type Schema,
  type SubmitEventHandler,
  type SubmitHandler,
} from '@formisch/core/vue';
import { handleSubmit } from '@formisch/methods/vue';
import { computed } from 'vue';
import type { FormStore } from '../../types/index.ts';

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
  onSubmit: SubmitHandler<TSchema> & SubmitEventHandler<TSchema>;
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
