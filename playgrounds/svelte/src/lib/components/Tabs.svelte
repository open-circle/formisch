<script lang="ts">
  import { page } from '$app/state';
  import type { MouseEventHandler } from 'svelte/elements';
  import { useEventListener } from '$lib/utils';

  interface Props {
    items: string[];
  }

  let { items }: Props = $props();

  // Navigation element and indicator style
  let navElement: HTMLElement | null = $state(null);
  let indicatorStyle: { left: string; width: string } | undefined =
    $state(undefined);

  /**
   * Updates the indicator style position.
   */
  const updateIndicatorStyle = () => {
    if (!navElement) return;

    // Get active navigation element by pathname and href
    const activeElement = [...navElement.children].find(
      (e) => (e as HTMLAnchorElement).pathname === page.url.pathname
    ) as HTMLAnchorElement | undefined;

    // Update indicator style to active element or reset it to undefined
    indicatorStyle = activeElement
      ? {
          left: `${activeElement.offsetLeft || 0}px`,
          width: `${activeElement.offsetWidth || 0}px`,
        }
      : undefined;
  };

  // Update indicator style when active element changes
  $effect(() => {
    // Read the pathname so the effect re-runs on navigation; applied next tick
    void page.url.pathname;
    setTimeout(updateIndicatorStyle);
  });

  // Update indicator style when window size changes
  useEventListener('resize', updateIndicatorStyle);

  /**
   * Scrolls the current target into the view.
   */
  const scrollIntoView: MouseEventHandler<HTMLAnchorElement> = (event) => {
    event.currentTarget.scrollIntoView({
      block: 'nearest',
      inline: 'center',
    });
  };
</script>

<div class="scrollbar-none flex scroll-px-8 overflow-x-auto scroll-smooth px-8">
  <div
    class="relative flex-1 border-b-2 border-b-slate-200 dark:border-b-slate-800"
  >
    <nav class="flex space-x-8 lg:space-x-14" bind:this={navElement}>
      {#each items as item (item)}
        <a
          class={`block pb-4 lg:text-lg ${
            `/${item.toLowerCase().replace(/ /g, '-')}` === page.url.pathname
              ? 'text-sky-600 dark:text-sky-400'
              : 'hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          href={`../${item.toLowerCase().replace(/ /g, '-')}`}
          onclick={scrollIntoView}
        >
          {item}
        </a>
      {/each}
    </nav>
    <div
      class="absolute -bottom-0.5 m-0 h-0.5 rounded bg-sky-600 duration-200 dark:bg-sky-400"
      style={indicatorStyle
        ? `left: ${indicatorStyle.left}; width: ${indicatorStyle.width}`
        : ''}
    ></div>
  </div>
</div>
