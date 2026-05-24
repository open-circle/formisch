<script lang="ts">
  import { useEventListener } from '$lib/utils';
  import type { Snippet } from 'svelte';

  interface Props {
    class?: string;
    id?: string;
    expanded: boolean;
    children: Snippet;
  }

  let { class: className, id, expanded, children }: Props = $props();

  // Element reference
  let element: HTMLDivElement | undefined = $state();

  // Updates the expandable element height
  const updateElementHeight = () => {
    if (element) {
      element.style.height = `${expanded ? element.scrollHeight : 0}px`;
    }
  };

  // Update height when expanded prop changes
  $effect(() => {
    // Read `expanded` so the effect re-runs on change; height is applied next tick
    void expanded;
    setTimeout(updateElementHeight);
  });

  // Update element height when window size changes
  useEventListener('resize', () => {
    element!.style.maxHeight = '0';
    updateElementHeight();
    element!.style.maxHeight = '';
  });
</script>

<div
  bind:this={element}
  class={[
    'm-0! h-0 origin-top duration-200',
    !expanded && 'invisible -translate-y-2 scale-y-75 opacity-0',
    className,
  ]}
  {id}
  aria-hidden={!expanded}
>
  {@render children()}
</div>
