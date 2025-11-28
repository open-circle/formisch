<script lang="ts">
  import type { FieldElementProps } from '@formisch/svelte';
  import InputErrors from './InputErrors.svelte';

  interface Props extends FieldElementProps {
    class?: string;
    label?: string;
    value?: string;
    required?: boolean;
    input: boolean | undefined;
    errors: [string, ...string[]] | null;
  }

  let {
    class: className,
    label,
    name,
    required,
    input,
    errors,
    ...fieldProps
  }: Props = $props();
</script>

<div class={['px-8 lg:px-10', className]}>
  <label class="flex select-none space-x-4 font-medium md:text-lg lg:text-xl">
    <input
      {...fieldProps}
      id={name}
      {name}
      class="mt-1 h-4 w-4 cursor-pointer lg:mt-1 lg:h-5 lg:w-5"
      checked={input}
      {required}
      type="radio"
    />
    <span>{label}</span>
    {#if required}
      <span class="ml-1 text-red-600 dark:text-red-400">*</span>
    {/if}
  </label>
  <InputErrors {name} {errors} />
</div>
