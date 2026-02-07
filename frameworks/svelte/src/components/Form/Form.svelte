<script lang="ts" generics="TSchema extends Schema = Schema">
  import {
    INTERNAL,
    type Schema,
    type SubmitHandler,
    type SubmitEventHandler,
  } from '@formisch/core/svelte';
  import { handleSubmit } from '@formisch/methods/svelte';
  import type { FormStore } from '../../types/index.ts';
  import type { Snippet } from 'svelte';
  import type { HTMLFormAttributes } from 'svelte/elements';

  /**
   * Form component props type.
   */
  export type FormProps<TSchema extends Schema = Schema> = Omit<
    HTMLFormAttributes,
    'on:submit' | 'onsubmit' | 'novalidate'
  > & {
    /**
     * The form store instance.
     */
    of: FormStore<TSchema>;
    /**
     * The submit handler called when the form is submitted and validation succeeds.
     */
    onsubmit: SubmitHandler<TSchema> | SubmitEventHandler<TSchema>;
    /**
     * The child elements to render within the form.
     */
    children: Snippet;
  };

  let { of, onsubmit, children, ...other }: FormProps<TSchema> = $props();

  const handler = handleSubmit(of, onsubmit);
</script>

<form {...other} novalidate onsubmit={handler} bind:this={of[INTERNAL].element}>
  {@render children()}
</form>
