<script
  lang="ts"
  generics="TSchema extends FormSchema, TFieldArrayPath extends RequiredPath"
>
  import type {
    RequiredPath,
    FormSchema,
    ValidArrayPath,
  } from '@formisch/core/svelte';
  import type * as v from 'valibot';
  import { useFieldArray } from '../../runes/index.ts';
  import type { FieldArrayStore, FormStore } from '../../types/index.ts';
  import type { Snippet } from 'svelte';

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
    /**
     * The render function that receives the field array store and returns JSX.
     */
    readonly children: Snippet<[FieldArrayStore<TSchema, TFieldArrayPath>]>;
  }

  let { of, path, children }: FieldArrayProps<TSchema, TFieldArrayPath> =
    $props();

  const field = useFieldArray(
    () => of,
    () => ({ path })
  );
</script>

{@render children(field)}
