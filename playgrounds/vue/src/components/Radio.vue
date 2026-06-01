<script setup lang="ts">
import type { FieldElementProps } from '@formisch/vue';
import { computed } from 'vue';

interface RadioProps {
  class?: string;
  label: string;
  value: string;
  props: FieldElementProps;
}

const props = defineProps<RadioProps>();
const model = defineModel<string | undefined>({ required: true });

const checked = computed(() => model.value === props.value);

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  model.value = target.value;
};
</script>

<template>
  <label
    class="flex cursor-pointer items-center space-x-3 font-medium select-none md:text-lg lg:text-xl"
  >
    <input
      v-bind="props.props"
      class="h-4 w-4 cursor-pointer lg:h-5 lg:w-5"
      type="radio"
      :value="value"
      :checked="checked"
      @input="handleInput"
    />
    <span>{{ label }}</span>
  </label>
</template>
