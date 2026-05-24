<script
  lang="ts"
  generics="TSchema extends FormSchema, TFieldPath extends RequiredPath"
>
  import type {
    RequiredPath,
    FormSchema,
    ValidPath,
  } from '@formisch/core/svelte';
  import type * as v from 'valibot';
  import { useField } from '../../runes/index.ts';
  import type { FieldStore, FormStore } from '../../types/index.ts';
  import type { Snippet } from 'svelte';

  /**
   * Field component props interface.
   */
  export interface FieldProps<
    TSchema extends FormSchema = FormSchema,
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
    /**
     * The render function that receives the field store and returns JSX.
     */
    readonly children: Snippet<[FieldStore<TSchema, TFieldPath>]>;
  }

  let { of, path, children }: FieldProps<TSchema, TFieldPath> = $props();

  const field = useField(
    () => of,
    () => ({ path })
  );
</script>

{@render children(field)}
